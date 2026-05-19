import fse from 'fs-extra'

import { createPromptSession, warn } from '../../utils/logger.js'
import { isModeInstalled } from '../modes-utils.js'
import { ensureConsistency } from './bex-consistency.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean
 * }} options
 */
export async function addMode({ ctx: { appPaths, cacheProxy }, silent }) {
  if (isModeInstalled(appPaths, 'bex')) {
    await ensureConsistency({ appPaths, cacheProxy })

    if (silent !== true) {
      warn('BEX support detected already. Aborting.')
    }
    return
  }

  const promptSession = await createPromptSession('Installing BEX Mode...')

  const copyTask = promptSession.taskLog({ title: 'Creating /src-bex...' })

  fse.copySync(appPaths.resolve.cli('templates/bex/common'), appPaths.bexDir)

  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  const format = hasTypescript ? 'ts' : 'js'
  fse.copySync(appPaths.resolve.cli(`templates/bex/${format}`), appPaths.bexDir)

  copyTask.success('Created /src-bex')

  await ensureConsistency({ appPaths, cacheProxy })

  promptSession.end('BEX support was added')
}
