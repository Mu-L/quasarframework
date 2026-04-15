import { defineSsrMiddleware } from '#q-app/wrappers'

/**
 * This middleware should execute as last one
 * since it captures everything and tries to
 * render the page with Vue
 */

export default defineSsrMiddleware(({ app, resolve, render, serve }) => {
  /**
   * We capture any other Hono route and hand it
   * over to Vue and Vue Router to render our page
   */
  app.get(resolve.urlPath('/*'), async c => {
    const req = c.env.incoming
    const res = c.env.outgoing

    try {
      // We hand over to Vue to render our page
      const html = await render(/* the ssrContext: */ { req, res })
      return c.html(html)
    } catch (err) {
      if (err.url) {
        // We were told to redirect to another URL
        const redirectCode = err.code || 302
        return c.redirect(err.url, redirectCode)
      }

      if (err.code === 404) {
        /**
         * Hmm, Vue Router could not find the requested route
         * and it does not have a "catch-all" route
         */
        return c.html('404 | Page Not Found', 404)
      }

      if (import.meta.env.QUASAR_DEV) {
        /**
         * Well, we treat any other code as error;
         * if we're in dev mode, then we can use Quasar CLI
         * to display a nice error page that contains the stack
         * and other useful information
         *
         * Note that serve.error is available on dev only
         */
        const { html, headers } = serve.error({ err, req })
        return c.html(html, 500, headers)
      }

      if (import.meta.env.QUASAR_DEBUG) {
        console.error(err.stack)
      }

      /**
       * Render Error Page on production or
       * alternatively, create a route (/src/routes) for an error page and redirect to it
       * (just make sure that route won't crash too, otherwise you'll end up in an infinite loop)
       */
      return c.html('500 | Internal Server Error', 500)
    }
  })
})
