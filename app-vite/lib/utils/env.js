import { existsSync, readFileSync } from 'node:fs'
import { join, isAbsolute, relative } from 'node:path'
import { parse as dotEnvParse } from 'dotenv'
import { expand as dotEnvExpand } from 'dotenv-expand'
import { merge } from 'webpack-merge'

import { encodeForDiff } from './encode-for-diff.js'
import { isCI } from './is-terminal.js'
import { warn } from './logger.js'

const defaultQuasarConfEnvPrefix = ''
export const defaultClientAppEnvPrefix = 'QCLI_'
export const defaultBackendAppEnvPrefix = ''
const validEnvKeyRE = /^[a-zA-Z_$][a-zA-Z0-9_$]+/

const quasarConfEnvCacheKey = 'QuasarConfEnv'
const appEnvCacheKey = 'AppEnv'

function getEnvFilesPrefix({ prefix, defaultPrefix, banner }) {
  if (!prefix) {
    if (!defaultPrefix) return ''
    warn(
      `No env prefix specified, using default "${defaultPrefix}" instead.`,
      banner
    )
    return defaultPrefix
  }

  if (Array.isArray(prefix) === false) {
    if (validEnvKeyRE.test(prefix) === false) {
      if (!defaultPrefix) {
        warn(
          `The "${prefix}" env prefix is invalid in JS. Allowing all env keys that are valid in JS (without any prefix).`,
          banner
        )
        return ''
      }

      warn(
        `Invalid env prefix specified, using default "${defaultPrefix}" instead.`,
        banner
      )
      return defaultPrefix
    }

    return prefix
  }

  const validPrefixList = []
  for (const entry of prefix) {
    if (!entry) continue

    if (validEnvKeyRE.test(entry) === false) {
      warn(
        `Invalid env prefix "${entry}" specified in the array. Skipping it.`,
        banner
      )
      continue
    }

    validPrefixList.push(entry)
  }

  if (validPrefixList.length === 0) {
    if (!defaultPrefix) {
      warn(
        `No valid env prefix specified in the array. Allowing all env keys that are valid in JS (without any prefix).`,
        banner
      )
      return ''
    }

    warn(
      `No valid env prefix specified in the array, using default "${defaultPrefix}" instead.`,
      banner
    )
    return defaultPrefix
  }

  return validPrefixList
}

export function getQuasarConfEnv(ctx, quasarConfEnvCfg) {
  const configHash = encodeForDiff(quasarConfEnvCfg)
  const cache = ctx.cacheProxy.getRuntime(quasarConfEnvCacheKey, () => ({}))

  if (cache.configHash !== configHash) {
    const localEnv = merge(
      {
        // prefix: defaultQuasarConfEnvPrefix,
        folder: ctx.appPaths.appDir
        // file: []
      },
      quasarConfEnvCfg
    )

    const fileList = isCI === true ? ['.env'] : ['.env', '.env.local']
    const additionalFiles = Array.isArray(localEnv.file)
      ? localEnv.file
      : localEnv.file
        ? [localEnv.file]
        : []

    if (additionalFiles.length !== 0) {
      // additional user-defined env files
      fileList.push(...additionalFiles)
    }

    const { rawFileEnv, usedEnvFiles } = getFileEnvResult({
      appDir: ctx.appPaths.appDir,
      fileList,
      folderList: Array.isArray(localEnv.folder)
        ? localEnv.folder
        : [localEnv.folder]
    })

    const prefix = getEnvFilesPrefix({
      prefix: localEnv.prefix,
      defaultPrefix: defaultQuasarConfEnvPrefix,
      banner: 'quasar.config'
    })

    const prefixLabel = Array.isArray(prefix) ? prefix.join(' | ') : prefix
    const prefixRE = Array.isArray(prefix)
      ? new RegExp(`^(${prefix.join('|')})[a-zA-Z_$][a-zA-Z0-9_$]+`)
      : new RegExp(`^${prefix}[a-zA-Z_$][a-zA-Z0-9_$]+`)

    const result = {
      envDefineList: parseEnvDefineList(rawFileEnv, prefixRE),
      envBanner: `(${
        prefix ? `env prefix: ${prefixLabel}` : 'no env prefix'
      }; ${
        usedEnvFiles.length > 0
          ? `env files: ${usedEnvFiles.join(' | ')}`
          : `no env files`
      })`
    }

    ctx.cacheProxy.setRuntime(quasarConfEnvCacheKey, {
      configHash,
      result
    })

    return result
  }

  return cache.result
}

/**
 * Get the raw env definitions from the host project env files.
 */
export function getAppEnv(ctx, envCfg) {
  const configHash = encodeForDiff(envCfg)
  const cache = ctx.cacheProxy.getRuntime(appEnvCacheKey, () => ({}))

  if (cache.configHash !== configHash) {
    const localEnv = merge(
      {
        clientPrefix: defaultClientAppEnvPrefix,
        backendPrefix: defaultBackendAppEnvPrefix,
        folder: ctx.appPaths.appDir
        // file: []
        // filter: (key, value) => true
      },
      envCfg
    )

    const { modeName: quasarMode, dev } = ctx
    const buildType = dev === true ? 'dev' : 'prod'

    let fileList = [
      // .env
      // loaded in all cases
      '.env',

      // .env.local
      // loaded in all cases, ignored by git
      '.env.local',

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
    ]

    if (isCI === true) {
      // in CI, we ignore all .local files, as they are meant to be used locally only
      fileList = fileList.filter(entry => entry.endsWith('.local') === false)
    }

    const additionalFiles = Array.isArray(localEnv.file)
      ? localEnv.file
      : localEnv.file
        ? [localEnv.file]
        : []

    if (additionalFiles.length !== 0) {
      // additional user-defined env files
      fileList.push(...additionalFiles)
    }

    const { rawFileEnv, usedEnvFiles } = getFileEnvResult({
      appDir: ctx.appPaths.appDir,
      fileList,
      folderList: Array.isArray(localEnv.folder)
        ? localEnv.folder
        : [localEnv.folder]
    })

    const backendPrefix = getEnvFilesPrefix({
      prefix: localEnv.backendPrefix,
      defaultPrefix: defaultBackendAppEnvPrefix,
      banner: 'App envBackendPrefix'
    })
    const backendPrefixRE = Array.isArray(backendPrefix)
      ? new RegExp(`^(${backendPrefix.join('|')})[a-zA-Z_$][a-zA-Z0-9_$]+`)
      : new RegExp(`^${backendPrefix}[a-zA-Z_$][a-zA-Z0-9_$]+`)
    const backendPrefixLabel = Array.isArray(backendPrefix)
      ? backendPrefix.join(' | ')
      : backendPrefix

    const clientPrefix = getEnvFilesPrefix({
      prefix: localEnv.clientPrefix,
      defaultPrefix: defaultClientAppEnvPrefix,
      banner: 'App envClientPrefix'
    })
    const clientPrefixRE = Array.isArray(clientPrefix)
      ? new RegExp(`^(${clientPrefix.join('|')})[a-zA-Z_$][a-zA-Z0-9_$]+`)
      : new RegExp(`^${clientPrefix}[a-zA-Z_$][a-zA-Z0-9_$]+`)
    const clientPrefixLabel = Array.isArray(clientPrefix)
      ? clientPrefix.join(' | ')
      : clientPrefix

    const result = {
      clientEnvDefineList: parseEnvDefineList(rawFileEnv, clientPrefixRE),
      backendEnvDefineList: parseEnvDefineList(rawFileEnv, backendPrefixRE),
      envBanner:
        `App env: ${backendPrefix ? `backend prefix ${backendPrefixLabel}` : 'no backend prefix'}; ${clientPrefix ? `client prefix ${clientPrefixLabel}` : 'no client prefix'}` +
        (usedEnvFiles.length !== 0
          ? `; files: ${usedEnvFiles.join(' | ')}`
          : '; no files')
    }

    if (typeof localEnv.filter === 'function') {
      result.clientEnvDefineList =
        localEnv.filter(result.clientEnvDefineList, 'client') || {}

      result.backendEnvDefineList =
        localEnv.filter(result.backendEnvDefineList, 'backend') || {}
    }

    ctx.cacheProxy.setRuntime(appEnvCacheKey, {
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
      rawFileEnv: { ...process.env },
      usedEnvFiles: []
    }
  }

  const { parsed } = dotEnvExpand({ parsed: env })

  return {
    rawFileEnv: { ...parsed, ...process.env },
    usedEnvFiles
  }
}

/**
 * Filter out keys that cannot be used in JS
 * as import.meta.env.[key]
 * Examples: ProgramFiles(x86), BASH_FUNC_which%%
 */
function parseEnvDefineList(env, regex) {
  const validKeys = Object.keys(env).filter(key => regex.test(key))
  return validKeys.reduce((acc, key) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
    return acc
  }, {})
}
