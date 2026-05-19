import fse from 'fs-extra'

import { ensureConsistency } from './ssr-consistency.js'
import { createPromptSession, warn } from '../../utils/logger.js'
import { isModeInstalled } from '../modes-utils.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean
 * }} options
 */
export async function addMode({ ctx: { appPaths, cacheProxy }, silent }) {
  if (isModeInstalled(appPaths, 'ssr')) {
    await ensureConsistency({ appPaths, cacheProxy })

    if (silent !== true) {
      warn('SSR support detected already. Aborting.')
    }
    return
  }

  const promptSession = await createPromptSession('Installing SSR Mode...')

  const answer = await promptSession.prompt({
    webserver: () =>
      promptSession.select({
        message: 'What production web server should Quasar use?',
        options: [
          { value: 'hono', label: 'Hono' },
          { value: 'fastify', label: 'Fastify' },
          { value: 'express', label: 'Express' },
          { value: 'koa', label: 'Koa' }
        ]
      })
  })

  const copyTask = promptSession.taskLog({ title: 'Creating /src-ssr...' })

  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  const format = hasTypescript ? 'ts' : 'js'
  fse.copySync(
    appPaths.resolve.cli(`templates/ssr/${answer.webserver}/common`),
    appPaths.ssrDir
  )
  fse.copySync(
    appPaths.resolve.cli(`templates/ssr/${answer.webserver}/${format}`),
    appPaths.ssrDir
  )

  copyTask.success('Created /src-ssr')

  await ensureConsistency({ appPaths, cacheProxy })
  promptSession.end('SSR support was added')
}
