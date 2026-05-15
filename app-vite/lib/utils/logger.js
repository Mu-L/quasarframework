import {
  bgGreen,
  bgRed,
  bgYellow,
  black,
  green,
  inverse,
  red,
  underline,
  white,
  yellow
} from 'kolorist'

import readline from 'node:readline'

export const dot = '•'

/**
 * Pills
 */

export const successPill = msg => bgGreen(black(` ${msg} `))
export const infoPill = msg => inverse(` ${msg} `)
export const errorPill = msg => bgRed(white(` ${msg} `))
export const warningPill = msg => bgYellow(black(` ${msg} `))

/**
 * Main approach - App CLI related
 */

const banner = 'App ' + dot
const greenBanner = green(banner)
const redBanner = red(banner)
const yellowBanner = yellow(banner)
const tipBanner = `${green('App')} ${dot} ${successPill('TIP')} ${dot} 🚀 `

export const clearConsole = process.stdout.isTTY
  ? () => {
      // Fill screen with blank lines. Then move to 0 (beginning of visible part) and clear it
      console.log('\n'.repeat(process.stdout.rows))
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
    }
  : () => {}

export function tip(msg) {
  console.log(msg ? ` ${tipBanner} ${msg}` : '')
}

export function log(msg, pill) {
  const pillBanner = pill !== void 0 ? green(`${pill} ${dot} `) : ''
  console.log(msg ? ` ${greenBanner} ${pillBanner}${msg}` : '')
}

export function warn(msg, pill) {
  if (msg !== void 0) {
    const pillBanner = pill !== void 0 ? warningPill(pill) + ' ' : ''
    console.warn(` ${yellowBanner} ⚠️  ${pillBanner}${msg}`)
  } else {
    console.warn()
  }
}

export function fatal(msg, pill) {
  if (msg !== void 0) {
    const pillBanner = pill !== void 0 ? errorPill(pill) + ' ' : ''

    console.error(`\n ${redBanner} ⚠️  ${pillBanner}${msg}\n`)
  } else {
    console.error()
  }

  process.exit(1)
}

/**
 * Extended approach - Compilation status & pills
 */

export function success(msg, title = 'SUCCESS') {
  console.log(` ${greenBanner} ${successPill(title)} ${green(dot + ' ' + msg)}`)
}
export function getSuccess(msg, title) {
  return ` ${greenBanner} ${successPill(title)} ${green(dot + ' ' + msg)}`
}

export function info(msg, title = 'INFO') {
  console.log(` ${greenBanner} ${infoPill(title)} ${green(dot)} ${msg}`)
}
export function getInfo(msg, title) {
  return ` ${greenBanner} ${infoPill(title)} ${green(dot)} ${msg}`
}

export function error(msg, title = 'ERROR') {
  console.log(` ${redBanner} ${errorPill(title)} ${red(dot + ' ' + msg)}`)
}
export function getError(msg, title = 'ERROR') {
  return ` ${redBanner} ${errorPill(title)} ${red(dot + ' ' + msg)}`
}

export function warning(msg, title = 'WARNING') {
  console.log(
    ` ${yellowBanner} ${warningPill(title)} ${yellow(dot + ' ' + msg)}`
  )
}
export function getWarning(msg, title = 'WARNING') {
  return ` ${yellowBanner} ${warningPill(title)} ${yellow(dot + ' ' + msg)}`
}

/**
 * AE related
 */

export function aeLog(extId, message) {
  log(message, `AE (${extId})`)
}
export function aeWarn(extId, message) {
  warn(message, `AE (${extId})`)
}
export function aeFatal(extId, message) {
  fatal(message, `AE (${extId})`)
}

/**
 * Progress related
 */

export function progress(msg, token) {
  const parseMsg =
    token !== void 0
      ? text => text.replace('___', underline(green(token)))
      : text => text

  info(parseMsg(msg), 'WAIT')

  const startTime = Date.now()

  return progressMessage => {
    const diffTime = Date.now() - startTime
    success(`${parseMsg(progressMessage)} ${dot} ${diffTime}ms`, 'DONE')
    log()
  }
}
