import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'

import { AppDevserver } from '../../app-devserver.js'
import { fatal, log, warn } from '../../utils/logger.js'
import { spawn } from '../../utils/spawn.js'
import { getPackagePath } from '../../utils/get-package-path.js'
import { quasarElectronConfig } from './electron-config.js'

function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export class QuasarModeDevserver extends AppDevserver {
  #pid = 0
  #server = null
  #watcherList = []
  #killedPid = false
  #electronExecutable

  constructor(opts) {
    super(opts)

    const electronPkgPath = getPackagePath(
      'electron/package.json',
      this.ctx.appPaths.appDir
    )
    const electronPkg = JSON.parse(readFileSync(electronPkgPath, 'utf8'))

    this.#electronExecutable = join(
      dirname(electronPkgPath),
      electronPkg.bin.electron
    )

    this.registerDiff('electron', (quasarConf, diffMap) => [
      quasarConf.devServer,
      quasarConf.electron.extendElectronMainConf,
      quasarConf.electron.extendElectronPreloadConf,
      quasarConf.electron.inspectPort,
      quasarConf.electron.preloadScripts,
      quasarConf.sourceFiles.electronMain,
      quasarConf.metaConf.clientEnvDefineList,

      // extends 'rolldown' diff
      ...diffMap.rolldown(quasarConf)
    ])
  }

  run(quasarConf, __isRetry) {
    const { diff, queue } = super.run(quasarConf, __isRetry)

    if (diff('vite', quasarConf)) {
      return queue(() => this.#runVite(quasarConf))
    }

    if (diff('electron', quasarConf)) {
      return queue(() => this.#runElectronFiles(quasarConf))
    }
  }

  async #runVite(quasarConf) {
    if (this.#server !== null) {
      const watcher = this.#server
      this.#server = null
      await watcher.close()
    }

    const viteConfig = await quasarElectronConfig.vite(quasarConf)

    this.#server = await createServer(viteConfig)
    await this.#server.listen()
  }

  async #runElectronFiles(quasarConf) {
    await this.clearWatcherList(this.#watcherList, () => {
      this.#watcherList.length = 0
    })

    let isReady = false

    const cfgMain = await quasarElectronConfig.main(quasarConf)
    const cfgPreloadList =
      await quasarElectronConfig.preloadScriptList(quasarConf)

    const cfgList = [
      { banner: 'Electron Main', cfg: cfgMain },
      ...cfgPreloadList.map(preloadScript => ({
        banner: `Electron Preload (${preloadScript.scriptName})`,
        cfg: preloadScript.rolldownConfig
      }))
    ].map(({ banner, cfg }) =>
      this.watchWithRolldown(banner, cfg, () => {
        if (isReady === true) {
          this.#runElectron(quasarConf)
        }
      }).then(watcher => {
        this.#watcherList.push(watcher)
      })
    )

    return Promise.all(cfgList).then(() => {
      isReady = true
      return this.#runElectron(quasarConf)
    })
  }

  async #runElectron(quasarConf) {
    if (this.#pid) {
      log('Shutting down Electron process...')
      process.kill(this.#pid)

      this.#pid = 0
      this.#killedPid = true

      // on some OSes a small delay is needed
      // so that resources are freed on kill
      await wait(100)
    }

    this.#pid = spawn(
      this.#electronExecutable,
      [
        '--inspect=' + quasarConf.electron.inspectPort,
        this.ctx.appPaths.resolve.entry('electron-main.js')
      ].concat(this.argv._),
      { cwd: this.ctx.appPaths.appDir },
      code => {
        if (this.#killedPid === true) {
          this.#killedPid = false
          return
        }

        warn()
        fatal(
          code
            ? `Electron process ended with error code: ${code}`
            : 'Electron process was killed. Exiting...'
        )
      }
    )
  }
}
