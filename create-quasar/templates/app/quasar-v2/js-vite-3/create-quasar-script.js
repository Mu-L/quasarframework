export async function createQuasarScript({ scope, utils }) {
  await utils.prompts(scope, [
    {
      type: 'multiselect',
      name: 'preset',
      message: 'Check the features needed for your project:',
      choices: [
        {
          title: 'Sass CSS preprocessor',
          value: 'sass',
          selected: true
        },
        {
          title: 'Linting & Formatting (oxlint + oxfmt or ESLint + prettier)',
          value: 'linting',
          description: 'recommended',
          selected: true
        },
        {
          title: 'Vue Router filename-based routing',
          value: 'filenameBasedRouting',
          description:
            'https://v2.quasar.dev/quasar-cli-vite/page-routing-with-vue-router#filename-based-routing'
        },
        {
          title: 'State Management (Pinia)',
          value: 'pinia',
          description: 'https://pinia.vuejs.org'
        },
        {
          title: 'Internationalization (vue-i18n)',
          value: 'i18n',
          description: 'https://vue-i18n.intlify.dev'
        }
      ],
      format: utils.convertArrayToObject
    },
    {
      type: (_, { preset }) => (preset.linting ? 'select' : null),
      name: 'linter',
      message: 'Project linter & formatter:',
      choices: [
        {
          title: 'oxlint + oxfmt',
          value: 'oxlint',
          description:
            'recommended (but full .vue support is still in progress)'
        },
        {
          title: 'ESLint + vite-plugin-checker + prettier',
          value: 'eslint'
        }
      ]
    }
  ])

  utils.createTargetDir(scope)
  utils.renderTemplate('BASE', scope)

  const css = scope.preset.sass ? 'sass' : 'css'
  utils.renderTemplate(css, scope)

  if (scope.preset.i18n) utils.renderTemplate('i18n', scope)
  if (scope.preset.pinia) utils.renderTemplate('pinia', scope)

  if (scope.linter === 'oxlint') utils.renderTemplate('oxlint', scope)
  else if (scope.linter === 'eslint') utils.renderTemplate('eslint', scope)

  utils.renderTemplate(
    scope.preset.filenameBasedRouting
      ? 'filenameBasedRouting'
      : 'manualRouting',
    scope
  )
}
