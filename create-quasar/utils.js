import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { execSync as exec } from 'node:child_process'
import { sync as spawnSync } from 'cross-spawn'
import {
  copySync,
  emptyDirSync,
  ensureDirSync,
  ensureFileSync
} from 'fs-extra/esm'
import { globSync } from 'tinyglobby'
import {
  box,
  cancel,
  confirm,
  group,
  groupMultiselect,
  intro,
  isCancel,
  log,
  multiselect,
  note,
  outro,
  select,
  taskLog,
  text
} from '@clack/prompts'

import { renderTemplate as renderTemplateFn } from './template.js'

const prompts = {
  text,
  confirm,
  select,
  multiselect,
  groupMultiselect,
  group,

  intro,
  outro,
  taskLog,
  log,
  note,
  box
}

const TEMPLATING_FILE_EXTENSIONS = [
  '',
  '.json',
  '.js',
  '.cjs',
  '.ts',
  '.vue',
  '.md',
  '.html',
  '.sass'
]

function cancelScaffolding({
  message = 'Scaffolding cancelled',
  exit = true
} = {}) {
  cancel(message)
  if (exit !== false) process.exit(exit === true ? 1 : exit)
}

function exitOnCancel(val) {
  if (isCancel(val)) cancelScaffolding()
  return val
}

async function promptUser(
  scope,
  questions,
  onCancel = () => cancelScaffolding()
) {
  for (const key in questions) {
    // if it came pre-filled
    if (scope[key]) continue

    scope[key] = await questions[key]()
    if (isCancel(scope[key])) {
      onCancel()
      return
    }
  }
}

function createTargetDir(scope) {
  const fn = scope.overwrite ? emptyDirSync : ensureDirSync
  fn(scope.projectFolder)
}

function convertArrayToObject(arr) {
  const acc = {}
  arr.forEach(key => {
    acc[key] = true
  })
  return acc
}

const runningPackageManager = (() => {
  const userAgent = process.env.npm_config_user_agent
  if (!userAgent) return

  const [name, version] = userAgent.split(' ')[0].split('/')
  return { name, version }
})()

function getCallerPath() {
  const _prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = new Error('err').stack.slice(1)
  Error.prepareStackTrace = _prepareStackTrace
  const filename = stack[1].getFileName()
  return dirname(
    filename.startsWith('file://') ? fileURLToPath(filename) : filename
  )
}

function renderTemplate(relativePath, scope) {
  const templateDir = join(getCallerPath(), relativePath)
  const files = globSync(['**/*'], { cwd: templateDir })

  for (const rawPath of files) {
    const targetRelativePath = rawPath
      .split('/')
      .map(name => (name.startsWith('_') ? name.slice(1) : name))
      .join('/')

    const targetPath = resolve(scope.projectFolder, targetRelativePath)
    const sourcePath = resolve(templateDir, rawPath)
    const extension = extname(targetRelativePath)

    ensureFileSync(targetPath)

    if (TEMPLATING_FILE_EXTENSIONS.includes(extension)) {
      const rawContent = readFileSync(sourcePath, 'utf8')

      let newContent = renderTemplateFn(rawContent, scope)
      if (extension === '.json') {
        try {
          // try to format the JSON
          newContent = JSON.stringify(JSON.parse(newContent), null, 2)
        } catch {
          // noop, the JSON might be containing comments, leave it unformatted
        }
      }

      writeFileSync(targetPath, newContent, 'utf8')
    } else {
      copySync(sourcePath, targetPath)
    }
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

function inferPackageName(projectFolder) {
  return projectFolder
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replaceAll(/[^a-z0-9-~]+/g, '-')
}

function getGitUser() {
  let name
  let email

  try {
    name = exec('git config --get user.name')
    email = exec('git config --get user.email')
  } catch {}

  return (
    (name ? JSON.stringify(name.toString().trim()).slice(1, -1) : '') +
    (email ? ' <' + email.toString().trim() + '>' : '')
  )
}

function waitForKey() {
  const { stdin } = process

  // Are we in a real terminal?
  // If not (e.g., CI pipeline), resolve immediately so the script doesn't hang forever.
  if (!stdin.isTTY) return Promise.resolve()

  process.stdout.write('Press any key to continue...')

  const { promise, resolve: resolvePromise } = Promise.withResolvers()

  // Enable raw mode to bypass the 'Enter' key requirement
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  const handleKey = key => {
    stdin.off('data', handleKey)
    stdin.setRawMode(false)
    stdin.pause()

    // Explicitly handle Ctrl+C
    if (key === '\u0003') {
      console.log('\nProcess cancelled by user (Ctrl+C)\n')
      process.exit(1)
    }

    resolvePromise()
  }

  stdin.on('data', handleKey)
  return promise
}

function enterAlternateScreen(message) {
  // if we're not in a real terminal
  if (!process.stdin.isTTY) {
    if (message) console.log(`>>> ${message}\n`)
    return
  }

  // Enter Alternate Screen Buffer (hides current terminal history)
  process.stdout.write('\u001B[?1049h')
  // Move cursor to top left
  process.stdout.write('\u001B[H')

  if (message) console.log(`>>> ${message}\n`)
}

function exitAlternateScreen() {
  // if we're not in a real terminal
  if (!process.stdin.isTTY) return

  process.stdout.write('\u001B[?1049l')
}

async function runCommand({
  cmd,
  args,
  cwd,
  message,
  successMessage,
  errorMessage
}) {
  const logTask = taskLog({ title: message })
  enterAlternateScreen(`Running command: ${cmd} ${args.join(' ')}`)

  const runner = spawnSync(cmd, args, {
    cwd,
    args,
    // Inherit stdin and stdout (shows live), pipe stderr (captures errors)
    stdio: ['inherit', 'inherit', 'pipe'],
    // Force colors so the captured error formatting isn't lost
    env: { ...process.env, FORCE_COLOR: '1' }
  })

  if (runner.error || runner.status) {
    if (runner.error?.length > 0) console.error(runner.error.toString())

    const msg = `⚠️  ⚠️  ⚠️  ${errorMessage} ⚠️  ⚠️  ⚠️ `

    console.log()
    console.error(msg)
    console.log()

    await waitForKey()
    exitAlternateScreen()
    logTask.error(msg)

    return true
  }

  exitAlternateScreen()
  logTask.success(successMessage)

  return false
}

async function installDeps(scope) {
  const hadError = await runCommand({
    cmd: scope.packageManager,
    args: ['install'],
    cwd: scope.projectFolder,
    message: `Installing dependencies using ${scope.packageManager.toUpperCase()}...`,
    successMessage: 'Dependencies installed successfully!',
    errorMessage:
      'Could not auto install dependencies. Probably a temporary npm registry issue?'
  })

  if (hadError) {
    scope.packageManager = false
    return false
  }

  return true
}

// returns a Promise!
function lintFolder(scope) {
  const hasOxlint = scope.linter === 'oxlint' || scope.preset.oxlint
  return runCommand({
    cmd: scope.packageManager,
    args: hasOxlint
      ? ['run', 'lint']
      : scope.packageManager === 'npm'
        ? ['run', 'lint', '--', '--fix']
        : ['run', 'lint', '--fix'],
    cwd: scope.projectFolder,
    message: `${hasOxlint ? 'Linting & Formatting' : 'Linting'} the project folder...`,
    successMessage: `Project ${hasOxlint ? 'linted & formatted' : 'linted'} successfully!`,
    errorMessage: `Could not auto ${hasOxlint ? 'lint & format' : 'lint'} the project folder.`
  })
}

// returns a Promise!
function formatFolder(scope) {
  return runCommand({
    cmd: scope.packageManager,
    args: ['run', 'format'],
    cwd: scope.projectFolder,
    message: 'Formatting the project...',
    successMessage: 'Project formatted successfully!',
    errorMessage: 'Could not auto format the project.'
  })
}

function hasGit() {
  try {
    exec('git --version')
    return true
  } catch {}
}

function folderHasGit(cwd) {
  try {
    exec('git status', { stdio: 'ignore', cwd })
    return true
  } catch {}
}

function initializeGit(projectFolder) {
  if (hasGit() !== true) {
    log.info(
      'Git is not installed on the system, so skipping Git repo initialization.'
    )
    return
  }

  if (folderHasGit(projectFolder)) {
    log.info(
      'A parent of the project folder is already a Git repository, so skipping Git initialization.'
    )
    return
  }

  const logTask = taskLog({
    title: 'Initializing Git repository...'
  })

  try {
    exec('git init', { cwd: projectFolder })
    exec('git add -A', { cwd: projectFolder })

    // Provide useful feedback to the user if they have GPG signing
    // enabled to avoid feeling that the process is hanging
    try {
      const needsSigning = exec('git config --get commit.gpgsign', {
        cwd: projectFolder
      })
        .toString()
        .trim()
      if (needsSigning === 'true') {
        logTask.message('Creating initial commit (waiting for GPG signing)...')
      }
    } catch {}

    exec('git commit -m "Initialize the project 🚀" --no-verify', {
      cwd: projectFolder
    })
  } catch {
    logTask.error(
      'Could not initialize Git repository. Please do this manually.'
    )
    return
  }

  logTask.success('Initialized Git repository 🚀')
}

const quasarConfigFilenameList = [
  'quasar.config.js',
  'quasar.config.mjs',
  'quasar.config.ts',
  'quasar.config.cjs',
  'quasar.conf.js' // legacy
]

function ensureOutsideProject() {
  let dir = process.cwd()

  while (dir.length !== 0 && dir.at(-1) !== sep) {
    for (const name of quasarConfigFilenameList) {
      const filename = join(dir, name)
      if (existsSync(filename)) {
        // TODO: proper message
        log.error(
          'Error. This command must NOT be executed inside of a Quasar project folder.'
        )
        process.exit(1)
      }
    }

    dir = normalize(join(dir, '..'))
  }
}

// to be used with promptUser() only
const commonPrompts = {
  scriptType: () =>
    select({
      message: 'Pick script type:',
      initialValue: 'js',
      options: [
        { label: 'Javascript', value: 'js' },
        { label: 'Typescript', value: 'ts' }
      ]
    }),

  productName: () =>
    text({
      message:
        'Project product name: (must start with letter if building mobile apps)',
      placeholder: 'Quasar App',
      defaultValue: 'Quasar App'
    }),

  author: () => {
    const author = getGitUser()
    if (author) return author

    return () =>
      text({
        message: 'Author:'
      })
  }
}

export default {
  cancelScaffolding,
  exitOnCancel,

  promptUser,
  prompts,
  convertArrayToObject,

  createTargetDir,
  runningPackageManager,
  renderTemplate,
  isValidPackageName,
  inferPackageName,

  installDeps,
  lintFolder,
  formatFolder,
  ensureOutsideProject,
  initializeGit,

  commonPrompts
}
