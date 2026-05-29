import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { showCliBanner } from '@quasar/art'

import utils from './utils.js'

export async function createProjectFolder(scope) {
  showCliBanner()

  // should error out if already inside of a Quasar project
  utils.ensureOutsideProject()

  scope.meta = {
    hasInstalledDeps: false,
    installDepsCmd: null,
    lintCmd: null,
    runDevCmd: null,
    packageManagersList: utils.runningPackageManager
      ? [utils.runningPackageManager.name]
      : ['pnpm', 'yarn', 'npm', 'bun']
  }

  utils.prompts.intro('New Quasar Project')

  const isPnpm =
    // invoked directly, not through a package manager
    !utils.runningPackageManager ||
    // only available for pnpm
    utils.runningPackageManager.name === 'pnpm'

  await utils.promptUser(scope, {
    projectType: () =>
      utils.prompts.select({
        initialValue: 'app',
        message: 'What would you like to build?',
        options: [
          {
            label: "App with Quasar CLI, let's go!",
            value: 'app'
          },
          {
            label: 'AppExtension for Quasar CLI',
            value: 'ae',
            hint: isPnpm
              ? 'with PNPM only'
              : 'PNPM only, run "pnpm create quasar@latest" instead',
            disabled: !isPnpm
          }
        ]
      }),

    projectFolder: async () => {
      const val = await utils.prompts.text({
        message: 'Project folder:',
        placeholder: 'quasar-project',
        defaultValue: 'quasar-project'
      })

      utils.exitOnCancel(val)

      const name = val.trim()
      // inject the "short" name
      scope.projectFolderName = name
      return join(process.cwd(), name)
    }
  })

  if (
    !scope.overwrite &&
    existsSync(scope.projectFolder) &&
    readdirSync(scope.projectFolder).length !== 0
  ) {
    const val = await utils.prompts.confirm({
      message:
        (scope.projectFolderName === '.'
          ? 'Current directory'
          : `Target directory "${scope.projectFolderName}"`) +
        ' is not empty. Remove existing files and continue?',
      initialValue: false
    })

    utils.exitOnCancel(val)
    if (val === false) utils.cancelScaffolding()

    scope.overwrite = true
  }

  const { createQuasarScript } = await import(
    `./templates/${scope.projectType}/create-quasar-script.js`
  )
  await createQuasarScript({ scope, utils })

  await utils.promptUser(scope, {
    packageManager: () =>
      utils.prompts.select({
        message: 'Install project dependencies? (recommended)',
        options: [
          ...scope.meta.packageManagersList.map(pm => ({
            label: `Yes, use ${pm.toUpperCase()}`,
            value: pm,
            hint: pm === 'pnpm' || pm === 'yarn' ? 'recommended' : void 0
          })),
          { label: 'No, I will handle that myself', value: false }
        ]
      })
  })

  if (scope.packageManager !== false) {
    const hasInstalled = await utils.installDeps(scope)
    if (hasInstalled) {
      scope.meta.hasInstalledDeps = true

      if (scope.preset.linting) {
        await utils.lintFolder(scope)
      }
    }
  }

  const pkgManager = scope.packageManager || scope.meta.packageManagersList[0]
  if (!scope.meta.hasInstalledDeps) {
    scope.meta.installDepsCmd = `${pkgManager} install`

    if (scope.preset.linting) {
      scope.meta.lintCmd =
        `${pkgManager} run lint` +
        // legacy eslint:
        (scope.preset.eslint ? ' --fix' : '')
    }
  }

  if (scope.nogit) {
    utils.prompts.log.info(
      'Skipping git initialization as --nogit flag was provided'
    )
  } else {
    utils.initializeGit(scope.projectFolder)
  }

  utils.prompts.note(
    'Documentation → https://quasar.dev' +
      '\nGithub → https://github.quasar.dev' +
      '\nDiscussions → https://forum.quasar.dev' +
      '\nDiscord → https://chat.quasar.dev' +
      '\nDonations → https://donate.quasar.dev',
    'Useful links:'
  )

  const cmdList = [
    `cd ${scope.projectFolderName}`,
    scope.meta.installDepsCmd,
    scope.meta.lintCmd,
    [scope.meta.runDevCmd, `${pkgManager} run dev`]
      .filter(Boolean)
      .join(' # or: ')
  ]
    .filter(Boolean)
    .join('\n')

  utils.prompts.note(cmdList, 'To get started:')

  utils.prompts.note(
    `Quasar is relying on donations to evolve.` +
      `\nWe'd be very grateful if you can read our manifest ` +
      `\non "Why donations are important": https://quasar.dev/why-donate` +
      '\n\nDonation campaign: https://donate.quasar.dev' +
      '\nAny amount is very welcome.' +
      '\nIf invoices are required, please first contact Razvan Stoenescu.',
    'Support Quasar Development:'
  )

  utils.prompts.outro('Done. Enjoy! - Quasar Team')
}
