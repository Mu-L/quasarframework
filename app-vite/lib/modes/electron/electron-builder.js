import { join } from 'node:path'
import { merge } from 'webpack-merge'

import { log, progress, warn } from '../../utils/logger.js'
import { AppBuilder } from '../../app-builder.js'
import { quasarElectronConfig } from './electron-config.js'
import { getPackageJson } from '../../utils/get-package-json.js'
import { getFixedDeps } from '../../utils/get-fixed-deps.js'

export class QuasarModeBuilder extends AppBuilder {
  async build() {
    await this.#buildFiles()
    this.#writePackageJson()
    this.#copyElectronFiles()

    this.printSummary(join(this.quasarConf.build.distDir, 'UnPackaged'))

    if (this.argv['skip-pkg'] !== true) {
      await this.#packageFiles()
    }
  }

  async #buildFiles() {
    const viteConfig = await quasarElectronConfig.vite(this.quasarConf)
    await this.buildWithVite('Electron UI', viteConfig)

    const mainConfig = await quasarElectronConfig.main(this.quasarConf)
    await this.buildWithRolldown('Electron Main', mainConfig)

    const preloadList = await quasarElectronConfig.preloadScriptList(
      this.quasarConf
    )
    for (const preloadScript of preloadList) {
      await this.buildWithRolldown(
        `Electron Preload (${preloadScript.scriptName})`,
        preloadScript.rolldownConfig
      )
    }
  }

  #writePackageJson() {
    const {
      appPaths,
      pkg: { appPkg, electronPkg }
    } = this.ctx

    const pkg = merge({}, appPkg)

    pkg.dependencies = getFixedDeps(
      electronPkg.dependencies,
      appPaths.electronDir
    )

    // we don't need this (also, faster install time & smaller bundles)
    delete pkg.devDependencies
    delete pkg.scripts
    delete pkg.quasarCli

    pkg.main = './electron-main.js'

    if (typeof this.quasarConf.electron.extendPackageJson === 'function') {
      this.quasarConf.electron.extendPackageJson(pkg)
    }

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
      'src-electron/electron-assets'
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

    return new Promise((resolve, reject) => {
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
    })
  }
}
