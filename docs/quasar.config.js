import { defineConfig } from '#q-app'
import { join, normalize } from 'node:path'

import mdPlugin from './build/md/index.js'
import examplesPlugin from './build/examples.js'
import { codeSplitting } from './build/chunks.js'

export default defineConfig(ctx => ({
  boot: [{ path: 'gdpr', server: false }],

  css: ['app.sass'],

  build: {
    vueRouterMode: 'history',
    distDir: 'dist/quasar.dev',
    useFilenameHashes: false,

    define: {
      'import.meta.env.DOCS_BRANCH': '"dev"',
      'import.meta.env.SEARCH_INDEX': '"quasar-v2"',
      ...(ctx.dev
        ? {
            'import.meta.env.FS_QUASAR_FOLDER': JSON.stringify(
              normalize(join(import.meta.dirname, '../ui')).replace('\\', '/')
            )
          }
        : {})
    },

    viteVuePluginOptions: {
      include: [/\.(vue|md)$/]
    },

    vitePlugins: [mdPlugin, examplesPlugin(ctx.prod)],

    extendViteConf(viteConf, { isClient }) {
      if (ctx.prod && isClient) {
        viteConf.build.chunkSizeWarningLimit = 650
        viteConf.build.rolldownOptions = {
          output: {
            codeSplitting
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
    iconSet: 'svg-mdi-v6',

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
    pwa: ctx.prod,
    prodPort: 3111,
    middlewares: ['render']
  },

  pwa: {
    workboxMode: 'GenerateSW',
    injectPwaMetaTags: false,
    swFilename: 'service-worker.js',

    extendWorkboxGenerateSWOptions(cfg) {
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
