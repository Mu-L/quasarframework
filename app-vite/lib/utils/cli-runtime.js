import { join, normalize } from 'node:path'

import cliPkg from '../../package.json' with { type: 'json' }

const cliDir = normalize(join(import.meta.dirname, '../..'))
function resolveToCliDir(dir) {
  return join(cliDir, dir)
}

export { cliPkg, cliDir, resolveToCliDir }
