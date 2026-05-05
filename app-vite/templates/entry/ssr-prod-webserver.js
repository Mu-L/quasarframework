/* oxlint-disable */
/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 **/

import { join, basename, isAbsolute } from 'node:path'
import { readFileSync } from 'node:fs'
import { renderToString } from 'vue/server-renderer'
<% if (quasarConf.metaConf.hasStore && quasarConf.ssr.manualStoreSerialization !== true) { %>
import serialize from 'serialize-javascript'
<% } %>

import renderTemplate from './render-template.js'
import serverEntry from './server/server-entry.js'
import clientManifest from './quasar.manifest.json' with { type: 'json' }

import { create, listen, renderPreloadTag, serveStaticContent } from 'app/src-ssr/server'
import injectMiddlewares from './ssr-middlewares'

const port = process.env.PORT || <%= quasarConf.ssr.prodPort %>

const doubleSlashRE = /\/\//g
const publicPath = `<%= quasarConf.build.publicPath %>`
const resolveUrlPath = publicPath === '/'
  ? url => url || '/'
  : url => url ? (publicPath + url).replace(doubleSlashRE, '/') : publicPath

const rootFolder = import.meta.dirname
const publicFolder = join(rootFolder, 'client')
const serverAssetsFolder = join(rootFolder, 'server-assets')

function renderModulesPreload (modules, opts) {
  let links = ''
  const seen = new Set()

  modules.forEach(id => {
    const files = clientManifest[id]
    if (files === void 0) return

    files.forEach(file => {
      if (seen.has(file)) return

      seen.add(file)
      const filename = basename(file)

      if (clientManifest[filename] !== void 0) {
        for (const depFile of clientManifest[filename]) {
          if (!seen.has(depFile)) {
            links += renderPreloadTag(depFile, opts)
            seen.add(depFile)
          }
        }
      }

      links += renderPreloadTag(file, opts)
    })
  })

  return links
}

<% if (quasarConf.metaConf.hasStore && quasarConf.ssr.manualStoreSerialization !== true) { %>
const autoRemove = 'document.currentScript.remove()'

function renderStoreState (ssrContext) {
  const nonce = ssrContext.nonce !== void 0
    ? ' nonce="' + ssrContext.nonce + '"'
    : ''

  const state = serialize(ssrContext.state, { isJSON: true })
  return '<script' + nonce + '>window.__INITIAL_STATE__=' + state + ';' + autoRemove + '</script>'
}
<% } %>

async function render (ssrContext) {
  const onRenderedList = []

  Object.assign(ssrContext, {
    _meta: {},
    onRendered: fn => { onRenderedList.push(fn) }
  })

  const renderFn = await serverEntry(ssrContext)
  const runtimePageContent = await renderToString(renderFn, ssrContext)

  onRenderedList.forEach(fn => { fn() })

  // maintain compatibility with some well-known Vue plugins
  // like @vue/apollo-ssr:
  typeof ssrContext.rendered === 'function' && ssrContext.rendered()

  ssrContext._meta.runtimePageContent = runtimePageContent

  <% if (quasarConf.metaConf.hasStore && quasarConf.ssr.manualStoreSerialization !== true) { %>
    if (ssrContext.state !== void 0) {
      ssrContext._meta.headTags = renderStoreState(ssrContext) + ssrContext._meta.headTags
    }
  <% } %>

  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  ssrContext._meta.endingHeadTags += renderModulesPreload(ssrContext.modules, { ssrContext })

  return renderTemplate(ssrContext)
}

const middlewareParams = {
  port,
  resolve: {
    urlPath: resolveUrlPath,
    root: (...args) => join(rootFolder, ...args),
    public: (...args) => join(publicFolder, ...args),
    serverAssets: (...args) => join(serverAssetsFolder, ...args)
  },
  publicPath,
  folders: {
    root: rootFolder,
    public: publicFolder,
    serverAssets: serverAssetsFolder
  },
  render
}

export const app = await create(middlewareParams)

// fill in "app" for next calls
middlewareParams.app = app

const serveStatic = await serveStaticContent(middlewareParams)
middlewareParams.serve = { static: serveStatic }

<% if (quasarConf.ssr.pwa) { %>
// serve the service worker with no cache
<% /* Keep SsrServeStaticFnParams["opts"] in sync */ %>
await serveStatic({
  urlPath: '/<%= quasarConf.pwa.swFilename %>',
  pathToServe: '<%= quasarConf.pwa.swFilename %>',
  opts: { maxAge: 0 }
})
<% } %>

// serve "client" folder (includes the "public" folder)
await serveStatic({ urlPath: '/', pathToServe: '.' })

await injectMiddlewares(middlewareParams)

/**
 * Import this if all you care about is the result of
 * your listen() call (from your /src-ssr/server.js)
 */
export const listenResult = await listen(middlewareParams)

/**
 * Serverless territory. We do a "handler" export, but
 * you must return it from your listen() call for production.
 * Guard the return value with `if(import.meta.env.QUASAR_PROD)`.
 */
export const handler = listenResult?.handler

/**
 * Serverless territory. We do a "handler" export, but
 * you must return it from your listen() call for production.
 * Guard the return value with `if(import.meta.env.QUASAR_PROD)`.
 */
export const ssr = listenResult?.ssr

/**
 * Serverless territory. We do a "handler" export, but
 * you must return it from your listen() call for production.
 * Guard the return value with `if(import.meta.env.QUASAR_PROD)`.
 */
export const main_handler = listenResult?.main_handler

/**
 * Serverless territory. We do a "handler" export, but
 * you must return it from your listen() call for production.
 * Guard the return value with `if(import.meta.env.QUASAR_PROD)`.
 */
export const main = listenResult?.main

/**
 * We also export the app, should you want to further tamper
 * with it from an external source.
 */
export default listenResult?.defaultExport || app

/**
 * Import this if you just want to render the
 * html for a page with Vue & VueRouter.
 *
 * If this is all that you want in production,
 * then you can entirely skip instantiating a webserver
 * and making it listen on a port. However, make sure
 * that for dev mode, you still do all this.
 *
 * @example Look at your /src-ssr/middlewares/render
 * file around the render() call.
 */
export const renderSsrContext = render
