function parsePackageName(name) {
  const scopedPackageRegex = /^(@[^/]+)\/([^/]+)$/
  const match = name
    .replace(/quasar-app-extension-/, '')
    .match(scopedPackageRegex)

  return match ? { org: match[1] + '/', name: match[2] } : { org: '', name }
}

export async function createQuasarScript({ scope, utils }) {
  await utils.promptUser(scope, {
    name: () =>
      utils.prompts.text({
        message: 'AE ext-id (w/out "quasar-app-extension" in it):',
        placeholder: 'eg. "my-ext", "@my-org/my-ext"',
        validate: val => {
          if (!val) return `ext-id is required!`
          if (!utils.isValidPackageName(val)) {
            return 'Invalid App Extension name'
          }
        }
      }),

    author: utils.commonPrompts.author,

    preset: () =>
      utils.prompts.groupMultiselect({
        message: 'Pick features:',
        initialValues: ['prompts', 'install', 'uninstall', 'oxlint'],
        options: {
          'AE Scripts': [
            {
              label: 'Prompts script',
              value: 'prompts'
            },
            {
              label: 'Install script',
              value: 'install'
            },
            {
              label: 'Uninstall script',
              value: 'uninstall'
            }
          ],
          'Linting & Formatting': [
            {
              label: 'oxlint + oxfmt',
              value: 'oxlint'
            }
          ]
        }
      }),

    scriptType: utils.commonPrompts.scriptType
  })

  const log = utils.prompts.taskLog({
    title: 'Scaffolding App Extension...'
  })

  scope.preset = utils.convertArrayToObject(scope.preset)

  const { org, name } = parsePackageName(scope.name)
  scope.aeShortName = `${org}${name}`
  scope.aeFullName = `${org}quasar-app-extension-${name}`
  scope.linter = scope.preset.oxlint ? 'oxlint' : null

  utils.createTargetDir(scope)
  utils.renderTemplate(`${scope.scriptType}/BASE`, scope)

  if (scope.preset.prompts) {
    utils.renderTemplate(`${scope.scriptType}/prompts`, scope)
  }
  if (scope.preset.install) {
    utils.renderTemplate(`${scope.scriptType}/install`, scope)
  }
  if (scope.preset.uninstall) {
    utils.renderTemplate(`${scope.scriptType}/uninstall`, scope)
  }

  if (scope.preset.oxlint) {
    utils.renderTemplate(`${scope.scriptType}/oxlint`, scope)
  }

  log.success('App Extension scaffolded successfully!')

  scope.meta.packageManagersList = ['pnpm']
}
