import { join } from 'node:path'
import { merge } from 'webpack-merge'

import { aeLog, log, progress, warn } from '../../utils/logger.js'
import { AppBuilder } from '../../app-builder.js'
import { quasarElectronConfig } from './electron-config.js'
import { getPackageJson } from '../../utils/get-package-json.js'
import { getFixedDeps } from '../../utils/get-fixed-deps.js'

export class QuasarModeBuilder extends AppBuilder {
  async build() {
    this.cleanArtifacts()
    await this.#buildFiles()

    this.#copyElectronFiles()
    this.printSummary(join(this.quasarConf.build.distDir, 'UnPackaged'))

    if (this.argv['skip-pkg'] !== true) {
      await this.#packageFiles()
    }
  }

  async #buildFiles() {
    await Promise.all([
      this.#writePackageJson(),

      quasarElectronConfig
        .vite(this.quasarConf)
        .then(viteConfig => this.buildWithVite('Electron UI', viteConfig)),

      quasarElectronConfig
        .main(this.quasarConf)
        .then(mainConfig =>
          this.buildWithRolldown('Electron Main', mainConfig)
        ),

      quasarElectronConfig
        .preloadScriptList(this.quasarConf)
        .then(preloadList =>
          Promise.all(
            preloadList.map(preloadScript =>
              this.buildWithRolldown(
                `Electron Preload (${preloadScript.scriptName})`,
                preloadScript.rolldownConfig
              )
            )
          )
        )
    ])
  }

  async #writePackageJson() {
    const {
      appPaths,
      pkg: { appPkg, electronPkg }
    } = this.ctx

    let pkg = merge({}, appPkg)

    pkg.dependencies = getFixedDeps(
      electronPkg.dependencies,
      appPaths.electronDir
    )

    // we don't need this (also, faster install time & smaller bundles)
    delete pkg.devDependencies
    delete pkg.scripts
    delete pkg.quasarCli

    pkg.main = './electron-main.js'

    if (
      typeof this.quasarConf.electron.extendElectronPackageJson === 'function'
    ) {
      const overrides =
        await this.quasarConf.electron.extendElectronPackageJson(pkg)

      if (Object(overrides) === overrides) {
        pkg = merge({}, pkg, overrides)
      }
    }

    await this.ctx.appExt.runAppExtensionHook(
      'extendElectronPackageJson',
      async hook => {
        aeLog(hook.api.extId, `Running "extendElectronPackageJson(pkgJson)"`)
        const overrides = await hook.fn(pkg, hook.api)
        if (Object(overrides) === overrides) {
          pkg = merge({}, pkg, overrides)
        }
      }
    )

    this.writeFile(
      'UnPackaged/package.json',
      this.quasarConf.metaConf.debugging
        ? JSON.stringify(pkg, null, 2)
        : JSON.stringify(pkg)
    )
  }

  #copyElectronFiles() {
    const patterns = [
      '.npmrc',
      '.yarnrc',
      'package-lock.json',
      'yarn.lock',
      'src-electron/electron-assets',
      'src-electron/pnpm-workspace.yaml'
      // pnpm-lock.yaml & bun.lockb should be ignored since
      // it errors out with devDeps in package.json
      // (error: lockfile has changes, but lockfile is frozen)
    ].map(filename => ({
      from: filename,
      to: './UnPackaged'
    }))

    this.copyFiles(patterns)
  }

  async #packageFiles() {
    const { appPaths, cacheProxy } = this.ctx

    const nodePackager = await cacheProxy.getModule('nodePackager')
    nodePackager.install({
      cwd: join(this.quasarConf.build.distDir, 'UnPackaged'),
      params: this.quasarConf.electron.unPackagedInstallParams,
      displayName: 'UnPackaged production folder',
      env: 'production'
    })

    if (typeof this.quasarConf.electron.beforePackaging === 'function') {
      log('Running beforePackaging()')
      log()

      const result = this.quasarConf.electron.beforePackaging({
        appPaths,
        unpackagedDir: join(this.quasarConf.build.distDir, 'UnPackaged')
      })

      if (result && result.then) await result

      log()
      log('[SUCCESS] Done running beforePackaging()')
    }

    const bundlerName = this.quasarConf.electron.bundler
    const bundlerConfig = this.quasarConf.electron[bundlerName]

    const { getBundler } = await cacheProxy.getModule('electron')
    const bundlerResult = await getBundler(bundlerName)
    const bundler =
      bundlerResult.packager /* @electron/packager v19+ */ ||
      bundlerResult /* electron-builder */
    const pkgBanner = `electron/${bundlerName}`

    const { promise, resolve, reject } = Promise.withResolvers()
    const done = progress('Bundling app with ___...', pkgBanner)

    const bundlePromise =
      bundlerName === 'packager'
        ? bundler({
            ...bundlerConfig,
            electronVersion: getPackageJson('electron', appPaths.electronDir)
              .version
          })
        : bundler.build(bundlerConfig)

    bundlePromise
      .then(() => {
        log()
        done(`${pkgBanner} built the app`)
        log()
        resolve()
      })
      .catch(err => {
        log()
        warn(`${pkgBanner} could not build`, 'FAIL')
        log()
        console.error(err + '\n')
        reject(err)
      })

    return promise
  }
}
