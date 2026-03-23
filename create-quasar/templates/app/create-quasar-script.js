export async function createQuasarScript ({ scope, utils }) {
  await utils.prompts(scope, [
    utils.commonPrompts.scriptType
  ])

  const { createQuasarScript: create } = await import(
    `./quasar-v2/create-quasar-script.js`
  )
  await create({ scope, utils })
}
