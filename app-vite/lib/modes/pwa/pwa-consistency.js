import { existsSync } from 'node:fs'

export async function ensureDeps({ appPaths, cacheProxy }) {
  if (existsSync(appPaths.resolve.pwa('node_modules'))) return

  const nodePackager = await cacheProxy.getModule('nodePackager')
  await nodePackager.install({ cwd: appPaths.pwaDir })
}

export async function ensureConsistency(opts) {
  await ensureDeps(opts)
}
