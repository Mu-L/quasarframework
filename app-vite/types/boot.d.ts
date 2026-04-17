import { App } from "vue";
import { RouteLocationRaw, Router } from "vue-router";
import { HasSsrParam, HttpRedirectStatusCode } from "./ssr";
import { HasStoreParam } from "./store";

interface BootFileParams extends HasSsrParam, HasStoreParam {
  readonly app: App;
  readonly router: Router;
  readonly urlPath: string;
  readonly publicPath: string;
  readonly redirect: (
    url: string | RouteLocationRaw,
    /**
     * HTTP status code to use for the redirection.
     * Only used in SSR mode.
     *
     * @default 302
     */
    httpStatusCode?: HttpRedirectStatusCode
  ) => void;
}

export type BootCallback = (params: BootFileParams) => void | Promise<void>;
