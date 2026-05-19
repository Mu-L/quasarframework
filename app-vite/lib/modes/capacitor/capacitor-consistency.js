import { existsSync } from 'node:fs'
import fse from 'fs-extra'

export function ensureWWW({ appPaths, forced }) {
  const www = appPaths.resolve.capacitor('www')

  if (forced) fse.removeSync(www)

  if (!existsSync(www)) {
    fse.copySync(appPaths.resolve.cli('templates/capacitor/www'), www)
  }
}

export async function ensureDeps({ appPaths, cacheProxy }) {
  if (existsSync(appPaths.resolve.capacitor('node_modules'))) return

  const nodePackager = await cacheProxy.getModule('nodePackager')
  await nodePackager.install({
    cwd: appPaths.capacitorDir,
    params: nodePackager.name === 'pnpm' ? ['i', '--ignore-workspace'] : void 0
  })
}

export async function ensureConsistency(opts) {
  ensureWWW(opts)
  await ensureDeps(opts)
}
