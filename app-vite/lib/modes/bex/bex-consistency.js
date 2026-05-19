import { existsSync } from 'node:fs'

export async function ensureDeps({ appPaths, cacheProxy }) {
  if (existsSync(appPaths.resolve.bex('node_modules'))) return

  const nodePackager = await cacheProxy.getModule('nodePackager')
  await nodePackager.install({ cwd: appPaths.bexDir })
}

export async function ensureConsistency(opts) {
  await ensureDeps(opts)
}
