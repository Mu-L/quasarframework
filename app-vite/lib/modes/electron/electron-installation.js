import fse from 'fs-extra'

import { createPromptSession, warn } from '../../utils/logger.js'
import { getPackageJson } from '../../utils/get-package-json.js'
import { isModeInstalled } from '../modes-utils.js'
import { ensureConsistency } from './electron-consistency.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean
 * }} options
 */
export async function addMode({ ctx: { appPaths, cacheProxy }, silent }) {
  if (isModeInstalled(appPaths, 'electron')) {
    await ensureConsistency({ appPaths, cacheProxy })

    if (silent !== true) {
      warn('Electron support detected already. Aborting.')
    }
    return
  }

  const promptSession = await createPromptSession('Installing Electron Mode...')

  const copyTask = promptSession.taskLog({ title: 'Creating /src-electron...' })

  fse.copySync(
    appPaths.resolve.cli(`templates/electron/common`),
    appPaths.electronDir
  )

  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  const format = hasTypescript ? 'ts' : 'js'
  fse.copySync(
    appPaths.resolve.cli(`templates/electron/${format}`),
    appPaths.electronDir
  )

  copyTask.success('Created /src-electron')

  await ensureConsistency({ appPaths, cacheProxy })

  const modePkgPath = appPaths.resolve.electron('package.json')
  const electronPkg = getPackageJson('electron', appPaths.electronDir)
  const modePkg = JSON.parse(fse.readFileSync(modePkgPath, 'utf8'))
  modePkg.devDependencies.electron = `^${electronPkg.version}`
  fse.writeFileSync(modePkgPath, JSON.stringify(modePkg, null, 2))

  promptSession.end('Electron support was added')
}
