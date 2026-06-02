import fs from 'node:fs'
import { parseJSON, stringifyJSON } from 'confbox'

import { log } from '../../utils/logger.js'
import { getPackageJson } from '../../utils/get-package-json.js'

// Match @capacitor/cli's loadExtConfig lookup order: .ts -> .js -> .json.
const SOURCE_EXTENSIONS = ['ts', 'js', 'json']

const sslSkipVersion = {
  5: '^0.3.0',
  6: '^0.4.0',
  7: '^0.4.0',
  8: '^0.4.0',
  default: '^0.4.0'
}

export class CapacitorConfigFile {
  runtimeEnv = null

  #ctx
  #tamperedFiles = []

  async prepare(quasarConf, target) {
    this.#ctx = quasarConf.ctx

    const { cacheProxy } = quasarConf.ctx

    this.#tamperedFiles = []
    this.runtimeEnv = this.#buildRuntimeEnv(quasarConf)

    const source = this.#resolveSource()
    const { capVersion } = await cacheProxy.getModule('capCli')

    // .ts/.js path: user's source is the authoritative config. Quasar passes its
    // runtime info to the Capacitor CLI process via env. The user's config file reads
    // it via defineCapacitorConfig and applies dev-time defaults at config-load time.
    if (source.ext !== 'json') {
      log(`Using capacitor.config.${source.ext}`)
      await this.#updateSSL(quasarConf, target, capVersion)
      return
    }

    // Legacy .json path: mutate-and-restore. Kept for backwards compatibility.
    const capJson = parseJSON(fs.readFileSync(source.path, 'utf8'))

    this.#tamperedFiles.push({
      path: source.path,
      name: 'capacitor.config.json',
      content: this.#updateCapJson(quasarConf, capJson, capVersion, target),
      originalContent: stringifyJSON(capJson)
    })

    this.#save()

    await this.#updateSSL(quasarConf, target, capVersion)
  }

  #resolveSource() {
    const { appPaths } = this.#ctx
    for (const ext of SOURCE_EXTENSIONS) {
      const path = appPaths.resolve.capacitor(`capacitor.config.${ext}`)
      if (fs.existsSync(path)) {
        return { ext, path }
      }
    }

    // No source file present. Fall back to the .json path so existing error
    // messages (e.g. "ENOENT capacitor.config.json") remain familiar.
    return {
      ext: 'json',
      path: appPaths.resolve.capacitor('capacitor.config.json')
    }
  }

  #buildRuntimeEnv(quasarConf) {
    const env = {}

    // Values in backendEnvDefineList / build.define are Vite-define-encoded
    // (bool/number/null as-is, strings JSON-quoted), so unwrap and coerce to plain strings.
    const addFromDefines = defines => {
      for (const key in defines) {
        const envKey = key.replace(/^import\.meta\.env\./, '')
        const raw = defines[key]
        try {
          const parsed = JSON.parse(raw)
          env[envKey] = typeof parsed === 'string' ? parsed : String(parsed)
        } catch {
          env[envKey] = raw
        }
      }
    }

    // Forward user-defined env vars (.env files + quasar.config.build.env) so
    // they're readable as process.env.X inside capacitor.config.{ts,js}.
    addFromDefines(quasarConf.metaConf.backendEnvDefineList)

    // Forward Quasar's own QUASAR_* defines (e.g., QUASAR_DEV)
    const quasarDefines = Object.fromEntries(
      Object.entries(quasarConf.build.define).filter(([key]) =>
        key.startsWith('import.meta.env.QUASAR_')
      )
    )
    addFromDefines(quasarDefines)

    return env
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
    const capJson = { ...originalCapCfg }

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
