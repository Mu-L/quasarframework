import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, relative } from 'node:path'
import { parseEnv } from 'node:util'
import { expand as dotEnvExpand } from 'dotenv-expand'
import { merge } from 'webpack-merge'
import { isCI } from 'ci-info'

import { dot, warn } from './logger.js'
import { green } from 'kolorist'
import { encodeForDiff } from './encode-for-diff.js'

const defaultQuasarConfEnvPrefix = ''
export const defaultClientAppEnvPrefix = 'QCLI_'
export const defaultBackendAppEnvPrefix = ''
const validEnvKeyRE = /^[a-zA-Z_$][a-zA-Z0-9_$]+/
const appEnvBannerPrefix = green(`Env ${dot}`)

function getEnvFilesPrefix({ prefix, defaultPrefix, banner }) {
  if (!prefix) {
    if (!defaultPrefix) return ''
    warn(
      `No env prefix specified, using default "${defaultPrefix}" instead.`,
      banner
    )
    return defaultPrefix
  }

  if (!Array.isArray(prefix)) {
    if (!validEnvKeyRE.test(prefix)) {
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

    if (!validEnvKeyRE.test(entry)) {
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

export function getQuasarConfEnv({ ctx, envCfg, useSnapshot }) {
  const localEnv = merge(
    {
      // prefix: defaultQuasarConfEnvPrefix,
      folder: ctx.appPaths.appDir
      // file: []
    },
    envCfg
  )

  const fileList = isCI ? ['.env'] : ['.env', '.env.local']
  const additionalFiles = Array.isArray(localEnv.file)
    ? localEnv.file
    : localEnv.file
      ? [localEnv.file]
      : []

  if (additionalFiles.length !== 0) {
    // additional user-defined env files
    fileList.push(...additionalFiles)
  }

  const { appDir } = ctx.appPaths
  const { rawFileEnv, watchEnvFiles, usedEnvFiles } = getFileEnvResult({
    appDir,
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

  const envDefineList = parseEnvDefineList(rawFileEnv, prefixRE)

  return {
    envDefineList,
    watchEnvFiles: new Set(watchEnvFiles),
    snapshot: useSnapshot
      ? {
          envDefineList: encodeForDiff(envDefineList),
          watchEnvFiles: encodeForDiff(watchEnvFiles)
        }
      : null,
    envBanner: `${prefix ? `prefix ${prefixLabel}` : 'no env prefix'}; ${
      usedEnvFiles.length !== 0
        ? `files: ${usedEnvFiles.join(' | ')}`
        : `no env files`
    }`
  }
}

/**
 * Get the raw env definitions from the host project env files.
 */
export function getAppEnv({ ctx, envCfg, useSnapshot }) {
  const hasBackend = ctx.mode.ssr === true
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

  const fileList = isCI ? ['.env'] : ['.env', '.env.local']
  const additionalFiles = Array.isArray(localEnv.file)
    ? localEnv.file
    : localEnv.file
      ? [localEnv.file]
      : []

  if (additionalFiles.length !== 0) {
    // additional user-defined env files
    fileList.push(...additionalFiles)
  }

  const { appDir } = ctx.appPaths
  const { rawFileEnv, watchEnvFiles, usedEnvFiles } = getFileEnvResult({
    appDir,
    fileList,
    folderList: Array.isArray(localEnv.folder)
      ? localEnv.folder
      : [localEnv.folder]
  })

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
    clientEnvDefineList: parseEnvDefineList(rawFileEnv, clientPrefixRE)
  }

  let backendBanner = ''
  if (hasBackend) {
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

    backendBanner = `${backendPrefix ? `Backend code prefix: ${backendPrefixLabel}` : 'No backend code prefix'}; `
    result.backendEnvDefineList = parseEnvDefineList(
      rawFileEnv,
      backendPrefixRE
    )
  }

  result.envBanner =
    `${appEnvBannerPrefix} ` +
    `${clientPrefix ? `Client code prefix: ${clientPrefixLabel}` : 'No client code prefix'}; ` +
    backendBanner +
    (usedEnvFiles.length !== 0
      ? `files: ${usedEnvFiles.join(' | ')}`
      : 'no files')

  if (typeof localEnv.filter === 'function') {
    result.clientEnvDefineList =
      // oxlint-disable-next-line unicorn/no-array-method-this-argument
      localEnv.filter(result.clientEnvDefineList, 'client') || {}

    if (hasBackend) {
      result.backendEnvDefineList =
        // oxlint-disable-next-line unicorn/no-array-method-this-argument
        localEnv.filter(result.backendEnvDefineList, 'backend') || {}
    }
  }

  if (useSnapshot) {
    result.snapshot = {
      envCfg: encodeForDiff(envCfg),
      watchEnvFiles: encodeForDiff(watchEnvFiles)
    }
  }

  result.watchEnvFiles = new Set(watchEnvFiles)
  return result
}

function getFileEnvResult({ appDir, fileList, folderList }) {
  const watchEnvFiles = []
  const usedEnvFiles = []

  const envFolderList = folderList.map(folder =>
    isAbsolute(folder) ? folder : join(appDir, folder)
  )

  const list = fileList.flatMap(file => {
    if (isAbsolute(file)) return file
    return envFolderList.map(folder => join(folder, file))
  })

  const env = Object.fromEntries(
    list.flatMap(filePath => {
      watchEnvFiles.push(filePath)
      if (!existsSync(filePath)) return []

      usedEnvFiles.push(relative(appDir, filePath))
      return Object.entries(parseEnv(readFileSync(filePath, 'utf8')))
    })
  )

  if (Object.keys(env).length === 0) {
    return {
      rawFileEnv: { ...process.env },
      watchEnvFiles,
      usedEnvFiles: []
    }
  }

  const { parsed } = dotEnvExpand({ processEnv: {}, parsed: env })

  return {
    rawFileEnv: { ...parsed, ...process.env },
    watchEnvFiles,
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
