// `quasar` package has some Quasar CLI-specific features, e.g. $q.cordova, etc.
// Those types should not be available in there when not using Quasar CLI
// So, we augment the `quasar` package with these features from each engine (app-vite, app-webpack)

import "./globals";

export type * from "./bex/index.d.ts";
export type * from "./ssr/index.d.ts";

export type * from "./store.d.ts";
export type * from "./prefetch.d.ts";
export type * from "./boot.d.ts";
export type * from "./configuration.d.ts";
export type * from "./route.d.ts";
export type * from "./app-extension.d.ts";
export type * from "./app-wrappers.d.ts";
export type * from "./logger.d.ts";
