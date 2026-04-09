import { createServer } from 'vite'
import { watch as chokidarWatch } from 'chokidar'

import { AppDevserver } from '../../app-devserver.js'
import { openBrowser } from '../../utils/open-browser.js'
import { quasarPwaConfig } from './pwa-config.js'
import { buildPwaServiceWorker, injectPwaManifest } from './utils.js'
import { log } from '../../utils/logger.js'
import { debounce } from '../../utils/rate-limit.js'

export class QuasarModeDevserver extends AppDevserver {
  #server = null

  // also update ssr-devserver.js when changing here
  #pwaManifestWatcher = null
  #pwaServiceWorkerWatcher = null

  constructor(opts) {
    super(opts)

    // also update ssr-devserver.js when changing here
    this.registerDiff('pwaManifest', quasarConf => [
      quasarConf.pwa.manifestFilename,
      quasarConf.pwa.extendManifestJson
    ])

    // also update ssr-devserver.js when changing here
    this.registerDiff('vitePWA', (quasarConf, diffMap) => [
      quasarConf.pwa.injectPwaMetaTags,
      quasarConf.pwa.manifestFilename,
      quasarConf.pwa.extendManifestJson,
      quasarConf.pwa.useCredentialsForManifestTag,
      quasarConf.pwa.swFilename,

      // extends 'vite' diff
      ...diffMap.vite(quasarConf)
    ])

    // also update ssr-devserver.js when changing here
    this.registerDiff('pwaServiceWorker', quasarConf => [
      quasarConf.pwa.workboxMode,
      quasarConf.pwa.swFilename,
      quasarConf.build,
      quasarConf.pwa.workboxMode === 'GenerateSW'
        ? quasarConf.pwa.extendGenerateSWOptions
        : [
            quasarConf.pwa.extendInjectManifestOptions,
            quasarConf.pwa.swFilename,
            quasarConf.pwa.extendPWACustomSWConf,
            quasarConf.sourceFiles.pwaServiceWorker,
            quasarConf.metaConf.clientEnvDefineList
          ]
    ])
  }

  run(quasarConf, __isRetry) {
    const { diff, queue } = super.run(quasarConf, __isRetry)

    // also update ssr-devserver.js when changing here
    if (diff('pwaManifest', quasarConf) === true) {
      return queue(() => this.#compilePwaManifest(quasarConf))
    }

    // also update ssr-devserver.js when changing here
    if (diff('pwaServiceWorker', quasarConf) === true) {
      return queue(() => this.#compilePwaServiceWorker(quasarConf, queue))
    }

    // also update ssr-devserver.js when changing here
    if (diff('vitePWA', quasarConf) === true) {
      return queue(() => this.#runVite(quasarConf, diff('viteUrl', quasarConf)))
    }
  }

  async #runVite(quasarConf, urlDiffers) {
    if (this.#server !== null) {
      const watcher = this.#server
      this.#server = null
      await watcher.close()
    }

    injectPwaManifest(quasarConf, true)

    this.#server = await createServer(await quasarPwaConfig.vite(quasarConf))
    await this.#server.listen()

    this.printBanner(quasarConf)

    if (urlDiffers === true && quasarConf.metaConf.openBrowser) {
      const { metaConf } = quasarConf
      openBrowser({
        url: metaConf.APP_URL,
        opts: metaConf.openBrowser !== true ? metaConf.openBrowser : false
      })
    }
  }

  // also update ssr-devserver.js when changing here
  async #compilePwaManifest(quasarConf) {
    if (this.#pwaManifestWatcher !== null) {
      const watcher = this.#pwaManifestWatcher
      this.#pwaManifestWatcher = null
      await watcher.close()
    }

    function inject() {
      injectPwaManifest(quasarConf)
      log(
        `Generated the PWA manifest file (${quasarConf.pwa.manifestFilename})`
      )
    }

    this.#pwaManifestWatcher = chokidarWatch(
      quasarConf.metaConf.pwaManifestFile,
      {
        ignoreInitial: true
      }
    ).on(
      'change',
      debounce(() => {
        inject()
        this.#server?.ws.send({ type: 'full-reload' })
      }, 550)
    )

    inject()
  }

  // also update ssr-devserver.js when changing here
  async #compilePwaServiceWorker(quasarConf, queue) {
    if (this.#pwaServiceWorkerWatcher !== null) {
      const watcher = this.#pwaServiceWorkerWatcher
      this.#pwaServiceWorkerWatcher = null
      await watcher.close()
    }

    const workboxConfig = await quasarPwaConfig.workbox(quasarConf)

    if (quasarConf.pwa.workboxMode === 'InjectManifest') {
      const rolldownConfig = await quasarPwaConfig.customSw(quasarConf)
      await this.watchWithRolldown(
        'InjectManifest Custom SW',
        rolldownConfig,
        () => {
          queue(() => buildPwaServiceWorker(quasarConf, workboxConfig))
        }
      ).then(watcher => {
        this.#pwaServiceWorkerWatcher = watcher
      })
    }

    await buildPwaServiceWorker(quasarConf, workboxConfig)
  }
}
