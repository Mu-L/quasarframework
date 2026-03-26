import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import cliPkg from '../../package.json' with { type: 'json' }

export const cliDir = fileURLToPath(new URL('../..', import.meta.url))
export function resolveToCliDir(dir) {
  return join(cliDir, dir)
}

export { cliPkg }
