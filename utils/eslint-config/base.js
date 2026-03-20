import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import neostandard from 'neostandard'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...neostandard({
    noJsx: true
  }),

  {
    name: 'quasar/base',

    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest'
      },
    },

    rules: {
      'prefer-const': 'error',
      'prefer-promise-reject-errors': 'off',
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      'one-var': 'off',
      'no-void': 'off',
      'no-lone-blocks': 'error',
      'no-unused-expressions': [ 'error', { allowShortCircuit: true } ],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-unneeded-ternary': 'error',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      '@stylistic/arrow-parens': 'off',
      '@stylistic/no-confusing-arrow': [ 'error', { allowParens: true } ],
      '@stylistic/generator-star-spacing': 'off',
      '@stylistic/object-property-newline': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/brace-style': [ 'error', 'stroustrup', { allowSingleLine: true } ],
      '@stylistic/operator-linebreak': [ 'error', 'before' ],
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
      '@stylistic/object-curly-spacing': [ 'error', 'always' ],
      '@stylistic/computed-property-spacing': [ 'error', 'always' ],
      '@stylistic/template-curly-spacing': [ 'error', 'always' ]
    }
  },

  {
    name: 'quasar/base/import',

    plugins: {
      'import-x': importX
    },

    settings: {
      'import-x/resolver-next': [
        createNodeResolver()
      ]
    },

    rules: {
      'import-x/first': 'off',
      'import-x/named': 'error',
      'import-x/namespace': 'error',
      'import-x/default': 'error',
      'import-x/export': 'error',
      'import-x/extensions': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-absolute-path': [ 'error', { esmodule: true, commonjs: true, amd: false } ],
      'import-x/no-duplicates': 'error',
      'import-x/no-named-default': 'error',
      'import-x/no-webpack-loader-syntax': 'error',
    }
  },
]
