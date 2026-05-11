import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { AppBuilder } from '../../app-builder.js'
import { quasarPwaConfig } from './pwa-config.js'
import { buildPwaServiceWorker, injectPwaManifest } from './utils.js'

export class QuasarModeBuilder extends AppBuilder {
  async build() {
    await injectPwaManifest(this.quasarConf)
    await this.#buildUI()

    // also update ssr-builder.js when changing here
    writeFileSync(
      join(this.quasarConf.build.distDir, this.quasarConf.pwa.manifestFilename),
      JSON.stringify(
        this.quasarConf.htmlVariables.pwaManifest,
        null,
        this.quasarConf.build.minify !== false ? void 0 : 2
      ),
      'utf8'
    )

    await this.#buildPWA()

    this.printSummary(this.quasarConf.build.distDir, true)
  }

  async #buildUI() {
    const viteConfig = await quasarPwaConfig.vite(this.quasarConf)
    await this.buildWithVite('PWA UI', viteConfig)
  }

  async #buildPWA() {
    // also update ssr-builder.js when changing here
    if (this.quasarConf.pwa.workboxMode === 'InjectManifest') {
      const rolldownConfig = await quasarPwaConfig.customSw(this.quasarConf)
      await this.buildWithRolldown('InjectManifest Custom SW', rolldownConfig)
    }

    // also update ssr-builder.js when changing here
    const workboxConfig = await quasarPwaConfig.workbox(this.quasarConf)
    await buildPwaServiceWorker(this.quasarConf, workboxConfig)
  }
}
