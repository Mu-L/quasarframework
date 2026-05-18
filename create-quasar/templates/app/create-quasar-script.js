export async function createQuasarScript({ scope, utils }) {
  const packageName = utils.inferPackageName(scope.projectFolderName)
  await utils.promptUser(scope, {
    scriptType: utils.commonPrompts.scriptType,

    engine: () =>
      utils.prompts.select({
        message: 'Pick Quasar App CLI variant:',
        initialValue: 'vite-3',
        options: [
          {
            label: '@quasar/app-vite v3 beta',
            value: 'vite-3',
            hint: 'recommended'
          },
          {
            label: '@quasar/app-vite v2',
            value: 'vite-2',
            hint: 'deprecated'
          },
          {
            label: '@quasar/app-webpack v4',
            value: 'webpack-4',
            hint: 'deprecated'
          }
        ]
      }),

    name: () =>
      utils.prompts.text({
        message: 'Package name:',
        placeholder: packageName,
        defaultValue: packageName,
        validate: val => {
          if (!utils.isValidPackageName(val)) return 'Invalid package.json name'
        }
      }),

    productName: utils.commonPrompts.productName,
    author: utils.commonPrompts.author
  })

  const { createQuasarScript: create } = await import(
    `./${scope.engine}/create-quasar-script.js`
  )
  await create({ scope, utils })

  scope.meta.runDevCmd = 'quasar dev'
}
