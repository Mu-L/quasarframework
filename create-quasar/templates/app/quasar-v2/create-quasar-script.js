export async function createQuasarScript({ scope, utils }) {
  await utils.prompts(scope, [
    {
      type: 'select',
      name: 'engine',
      message: 'Pick Quasar App CLI variant:',
      initial: 0,
      choices: [
        {
          title: 'Quasar App CLI with Vite',
          value: 'vite-2',
          description: 'recommended'
        },
        {
          title: 'Quasar App CLI with Webpack',
          value: 'webpack-4',
          description: 'deprecated'
        }
      ]
    },
    {
      type: 'text',
      name: 'name',
      message: 'Package name:',
      initial: () => utils.inferPackageName(scope.projectFolderName),
      validate: val =>
        utils.isValidPackageName(val) || 'Invalid package.json name'
    },

    utils.commonPrompts.productName,
    utils.commonPrompts.description
  ])

  await utils.injectAuthor(scope)

  const { createQuasarScript: create } = await import(
    `./${scope.scriptType}-${scope.engine}/create-quasar-script.js`
  )
  await create({ scope, utils })
}
