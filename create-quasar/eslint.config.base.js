import eslintJs from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    name: 'eslint/recommended',

    ...eslintJs.configs.recommended
  },

  {
    name: 'custom',

    rules: {
      'no-empty': 'off',
      'no-unused-vars': [ 'error', { ignoreRestSiblings: true, argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' } ]
    }
  }
)
