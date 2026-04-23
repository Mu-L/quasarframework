import { basename, join } from 'node:path'

import {
  createNodeRolldownConfig,
  createViteConfig,
  extendRolldownConfig,
  extendViteConfig
} from '../../config-tools.js'

/**
 * Warning!
 *
 * Remember to update this.#registerDiff() calls when adding/removing quasarConf
 * properties needed for the build.
 */
async function preloadScript(quasarConf, name) {
  /**
   * We will be compiling to commonjs format because Electron requires
   * ESM preload scripts to run with sandbox disabled, which is a security risk
   * (Sandboxed preload scripts are run as plain JavaScript without an ESM context)
   *
   * However, should we decide going with ESM preload scripts at some point,
   * we need to change the compiled file extension to .mjs (which is also an Electron requirement)
   */

  const scriptName = basename(name)
  const cfg = createNodeRolldownConfig(quasarConf, {
    compileId: `electron-preload-${scriptName}`,
    format: 'cjs',
    shippedToClient: true
  })
  const { appPaths } = quasarConf.ctx

  cfg.input = appPaths.resolve.electron(name)
  cfg.resolve.modules = [
    'node_modules',
    appPaths.resolve.electron('node_modules')
  ]

  cfg.external.unshift('electron')

  if (quasarConf.ctx.dev) {
    cfg.output.file = appPaths.resolve.entry(`preload/${scriptName}.cjs`)

    cfg.transform.define['import.meta.env.QUASAR_PUBLIC_FOLDER'] =
      JSON.stringify(appPaths.publicDir)
  } else {
    cfg.output.file = join(
      quasarConf.build.distDir,
      `UnPackaged/preload/${scriptName}.cjs`
    )

    cfg.transform.define['import.meta.env.QUASAR_PUBLIC_FOLDER'] = '"."'

    cfg.external.push(
      ...Object.keys(quasarConf.ctx.pkg.electronPkg.dependencies || {})
    )
  }

  return {
    scriptName,
    rolldownConfig: await extendRolldownConfig(
      cfg,
      quasarConf.electron,
      quasarConf.ctx,
      'extendElectronPreloadConf'
    )
  }
}

/**
 * Warning!
 *
 * Remember to update this.#registerDiff() calls when adding/removing quasarConf
 * properties needed for the build.
 */
export const quasarElectronConfig = {
  vite: async quasarConf => {
    const cfg = await createViteConfig(quasarConf, {
      compileId: 'vite-electron',
      shippedToClient: true,
      modeDeps: [
        {
          dir: 'src-electron',
          deps: quasarConf.ctx.pkg.electronPkg.dependencies
        }
      ]
    })

    cfg.optimizeDeps.exclude = ['electron']

    if (quasarConf.ctx.prod) {
      cfg.build.outDir = join(quasarConf.build.distDir, 'UnPackaged')
    }

    return extendViteConfig(cfg, quasarConf, { isClient: true })
  },

  // returns a Promise
  main: quasarConf => {
    const cfg = createNodeRolldownConfig(quasarConf, {
      compileId: 'electron-main',
      format: 'esm',
      shippedToClient: true
    })
    const { appPaths } = quasarConf.ctx

    cfg.transform.define = {
      ...cfg.transform.define,
      ...(quasarConf.ctx.dev
        ? {
            'import.meta.env.QUASAR_ELECTRON_PRELOAD_FOLDER': JSON.stringify(
              appPaths.resolve.entry('preload')
            ),
            'import.meta.env.QUASAR_ELECTRON_PRELOAD_EXTENSION': '".cjs"',
            'import.meta.env.QUASAR_PUBLIC_FOLDER': JSON.stringify(
              appPaths.publicDir
            )
          }
        : {
            'import.meta.env.QUASAR_ELECTRON_PRELOAD_FOLDER': '"preload"',
            'import.meta.env.QUASAR_ELECTRON_PRELOAD_EXTENSION': '".cjs"',
            'import.meta.env.QUASAR_PUBLIC_FOLDER': '"."'
          })
    }

    cfg.input = quasarConf.sourceFiles.electronMain
    cfg.output.file = quasarConf.ctx.dev
      ? appPaths.resolve.entry('electron-main.js')
      : join(quasarConf.build.distDir, 'UnPackaged/electron-main.js')

    cfg.resolve.modules = [
      'node_modules',
      appPaths.resolve.electron('node_modules')
    ]
    cfg.external.unshift('electron')

    if (quasarConf.ctx.prod) {
      cfg.external.push(
        ...Object.keys(quasarConf.ctx.pkg.electronPkg.dependencies || {})
      )
    }

    return extendRolldownConfig(
      cfg,
      quasarConf.electron,
      quasarConf.ctx,
      'extendElectronMainConf'
    )
  },

  async preloadScriptList(quasarConf) {
    const list = []

    for (const name of quasarConf.electron.preloadScripts) {
      list.push(await preloadScript(quasarConf, name))
    }

    return list
  }
}

export const modeConfig = quasarElectronConfig
