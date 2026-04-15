import fse from 'fs-extra'
import inquirer from 'inquirer'

import { ensureDeps } from './ensure-consistency.js'
import { log, warn } from '../../utils/logger.js'
import { isModeInstalled } from '../modes-utils.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean
 * }} options
 */
export async function addMode({ ctx: { appPaths, cacheProxy }, silent }) {
  if (isModeInstalled(appPaths, 'ssr')) {
    if (silent !== true) {
      warn('SSR support detected already. Aborting.')
    }
    return
  }

  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  const format = hasTypescript ? 'ts' : 'js'

  console.log()
  const answer = await inquirer.prompt([
    {
      type: 'select',
      name: 'webserver',
      message: 'What production web server should Quasar use?',
      choices: [
        { value: 'hono', name: 'Hono' },
        { value: 'fastify', name: 'Fastify' },
        { value: 'express', name: 'Express' },
        { value: 'koa', name: 'Koa' }
      ]
    }
  ])

  log('Creating SSR source folder...')
  fse.copySync(
    appPaths.resolve.cli(`templates/ssr/${answer.webserver}/common`),
    appPaths.ssrDir
  )
  fse.copySync(
    appPaths.resolve.cli(`templates/ssr/${answer.webserver}/${format}`),
    appPaths.ssrDir
  )

  await ensureDeps({ appPaths, cacheProxy })

  log('SSR support was added')
}

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 * }} options
 */
export function removeMode({ ctx: { appPaths } }) {
  if (!isModeInstalled(appPaths, 'ssr')) {
    warn('No SSR support detected. Aborting.')
    return
  }

  log('Removing SSR source folder')
  fse.removeSync(appPaths.ssrDir)
  log('SSR support was removed')
}
