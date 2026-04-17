import { IncomingMessage, ServerResponse } from "node:http";
import { Http2ServerRequest, Http2ServerResponse } from "node:http2";
import {
  Server as HttpsServer,
  ServerOptions as HttpsServerOptions
} from "node:https";
import { SsrDriverTypes } from "./driver";
import { QSsrContext } from "./context";

export interface RenderParams extends Pick<
  QSsrContext,
  "req" | "res" | "url" | "originalUrl"
> {}

export interface RenderVueParams extends RenderParams, Record<string, any> {}

export type HttpRedirectStatusCode = 301 | 302 | 303 | 307 | 308;

export interface SsrRenderRouteNotFoundError {
  readonly routeNotFound: true;
}
export interface SsrRenderRedirectError {
  readonly redirectHttpStatusCode: HttpRedirectStatusCode;
  readonly redirectUrl: string;
}

interface SsrMiddlewareResolve {
  /**
   * Whenever you define a route (with app.use(), app.get(), app.post() etc), you should use the resolve.urlPath() method so that you'll also keep into account the configured publicPath (quasar.config file > build > publicPath).
   */
  readonly urlPath: (url: string) => string;
  /**
   * Resolve folder path to the root (of the project in dev and of the distributables in production). Under the hood, it does a path.join()
   * @param paths paths to join
   */
  readonly root: (...paths: string[]) => string;
  /**
   * Resolve folder path to the "public" folder. Under the hood, it does a path.join()
   * @param paths paths to join
   */
  readonly public: (...paths: string[]) => string;
  /**
   * Resolve folder path to the "server-assets" folder. Under the hood, it does a path.join()
   * @param paths paths to join
   */
  readonly serverAssets: (...paths: string[]) => string;
}

interface SsrMiddlewareFolders {
  readonly root: string;
  readonly public: string;
  readonly serverAssets: string;
}

interface SsrCreateParams {
  /**
   * Terminal PORT env var or the default configured port
   * for the SSR webserver
   */
  readonly port: number;
  /**
   * If you use HTTPS in development, this will hold the HTTPS server options
   * from your /quasar.config file.
   */
  readonly devHttpsOptions?: HttpsServerOptions;
  readonly resolve: SsrMiddlewareResolve;
  readonly publicPath: string;
  readonly folders: SsrMiddlewareFolders;
  /**
   * Uses Vue and Vue Router to render the requested URL path.
   *
   * @throws {Error | SsrRenderRouteNotFoundError | SsrRenderRedirectError} when the rendering fails
   * @returns the rendered HTML string to return to the client
   */
  readonly render: (ssrContext: RenderVueParams) => Promise<string>;
}

export type SsrCreateCallback = (
  params: SsrCreateParams
) => SsrDriverTypes["app"] | Promise<SsrDriverTypes["app"]>;

interface SsrServeStaticContentParams extends SsrCreateParams {
  readonly app: SsrDriverTypes["app"];
}

interface SsrServeStaticFnParams {
  /**
   * The URL path to serve the static content at (without publicPath).
   */
  urlPath: string;

  /**
   * The sub-path from the publicFolder or an absolute path.
   */
  pathToServe: string;

  /**
   * Other custom options...
   */
  // Keep this in sync with ssr-prod-webserver
  opts?: { maxAge?: number };
}

type SsrServeStaticFn = (
  params: SsrServeStaticFnParams
) => void | Promise<void>;

export type SsrServeStaticContentCallback = (
  params: SsrServeStaticContentParams
) => SsrServeStaticFn | Promise<SsrServeStaticFn>;

type SsrRenderErrorFn = (params: {
  /**
   * The caught error that caused the render to fail.
   * It can be an instance of Error or any other value
   * thrown by the render() function.
   */
  err: unknown;
  req: SsrDriverTypes["request"];
}) => { errorHeaders: Record<string, string>; errorHtml: string };

interface SsrMiddlewareServe {
  /**
   * It's essentially a wrapper over express.static() with a few convenient tweaks:
   * - the pathToServe is a path resolved to the "public" folder out of the box
   * - the opts are the same as for express.static()
   * - opts.maxAge is used by default, taking into account the quasar.config file > ssr > maxAge configuration; this sets how long the respective file(s) can live in browser's cache
   */
  readonly static: SsrServeStaticFn;
  /**
   * Displays a wealth of useful debug information (including the stack trace).
   * Warning: It's available only in development and NOT in production.
   */
  readonly devError: SsrRenderErrorFn;
}

interface SsrMiddlewareParams extends SsrServeStaticContentParams {
  readonly serve: SsrMiddlewareServe;
}

export type SsrMiddlewareCallback = (
  params: SsrMiddlewareParams
) => void | Promise<void>;

interface SsrListenHandlerResult {
  handler: SsrDriverTypes["listenResult"] | void;
}

export type SsrListenCallback = (
  params: SsrMiddlewareParams
) =>
  | SsrDriverTypes["listenResult"]
  | SsrListenHandlerResult
  | Promise<SsrDriverTypes["listenResult"]>
  | Promise<SsrListenHandlerResult>;

interface SsrCloseParams extends SsrMiddlewareParams {
  listenResult: SsrDriverTypes["listenResult"];
}

export type SsrCloseCallback = (params: SsrCloseParams) => any | Promise<any>;

interface SsrRenderPreloadTagCallbackOptions {
  ssrContext: RenderVueParams;
}

export type SsrRenderPreloadTagCallback = (
  file: string,
  options: SsrRenderPreloadTagCallbackOptions
) => string;

/**
 * The middleware to inject into the SSR webserver.
 * It is a Node.js middleware function that will be executed
 * for every request that the SSR webserver receives.
 */
type SsrInjectDevMiddlewareParam = (
  req: IncomingMessage | Http2ServerRequest,
  res: ServerResponse | Http2ServerResponse,
  next: (err?: Error) => void
) => unknown | Promise<unknown>;

type SsrInjectDevMiddlewareFn = (
  middleware: SsrInjectDevMiddlewareParam
) => void | Promise<void>;

export type SsrInjectDevMiddlewareCallback = (
  params: SsrMiddlewareParams
) => SsrInjectDevMiddlewareFn | Promise<SsrInjectDevMiddlewareFn>;
