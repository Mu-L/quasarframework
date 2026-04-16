import fse from 'fs-extra'
import { basename, dirname, isAbsolute, join } from 'node:path'

import { AppTool } from './app-tool.js'
import { printBuildSummary } from '../lib/utils/print-build-summary.js'

export class AppBuilder extends AppTool {
  quasarConf

  constructor({ argv, quasarConf }) {
    super({ argv, ctx: quasarConf.ctx })
    this.quasarConf = quasarConf
  }

  readFile(filename) {
    const target = isAbsolute(filename)
      ? filename
      : join(this.quasarConf.build.distDir, filename)

    return fse.readFileSync(target, 'utf8')
  }

  writeFile(filename, content) {
    const target = isAbsolute(filename)
      ? filename
      : join(this.quasarConf.build.distDir, filename)

    fse.ensureDirSync(dirname(target))
    fse.writeFileSync(target, content, 'utf8')
  }

  copyFiles(patterns, targetFolder = this.quasarConf.build.distDir) {
    patterns.forEach(entry => {
      const from = this.ctx.appPaths.resolve.app(entry.from)
      if (!fse.existsSync(from)) return

      const to = join(targetFolder, entry.to, basename(from))
      if (entry.from !== '.npmrc') {
        fse.copySync(from, to)
        return
      }

      // handle .npmrc separately
      let content = this.readFile(from)

      if (!content.includes('shamefully-hoist')) {
        content += '\n# needed by pnpm\nshamefully-hoist=true'
      }
      // very important, otherwise PNPM creates symlinks which is NOT
      // what we want for an Electron app that should run cross-platform
      if (!content.includes('node-linker')) {
        content +=
          '\n# pnpm needs this otherwise it creates symlinks\nnode-linker=hoisted'
      }

      this.writeFile(to, content)
    })
  }

  moveFile(source, destination) {
    const input = isAbsolute(source)
      ? source
      : join(this.quasarConf.build.distDir, source)

    const output = isAbsolute(destination)
      ? destination
      : join(this.quasarConf.build.distDir, destination)

    fse.moveSync(input, output)
  }

  removeFile(filename) {
    const target = isAbsolute(filename)
      ? filename
      : join(this.quasarConf.build.distDir, filename)

    fse.removeSync(target)
  }

  printSummary(folder, showGzipped) {
    printBuildSummary(folder, showGzipped)
  }
}
