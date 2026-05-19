import fse from 'fs-extra'
import { globSync } from 'tinyglobby'

import { createPromptSession, warn } from '../../utils/logger.js'
import { spawnSync } from '../../utils/spawn.js'

import { ensureConsistency, ensureDeps } from './capacitor-consistency.js'
import { isModeInstalled } from '../modes-utils.js'
import { renderTemplate } from '../../utils/template.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean,
 *   target: 'android' | 'ios' | undefined
 * }} options
 */
export async function addMode({
  ctx: {
    appPaths,
    cacheProxy,
    pkg: { appPkg }
  },
  silent,
  target
}) {
  if (isModeInstalled(appPaths, 'capacitor')) {
    if (target) {
      await addPlatform(target, appPaths, cacheProxy)
    } else if (silent !== true) {
      warn('Capacitor support detected already. Aborting.')
    }

    return
  }

  const appName = appPkg.productName || appPkg.name || 'Quasar App'

  if (/^[0-9]/.test(appName)) {
    warn(
      'App product name cannot start with a number. ' +
        'Please change the "productName" prop in your /package.json then try again.'
    )
    return
  }

  const promptSession = await createPromptSession(
    'Installing Capacitor Mode...'
  )

  const answer = await promptSession.prompt({
    appId: () =>
      promptSession.text({
        message: 'What is the Capacitor app id?',
        placeholder: 'org.capacitor.quasar.app',
        validate: val => {
          if (!val) return 'Please fill in a value'
        }
      })
  })

  const copyTask = promptSession.taskLog({
    title: 'Creating /src-capacitor...'
  })
  fse.ensureDirSync(appPaths.capacitorDir)

  const nodePackager = await cacheProxy.getModule('nodePackager')
  const scope = {
    appName,
    appId: answer.appId,
    pkg: appPkg,
    nodePackager: nodePackager.name
  }

  globSync(['**/*'], {
    cwd: appPaths.resolve.cli('templates/capacitor')
  }).forEach(filePath => {
    const dest = appPaths.resolve.capacitor(filePath)
    const content = fse.readFileSync(
      appPaths.resolve.cli('templates/capacitor/' + filePath),
      'utf8'
    )
    fse.ensureFileSync(dest)
    fse.writeFileSync(dest, renderTemplate(content, scope), 'utf8')
  })

  copyTask.success('Created /src-capacitor')

  await ensureDeps({ appPaths, cacheProxy })

  const { capBin } = await cacheProxy.getModule('capCli')
  await spawnSync(
    capBin,
    ['init', '--web-dir', 'www', scope.appName, scope.appId],
    {
      cwd: appPaths.capacitorDir
    }
  )

  if (target) {
    await addPlatform(target, appPaths, cacheProxy)
  } else {
    promptSession.note(
      'Capacitor support was added without any platform. ' +
        '\nYou can add Android or iOS platforms by running: ' +
        '\n "quasar dev -m capacitor -T android" or ' +
        '\n "quasar dev -m capacitor -T ios".',
      'Next step:'
    )
  }

  promptSession.end('Capacitor support was added')
}

async function addPlatform(target, appPaths, cacheProxy) {
  await ensureConsistency({ appPaths, cacheProxy })

  // if it has the platform
  if (fse.existsSync(appPaths.resolve.capacitor(target))) return

  const { capBin, capVersion } = await cacheProxy.getModule('capCli')

  const nodePackager = await cacheProxy.getModule('nodePackager')
  await nodePackager.installPackage(`@capacitor/${target}@^${capVersion}.0.0`, {
    cwd: appPaths.capacitorDir
  })

  await spawnSync(capBin, ['add', target], { cwd: appPaths.capacitorDir })
}
