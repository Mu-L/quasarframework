#!/usr/bin/env node

import parseArgs from 'minimist'
import { dirname } from 'node:path'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    n: 'nogit'
  },

  boolean: ['n']
})

const { createProjectFolder } = await import('./create-project-folder.js')
const scope = {
  // Usage: `pnpm create quasar <project-folder>`
  projectFolder: argv._[0]?.trim(),
  // Usage: `pnpm create quasar --nogit`
  nogit: argv.nogit
}

if (scope.projectFolder) {
  scope.projectFolderName = dirname(scope.projectFolder)
}

await createProjectFolder(scope)
