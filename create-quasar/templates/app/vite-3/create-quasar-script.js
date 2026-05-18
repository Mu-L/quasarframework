export async function createQuasarScript({ scope, utils }) {
  await utils.promptUser(scope, {
    preset: () =>
      utils.prompts.multiselect({
        message: 'Pick features:',
        initialValues: ['sass', 'linting'],
        options: [
          {
            label: 'Sass CSS preprocessor',
            value: 'sass'
          },
          {
            label: 'Linting & Formatting (oxlint + oxfmt or ESLint + prettier)',
            value: 'linting',
            hint: 'recommended'
          },
          {
            label: 'Vue Router filename-based routing',
            value: 'filenameBasedRouting',
            hint: 'https://v2.quasar.dev/quasar-cli-vite/page-routing-with-vue-router#filename-based-routing'
          },
          {
            label: 'State Management (Pinia)',
            value: 'pinia',
            hint: 'https://pinia.vuejs.org'
          },
          {
            label: 'Internationalization (vue-i18n)',
            value: 'i18n',
            hint: 'https://vue-i18n.intlify.dev'
          }
        ]
      })
  })

  scope.preset = utils.convertArrayToObject(scope.preset)

  if (scope.preset.linting) {
    await utils.promptUser(scope, {
      linter: () =>
        utils.prompts.select({
          message: 'Project linter & formatter:',
          options: [
            {
              label: 'oxlint + oxfmt',
              value: 'oxlint',
              hint: 'recommended, but full .vue support is still in progress'
            },
            {
              label: 'ESLint + vite-plugin-checker + prettier',
              value: 'eslint'
            }
          ]
        })
    })
  }

  const log = utils.prompts.taskLog({
    title: 'Scaffolding Quasar App...'
  })

  utils.createTargetDir(scope)
  utils.renderTemplate(`${scope.scriptType}/BASE`, scope)

  const css = scope.preset.sass ? 'sass' : 'css'
  utils.renderTemplate(`${scope.scriptType}/${css}`, scope)

  if (scope.preset.i18n) utils.renderTemplate(`${scope.scriptType}/i18n`, scope)
  if (scope.preset.pinia) {
    utils.renderTemplate(`${scope.scriptType}/pinia`, scope)
  }

  if (scope.linter === 'oxlint') {
    utils.renderTemplate(`${scope.scriptType}/oxlint`, scope)
  } else if (scope.linter === 'eslint') {
    utils.renderTemplate(`${scope.scriptType}/eslint`, scope)
  }

  utils.renderTemplate(
    scope.preset.filenameBasedRouting
      ? `${scope.scriptType}/filenameBasedRouting`
      : `${scope.scriptType}/manualRouting`,
    scope
  )

  log.success('Quasar App scaffolded successfully!')
}
