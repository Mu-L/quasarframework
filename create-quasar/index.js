#!/usr/bin/env node

import parseArgs from 'minimist'

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    n: 'nogit'
  },

  boolean: ['n']
})

const { createProjectFolder } = await import('./create-project-folder.js')
await createProjectFolder({
  // Usage: `pnpm create quasar <project-folder>`
  projectFolder: argv._[0]?.trim(),
  // Usage: `pnpm create quasar --nogit`
  nogit: argv.nogit
})
