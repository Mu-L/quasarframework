import { existsSync } from 'node:fs'

export async function ensureDeps({ appPaths, cacheProxy }) {
  if (existsSync(appPaths.resolve.ssr('node_modules'))) return

  const nodePackager = await cacheProxy.getModule('nodePackager')
  await nodePackager.install({ cwd: appPaths.ssrDir })
}

export async function ensureConsistency(opts) {
  await ensureDeps(opts)
}
