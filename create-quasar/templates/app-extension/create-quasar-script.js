export async function createQuasarScript ({ scope, utils }) {
  /**
   * Temporarily disable scriptType prompt (TS not ready yet)
   */

  // await utils.prompts(scope, [
  //   utils.commonPrompts.scriptType
  // ])

  // const { createQuasarScript: create } = await import(`./ae-${ scope.scriptType }/create-quasar-script.js`)
  // await create({ scope, utils })

  const { createQuasarScript: create } =
    await import('./ae-js/create-quasar-script.js')
  await create({ scope, utils })
}
