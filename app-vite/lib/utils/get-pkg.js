import { existsSync, readFileSync, statSync } from 'node:fs'
import { parseJSON } from 'confbox'

import { warning } from './logger.js'
import { getPackageJson } from '../utils/get-package-json.js'

/**
 * @param {import('../../types/app-paths').QuasarAppPaths} appPaths
 *
 * @returns {import('../../types/configuration/context').InternalQuasarContext['pkg']}
 */
export function getPkg(appPaths, mode) {
  const { appDir, cliDir } = appPaths
  const appPkgPath = appPaths.resolve.app('package.json')
  const modePkgPath = appPaths.resolve.app(`src-${mode}/package.json`)

  let appPkg = {}
  let lastAppPkgModifiedTime = 0

  function getAppPackageJson() {
    if (!existsSync(appPkgPath)) return {}

    const { mtime } = statSync(appPkgPath)

    if (mtime !== lastAppPkgModifiedTime) {
      lastAppPkgModifiedTime = mtime
      try {
        // This may get updated and written, so use parseJSON to preserve formatting
        appPkg = parseJSON(readFileSync(appPkgPath, 'utf8'))
      } catch (err) {
        warning("Could not parse app's package.json. The file is malformed:")
        console.error(err)
      }
    }

    return appPkg
  }

  let modePkg = {}
  let lastModePkgModifiedTime = 0

  function getModePackageJson() {
    if (!existsSync(modePkgPath)) return {}

    const { mtime } = statSync(modePkgPath)

    if (mtime !== lastModePkgModifiedTime) {
      lastModePkgModifiedTime = mtime
      try {
        // This may get updated and written, so use parseJSON to preserve formatting
        modePkg = parseJSON(readFileSync(modePkgPath, 'utf8'))
      } catch (err) {
        warning("Could not parse mode's package.json. The file is malformed:")
        console.error(err)
      }
    }

    return modePkg
  }

  const acc = {
    quasarPkg: getPackageJson('quasar', appDir),
    vitePkg: getPackageJson('vite', appDir) || getPackageJson('vite', cliDir)
  }

  Object.defineProperty(acc, 'appPkg', { get: getAppPackageJson })

  if (mode && mode !== 'spa') {
    Object.defineProperty(acc, 'modePkg', { get: getModePackageJson })
  }

  return acc
}
