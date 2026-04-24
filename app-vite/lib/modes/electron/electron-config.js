import { basename, join } from 'node:path'

import {
  createNodeRolldownConfig,
  createViteConfig,
  extendRolldownConfig,
  extendViteConfig
} from '../../config-tools.js'

import { quasarVitePluginElectronCSP } from './vite-plugin.csp.js'

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

  cfg.external = [
    'electron',
    ...Object.keys(quasarConf.ctx.pkg.electronPkg.dependencies || {})
  ]

  cfg.output.file = quasarConf.ctx.dev
    ? appPaths.resolve.entry(`electron/${scriptName}.cjs`)
    : join(quasarConf.build.distDir, `UnPackaged/${scriptName}.cjs`)

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

    if (quasarConf.electron.csp) {
      cfg.plugins.push(quasarVitePluginElectronCSP(quasarConf))
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

    cfg.input = quasarConf.sourceFiles.electronMain
    cfg.output.file = quasarConf.ctx.dev
      ? appPaths.resolve.entry('electron/electron-main.js')
      : join(quasarConf.build.distDir, 'UnPackaged/electron-main.js')

    cfg.resolve.modules = [
      'node_modules',
      appPaths.resolve.electron('node_modules')
    ]

    cfg.external = [
      'electron',
      ...Object.keys(quasarConf.ctx.pkg.electronPkg.dependencies || {})
    ]

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
