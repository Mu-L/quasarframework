import fs from 'node:fs'

import { warn } from './logger.js'
import { attachMarkup, entryPointMarkup } from '../utils/html-template.js'

export function appFilesValidations(appPaths) {
  let valid = true

  const file = appPaths.resolve.app('index.html')

  if (fs.existsSync(file) === false) {
    warn('The file /index.html is missing. Please add it back.\n')
    return false
  }

  const content = fs.readFileSync(file, 'utf8')

  if (content.includes(attachMarkup)) {
    warn(`Please remove ${attachMarkup} from
    /index.html inside of <body>\n`)
    valid = false
  }

  if (content.includes(entryPointMarkup) === false) {
    warn(`Please add ${entryPointMarkup} to
    /index.html inside of <body>\n`)
    valid = false
  }

  return valid
}
