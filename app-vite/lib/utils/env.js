import { existsSync, readFileSync } from 'node:fs'
import { join, isAbsolute, relative } from 'node:path'
import { parse as dotEnvParse } from 'dotenv'
import { expand as dotEnvExpand } from 'dotenv-expand'
import { merge } from 'webpack-merge'

import { encodeForDiff } from './encode-for-diff.js'
import { isCI } from './is-terminal.js'

const DEFAULT_ENV_PREFIX = 'QCLI_'
const validEnvKeyRE = /^[a-zA-Z_$][a-zA-Z0-9_$]+/

/**
 * Get the raw env definitions from the host project env files.
 */
export function readEnvFiles(ctx, env, isQuasarConfFile = false) {
  const cacheKey = isQuasarConfFile ? 'readQuasarConfEnvFiles' : 'readEnvFiles'
  const configHash = encodeForDiff(env)
  const cache = ctx.cacheProxy.getRuntime(cacheKey, () => ({}))

  if (cache.configHash !== configHash) {
    const localEnv = merge(
      {
        prefix: DEFAULT_ENV_PREFIX,
        folder: ctx.appPaths.appDir,
        files: []
        // filter: (key, value) => true
      },
      env
    )

    // we enforce a prefix (other than Quasar's own QUASAR_) for security reasons
    // and we also filter it if it's an array, to make sure that it only contains valid keys

    let { prefix } = localEnv
    if (!prefix || prefix === 'QUASAR_') {
      prefix = DEFAULT_ENV_PREFIX
    } else if (Array.isArray(prefix)) {
      prefix = prefix.filter(p => validEnvKeyRE.test(p) && p !== 'QUASAR_')
      if (prefix.length === 0) prefix = DEFAULT_ENV_PREFIX
    }

    const envPrefix = Array.isArray(prefix)
      ? new RegExp(`^(${prefix.join('|')})[a-zA-Z_$][a-zA-Z0-9_$]+`)
      : new RegExp(`^${prefix}[a-zA-Z_$][a-zA-Z0-9_$]+`)

    let fileList = [
      // .env
      // loaded in all cases
      '.env',

      // .env.local
      // loaded in all cases, ignored by git
      '.env.local'
    ]

    // if it's not for the Quasar config file,
    // we also load mode and build-type specific env files
    if (isQuasarConfFile === false) {
      const { modeName: quasarMode, dev } = ctx
      const buildType = dev === true ? 'dev' : 'prod'

      fileList.push(
        // .env.[dev|prod]
        // loaded for dev or prod only
        `.env.${buildType}`,

        // .env.local.[dev|prod]
        // loaded for dev or prod only, ignored by git
        `.env.${buildType}.local`,

        // .env.[quasarMode]
        // loaded for specific Quasar CLI mode only
        `.env.${quasarMode}`,

        // .env.local.[quasarMode]
        // loaded for specific Quasar CLI mode only, ignored by git
        `.env.${quasarMode}.local`,

        // .env.[dev|prod].[quasarMode]
        // loaded for specific Quasar CLI mode and dev|prod only
        `.env.${buildType}.${quasarMode}`,

        // .env.local.[dev|prod].[quasarMode]
        // loaded for specific Quasar CLI mode and dev|prod only, ignored by git
        `.env.${buildType}.${quasarMode}.local`
      )
    }

    if (isCI) {
      // in CI, we ignore all .local files, as they are meant to be used locally only
      fileList = fileList.filter(entry => entry.endsWith('.local') === false)
    }

    if (Array.isArray(localEnv.files)) {
      // additional user-defined env files
      fileList.push(...localEnv.files)
    }

    const folder = localEnv.folder || ctx.appPaths.appDir
    const folderList = Array.isArray(folder) ? folder : [folder]

    const { rawFileEnv, usedEnvFiles } = getFileEnvResult({
      appDir: ctx.appPaths.appDir,
      fileList,
      folderList
    })

    const prefixLabel = Array.isArray(prefix) ? prefix.join(' | ') : prefix
    const result = {
      envDefineList: parseEnv(rawFileEnv, envPrefix),
      envBanner:
        isQuasarConfFile === true
          ? usedEnvFiles.length > 0
            ? ` (env prefix: ${prefixLabel}; env files: ${usedEnvFiles.join(' | ')})`
            : ` (no env files used for it)`
          : usedEnvFiles.length !== 0
            ? `App .env prefix ${prefixLabel} & .env files: ${usedEnvFiles.join(' | ')}`
            : null
    }

    if (typeof localEnv.filter === 'function') {
      result.envDefineList = localEnv.filter(result.envDefineList) || {}
    }

    ctx.cacheProxy.setRuntime(cacheKey, {
      configHash,
      result
    })

    return result
  }

  return cache.result
}

function getFileEnvResult({ appDir, fileList, folderList }) {
  const usedEnvFiles = []
  const envFolderList = folderList.map(folder =>
    isAbsolute(folder) === true ? folder : join(appDir, folder)
  )

  const list = fileList.flatMap(file => {
    if (isAbsolute(file) === true) return file
    return envFolderList.map(folder => join(folder, file))
  })

  const env = Object.fromEntries(
    list.flatMap(filePath => {
      if (existsSync(filePath) === false) return []

      usedEnvFiles.push(relative(appDir, filePath))
      return Object.entries(dotEnvParse(readFileSync(filePath, 'utf-8')))
    })
  )

  if (Object.keys(env).length === 0) {
    return {
      rawFileEnv: {},
      usedEnvFiles: []
    }
  }

  const { parsed: rawFileEnv } = dotEnvExpand({ parsed: env })

  return {
    rawFileEnv,
    usedEnvFiles
  }
}

/**
 * Filter out keys that cannot be used in JS
 * as import.meta.env.[key]
 * Examples: ProgramFiles(x86), BASH_FUNC_which%%
 */
function parseEnv(env, regex) {
  const validKeys = Object.keys(env).filter(key => regex.test(key))
  return validKeys.reduce((acc, key) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
    return acc
  }, {})
}
