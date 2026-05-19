import fs from 'node:fs'
import { parseJSON, stringifyJSON } from 'confbox'

import { log } from '../../utils/logger.js'
import { getPackageJson } from '../../utils/get-package-json.js'

const sslSkipVersion = {
  5: '^0.3.0',
  6: '^0.4.0',
  7: '^0.4.0',
  8: '^0.4.0',
  default: '^0.4.0'
}

export class CapacitorConfigFile {
  #ctx
  #tamperedFiles = []

  async prepare(quasarConf, target) {
    this.#ctx = quasarConf.ctx

    const { appPaths, cacheProxy } = quasarConf.ctx

    this.#updateCapPkg(quasarConf)
    log('Updated src-capacitor/package.json')

    this.#tamperedFiles = []

    // TODO: support other formats: .js and .ts
    const capJsonPath = appPaths.resolve.capacitor('capacitor.config.json')
    const capJson = parseJSON(fs.readFileSync(capJsonPath, 'utf8'))

    const { capVersion } = await cacheProxy.getModule('capCli')

    this.#tamperedFiles.push({
      path: capJsonPath,
      name: 'capacitor.config.json',
      content: this.#updateCapJson(quasarConf, capJson, capVersion, target),
      originalContent: stringifyJSON(capJson)
    })

    this.#save()

    await this.#updateSSL(quasarConf, target, capVersion)
  }

  reset() {
    if (this.#tamperedFiles.length === 0) return

    this.#tamperedFiles.forEach(file => {
      file.content = file.originalContent
    })

    this.#save()
    this.#tamperedFiles = []
  }

  #save() {
    this.#tamperedFiles.forEach(file => {
      fs.writeFileSync(file.path, file.content, 'utf8')
      log(`Updated ${file.name}`)
    })
  }

  #updateCapJson(quasarConf, originalCapCfg, capVersion, target) {
    const capJson = {
      ...originalCapCfg,
      appName:
        quasarConf.capacitor.appName ||
        this.#ctx.pkg.appPkg.productName ||
        'Quasar App'
    }

    if (quasarConf.ctx.dev) {
      capJson.server ||= {}
      capJson.server.url = quasarConf.metaConf.APP_URL
      if (target === 'android') {
        capJson.server.cleartext = true
      }
    } else {
      capJson.webDir = 'www'

      // ensure we don't run from a remote server
      if (capJson.server) {
        delete capJson.server.url
        delete capJson.server.cleartext
      }
    }

    return stringifyJSON(capJson)
  }

  #updateCapPkg(quasarConf) {
    const {
      appPaths,
      pkg: { appPkg, capacitorPkg }
    } = this.#ctx

    const capPkgPath = appPaths.resolve.capacitor('package.json')
    const capPkg = structuredClone(capacitorPkg)

    Object.assign(capPkg, {
      name: quasarConf.capacitor.appName || appPkg.name,
      version: quasarConf.capacitor.version || appPkg.version,
      description: quasarConf.capacitor.description || appPkg.description,
      author: appPkg.author
    })

    fs.writeFileSync(capPkgPath, stringifyJSON(capPkg), 'utf8')
  }

  async #updateSSL(quasarConf, target, capVersion) {
    const { appPaths, cacheProxy } = this.#ctx
    const add = quasarConf.ctx.dev ? quasarConf.devServer.https : false

    const hasPlugin =
      getPackageJson('@jcesarmobile/ssl-skip', appPaths.capacitorDir) !== void 0

    // nothing to do
    if (add ? hasPlugin : !hasPlugin) return

    const fn = `${add ? '' : 'un'}installPackage`
    const version = sslSkipVersion[capVersion] || sslSkipVersion.default
    const nameParam = add
      ? `@jcesarmobile/ssl-skip@${version}`
      : '@jcesarmobile/ssl-skip'

    const nodePackager = await cacheProxy.getModule('nodePackager')
    nodePackager[fn](nameParam, {
      cwd: appPaths.capacitorDir
    })

    // make sure "cap sync" is run before triggering IDE or build
  }
}
