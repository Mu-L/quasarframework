import { defineConfig } from '#q-app'

import { mdVitePlugin } from './build/md/md-vite-plugin.js'
import shikiCssStashPlugin from './build/shiki-css-stash.js'
import { quasarApiVitePlugin } from './build/quasar-api.js'
import { codeSplitting, examplesVitePlugin } from './build/prod-chunks.js'

export default defineConfig(ctx => ({
  boot: [{ path: 'gdpr', server: false }],

  css: [
    '~@shikijs/twoslash/style-rich.css',
    'app.sass',
    '~virtual:shiki-tokens.css'
  ],

  build: {
    vueRouterMode: 'history',
    distDir: 'dist/quasar.dev',
    useFilenameHashes: false,

    defineEnv: {
      DOCS_BRANCH: 'dev',
      SEARCH_INDEX: 'quasar-v2'
    },

    viteVuePluginOptions: {
      include: [/\.(vue|md)$/]
    },

    vitePlugins: [
      quasarApiVitePlugin(),
      mdVitePlugin(ctx.prod),
      examplesVitePlugin(ctx.prod),
      shikiCssStashPlugin()
    ],

    extendViteConf(_viteConf, { isClient }) {
      if (ctx.prod && isClient) {
        return {
          build: {
            assetsDir: 'a',
            rolldownOptions: {
              output: {
                codeSplitting
              }
            }
          }
        }
      }
    }
  },

  devServer: {
    port: 9090,
    open: {
      app: { name: 'google chrome' }
    }
  },

  framework: {
    iconSet: 'svg-mdi-v7',

    devTreeshaking: true,
    autoImportVueExtensions: ['vue', 'md'],

    config: {
      loadingBar: {
        color: 'brand-primary',
        size: '4px'
      }
    },

    plugins: [
      'AddressbarColor',
      'AppFullscreen',
      'AppVisibility',
      'BottomSheet',
      'Cookies',
      'Dark',
      'Dialog',
      'Loading',
      'LoadingBar',
      'LocalStorage',
      'Meta',
      'Notify',
      'Platform',
      'Screen',
      'SessionStorage'
    ]
  },

  animations: ['fadeIn', 'fadeOut'],

  ssr: {
    pwa: ctx.prod && !import.meta.env.DOCS_PREVIEW,
    middlewares: ['render'],
    prodScriptNamedExport: 'renderSsrContext'
  },

  pwa: {
    workboxMode: 'GenerateSW',
    injectPWAMetaTags: false,
    swFilename: 'service-worker.js',

    extendPWAGenerateSWOptions(cfg) {
      Object.assign(cfg, {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn/,
            handler: 'StaleWhileRevalidate'
          }
        ]
      })
    }
  }
}))
