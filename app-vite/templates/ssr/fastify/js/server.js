/**
 * More info about this file:
 * https://v2.quasar.dev/quasar-cli-vite/developing-ssr/ssr-webserver
 *
 * Runs in Node.js context.
 *
 * Make sure to pnpm/yarn/npm/bun install (in your project root)
 * anything you import here. Add to "dependencies" and not "devDependencies".
 */

import Fastify from 'fastify'
import middie from '@fastify/middie'
import serveStatic from 'serve-static'
import {
  defineSsrCreate,
  defineSsrInjectDevMiddleware,
  defineSsrListen,
  defineSsrClose,
  defineSsrServeStaticContent,
  defineSsrRenderPreloadTag
} from '#q-app/wrappers'

/**
 * Create your webserver and return its instance.
 * If needed, prepare your webserver to receive
 * connect-like middlewares.
 */
export const create = defineSsrCreate(async ({ devHttpsOptions }) => {
  const opts = {}

  /**
   * For production HTTPS you can use the /src-ssr/server-assets folder
   * to place your certificates and then read them here to create the server.
   */
  if (import.meta.env.QUASAR_DEV && devHttpsOptions) {
    opts.https = devHttpsOptions
  }

  const app = Fastify(opts)

  // Needed for fallthrough support of serve-static
  // (and Vite Dev Server in development too)
  await app.register(middie)

  // place here any middlewares that
  // absolutely need to run before anything else
  if (import.meta.env.QUASAR_PROD) {
    const { default: fastifyCompress } = await import('@fastify/compress')
    app.register(fastifyCompress)
  }

  return app
})

/**
 * Used by Quasar SSR dev server to inject middleware into the webserver.
 * It uses it to handle Vite dev server, handle public paths, etc.
 * The given middleware is compatible with `node:http`'s Server, Express, Connect, etc.
 */
export const injectDevMiddleware = defineSsrInjectDevMiddleware(async ({ app }) => {
  return (middleware) => {
    app.use(middleware)
  }
})

/**
 * You need to make the server listen to the indicated port
 * and return the listening instance or whatever you need to
 * close the server with.
 *
 * The "listenResult" param for the "close()" definition below
 * is what you return here.
 *
 * For production, you can instead export your
 * handler for serverless use or whatever else fits your needs.
 */
export const listen = defineSsrListen(async ({ app, port }) => {
  // Fastify manages the underlying Node HTTP/HTTPS server internally,
  // bypassing the need to manually wrap it in node:http or node:https.

  // '0.0.0.0' ensures the server is accessible over the local network (e.g., mobile testing) and Docker
  await app.listen({ port, host: '0.0.0.0' })

  if (import.meta.env.QUASAR_PROD) {
    console.log(`🚀 Server listening at port ${port}`)
  }

  // We return the Fastify instance itself.
  // Quasar will automatically pass this to your defineSsrClose() block as 'listenResult'.
  return app
})

/**
 * Should close the server and free up any resources.
 * Will be used on development only when the server needs
 * to be rebooted.
 *
 * Should you need the result of the "listen()" call above,
 * you can use the "listenResult" param.
 *
 * Can be async: defineSsrClose(async ({ listenResult }) => { ... })
 */
export const close = defineSsrClose(({ listenResult }) => {
  return listenResult.close()
})

const maxAge = import.meta.env.QUASAR_DEV
  ? 0
  : 1000 * 60 * 60 * 24 * 30

/**
 * Should return a function that will be used to configure the webserver
 * to serve static content at "urlPath" from "pathToServe" folder/file.
 *
 * Notice resolve.urlPath(urlPath) and resolve.public(pathToServe) usages.
 *
 * Can be async: defineSsrServeStaticContent(async ({ app, resolve }) => {
 * Can return an async function: return async ({ urlPath = '/', pathToServe = '.', opts = {} }) => {
 */
export const serveStaticContent = defineSsrServeStaticContent(({ app, resolve }) => {
  return ({ urlPath = '/', pathToServe = '.', opts = {} }) => {
    const serveFn = serveStatic(resolve.public(pathToServe), {
      maxAge,
      ...opts,
    })

    app.use(resolve.urlPath(urlPath), serveFn)
  }
})

const jsRE = /\.js$/
const cssRE = /\.css$/
const woffRE = /\.woff$/
const woff2RE = /\.woff2$/
const gifRE = /\.gif$/
const jpgRE = /\.jpe?g$/
const pngRE = /\.png$/

/**
 * Should return a String with HTML output
 * (if any) for preloading indicated file
 */
export const renderPreloadTag = defineSsrRenderPreloadTag((file/* , { ssrContext } */) => {
  if (jsRE.test(file)) {
    return `<link rel="modulepreload" href="${file}" crossorigin>`
  }

  if (cssRE.test(file)) {
    return `<link rel="stylesheet" href="${file}" crossorigin>`
  }

  if (woffRE.test(file)) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
  }

  if (woff2RE.test(file)) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
  }

  if (gifRE.test(file)) {
    return `<link rel="preload" href="${file}" as="image" type="image/gif" crossorigin>`
  }

  if (jpgRE.test(file)) {
    return `<link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`
  }

  if (pngRE.test(file)) {
    return `<link rel="preload" href="${file}" as="image" type="image/png" crossorigin>`
  }

  return ''
})
