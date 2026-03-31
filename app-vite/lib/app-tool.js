import { join } from 'node:path'
import fse from 'fs-extra'

import { build as viteBuild } from 'vite'
import { build as rolldownBuild, watch as rolldownWatch } from 'rolldown'

import { progress } from './utils/logger.js'

const cordovaWWW = join('src-cordova', 'www')
const capacitorWWW = join('src-capacitor', 'www')

export class AppTool {
  argv
  ctx

  constructor({ argv, ctx }) {
    this.argv = argv
    this.ctx = ctx
  }

  async buildWithVite(threadName, viteConfig) {
    // ensure clean build
    this.cleanArtifacts(viteConfig.build.outDir)

    const done = progress(
      'Compiling of ___ with Vite in progress...',
      threadName
    )

    await viteBuild(viteConfig)
    done('___ compiled with success by Vite')
  }

  watchWithRolldown(threadName, rolldownConfig, onRebuildSuccess) {
    const { promise, resolve } = Promise.withResolvers()
    const watcher = rolldownWatch({
      ...rolldownConfig,
      watch: {
        exclude: /node_modules/
      }
    })

    let isFirst = true
    let done

    watcher.on('event', event => {
      if (event.code === 'START') {
        done = progress(
          'Compiling of ___ with Rolldown in progress...',
          threadName
        )
      } else if (event.code === 'BUNDLE_END') {
        event.result.close()
      } else if (event.code === 'END') {
        done('___ compiled with success by Rolldown')

        if (isFirst === true) {
          isFirst = false
          resolve(watcher)
          return
        }

        onRebuildSuccess()
      } else if (event.code === 'ERROR') {
        console.error(event.error)
        event.result.close()
      }
    })

    return promise
  }

  async buildWithRolldown(threadName, rolldownConfig) {
    const done = progress(
      'Compiling of ___ with Rolldown in progress...',
      threadName
    )

    const rolldownResult = await rolldownBuild(rolldownConfig)

    done('___ compiled with success by Rolldown')
    return rolldownResult
  }

  cleanArtifacts(dir) {
    if (dir.endsWith(cordovaWWW)) {
      fse.emptyDirSync(dir)
    } else if (dir.endsWith(capacitorWWW)) {
      const { appPaths } = this.ctx

      fse.emptyDirSync(dir)
      fse.copySync(
        appPaths.resolve.cli('templates/capacitor/www'),
        appPaths.resolve.capacitor('www')
      )
    } else {
      fse.removeSync(dir)
    }
  }
}
