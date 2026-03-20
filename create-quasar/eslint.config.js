import { defineConfig } from 'eslint/config'
import globals from 'globals'
// import quasar from 'eslint-config-quasar'
import tseslint from 'typescript-eslint'
import baseConfig from './eslint.config.base.js'

export default defineConfig(
  ...baseConfig,

  // TODO: enable these configs
  // ...quasar.configs.base,
  // ...quasar.configs.node,

  {
    name: 'custom/ignores',

    ignores: [ 'test-project' ]
  },

  {
    name: 'custom',

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node
      }
    }
  },

  {
    name: 'custom/scripts',

    files: [ './scripts/**/*.ts' ],

    extends: [
      ...tseslint.configs.recommended
    ],

    languageOptions: {
      parserOptions: {
        sourceType: 'module',
      }
    }
  }
)
