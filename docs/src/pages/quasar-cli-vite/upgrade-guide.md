---
title: Upgrade Guide for Quasar CLI with Vite
desc: (@quasar/app-vite) How to upgrade Quasar CLI with Vite from older versions to the latest one.
---

::: warning Important!
This guide refers to upgrading a `@quasar/app-vite` v2 project to `@quasar/app-vite` v3.
For older versions, please refer to [https://legacy-app.quasar.dev](https://legacy-app.quasar.dev).
:::

## A note to App Extensions owners

You might want to release new versions of your Quasar App Extensions with support for the new @quasar/app-vite. If you are not touching the quasar.config configuration, then it will be as easy as just changing the following:

```diff
api.compatibleWith(
  '@quasar/app-vite',
- '^2.0.0'
+ '^3.0.0-beta.15'
)
```

Removed `api.hasLint()`.

All `api.extendX(fn, api)` methods can now be async and optionally return a (Rolldown/etc) config that will be merged with the default one.

```js api.extendX() example
api.extendSSRWebserverConf((rolldownConf, api) => {
  // add/remove/change Quasar CLI generated Rolldown config object

  // New! Now, optionally, we can also return a config object that will
  // be merged into the default one
  return {
    output: {
      banner: '/**! My Banner */'
    }
  }
})
```

Many new Index API methods:

```tabs
<<| ts SSR |>>
/**
 * Add/remove/change properties of SSR production generated package.json
 *
 * Can directly modify the "pkgJson" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendSSRPackageJson: (
  pkgJson: { [index in string]: any },
  api: IndexAPI
) =>
  | void
  | { [index in string]: any }
  | Promise<void | { [index in string]: any }>;

/**
 * Extend/configure the Workbox GenerateSW options
 * Specify Workbox options which will be applied on top of
 *  `pwa > extendPWAGenerateSWOptions()`.
 * More info: https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
 *
 * Can directly modify the "config" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendSSRGenerateSWOptions: (
  config: GenerateSWOptions,
  api: IndexAPI
) => void | GenerateSWOptions | Promise<void | GenerateSWOptions>;

/**
 * Extend/configure the Workbox InjectManifest options
 * Specify Workbox options which will be applied on top of
 *  `pwa > extendPWAInjectManifestOptions()`.
 * More info: https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
 *
 * Can directly modify the "config" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendSSRInjectManifestOptions: (
  config: InjectManifestOptions,
  api: IndexAPI
) => void | InjectManifestOptions | Promise<void | InjectManifestOptions>;
<<| ts Electron |>>
/**
 * Add/remove/change properties of Electron production generated package.json
 *
 * Can directly modify the "pkgJson" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendElectronPackageJson: (
  pkgJson: { [index in string]: any },
  api: IndexAPI
) =>
  | void
  | { [index in string]: any }
  | Promise<void | { [index in string]: any }>;
<<| ts PWA |>>
/**
 * Should you need some dynamic changes to the /src-pwa/manifest.json,
 * use this method to do it.
 *
 * Can directly modify the "json" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendPWAManifestJson: (
  json: PwaManifestOptions,
  api: IndexAPI
) => void | PwaManifestOptions | Promise<void | PwaManifestOptions>;

/**
 * Extend/configure the Workbox GenerateSW options.
 *
 * Can directly modify the "config" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendPWAGenerateSWOptions: (
  config: GenerateSWOptions,
  api: IndexAPI
) => void | GenerateSWOptions | Promise<void | GenerateSWOptions>;

/**
 * Extend/configure the Workbox InjectManifest options.
 *
 * Can directly modify the "config" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendPWAInjectManifestOptions: (
  config: InjectManifestOptions,
  api: IndexAPI
) => void | InjectManifestOptions | Promise<void | InjectManifestOptions>;
<<| ts BEX |>>
/**
 * Should you need some dynamic changes to the Browser Extension manifest file
 * (/src-bex/manifest.json) then use this method to do it.
 *
 * Can directly modify the "json" parameter or
 * return a new one that will be merged with the default one.
 */
api.extendBexManifestJson: (
  json: object,
  api: IndexAPI
) => void | object | Promise<void | object>;
```

There's also new wrappers that `@quasar/app-vite` now supplies for the Index/Prompts/Install/Uninstall scripts. IDE auto-completion, here we come.

We've also massively upgraded the dev setup for AEs. You might want to do a top to bottom read of the AE docs again, starting with [AE Development Guide](/app-extensions/development-guide/introduction) and spawn a new AE project folder to take advantage of all the new goodies. **TS variant included!**

## Bird's eye view on what's new

- ⚡ Blazing Fast Compilation: We've replaced esbuild with Rolldown for /src-\* folders and completely redesigned the build architecture. Build steps are now parallelized across all Quasar modes, resulting in significantly faster speeds and a smaller footprint for your production distributables.

- ⚙️ Next-Gen Environment Management: We’ve redesigned env file management from the ground up. You will no longer need to restart the dev server when making changes to these files, and you can now use them directly within your quasar.config file too!

- 🔒 Enhanced Security & Modern Standards: We’ve migrated from `process.env` to the modern `import.meta.env` (aligning with Vite's native model) with full TypeScript support. A new security layer ensures client-side files only use a configurable prefix for env definitions, preventing potential leaks of sensitive data.

- 📦 Smarter Dependency Isolation: We now have a clear separation of dependencies for each Quasar mode. You can install mode-specific packages directly in their respective /src-\* folders. For example, the default Electron app will no longer require dependencies to be installed in its dist folder—only what you explicitly install in /src-electron will be included.

- 🌍 Redesigned SSR Architecture: SSR mode now features superior support for custom web servers and proper TypeScript integration. When adding SSR, the CLI will prompt you to spawn a preconfigured /src-ssr folder using Hono, Fastify, Express, or Koa (let us know what other out-of-the-box servers you’d like!).

- 📂 New Server Assets Folder for SSR: We've introduced a /src-ssr/server-assets folder alongside helpful utility functions. This makes it incredibly easy to reference assets (like HTTPS certificates) across dev and production runtimes, eliminating the strict need for an Apache/Nginx wrapper. We've also made the serverless support a breeze.

- 🚀 Paving the Way for SSG: This new SSR architecture lays the necessary groundwork for us to finally release Static Site Generation (SSG) mode in the future.

- 🖥️ Revamped Electron Mode: We’ve added lots of new features to make desktop development smoother. Similar to SSR, we've introduced a /src-electron/electron-assets folder. Referencing files from here (or from the /public folder) is now much easier via new utility methods available in both /src-electron and /src.

- 🛣️ Vue Router: First-class support for the [filename-based routing](/quasar-cli-vite/page-routing-with-vue-router#filename-based-routing).

- 🛠️ Modernized Core: The codebase has been updated to take full advantage of Node.js v22+ features, alongside countless other small but significant improvements across all Quasar modes to boost your productivity.

## Start the upgrade

::: tip
If you are unsure that you won't skip by mistake any of the recommended changes, you can scaffold a new project folder with the @quasar/app-vite v3 at any time and then easily start porting your app from there.
<br><br>

```tabs
<<| bash Yarn |>>
$ yarn create quasar
<<| bash NPM |>>
$ npm init quasar@latest
<<| bash PNPM |>>
$ pnpm create quasar@latest
<<| bash Bun |>>
$ bun create quasar@latest
```

:::

### PNPM related

If you're using PNPM v11, edit your `/pnpm-workspace.yaml` file. No longer needing the shamefullyHoist config.

```yaml /pnpm-workspace.yaml
# https://pnpm.io/settings

allowBuilds:
  '@parcel/watcher': true
  core-js: true
  electron-winstaller: true
  esbuild: true
  lightningcss: true
  rolldown: true
  unrs-resolver: true
```

### /package.json

Edit your `/package.json` on the `@quasar/app-vite` entry:

```diff /package.json
"devDependencies": {
- "@quasar/app-vite": "^2.0.0",
+ "@quasar/app-vite": "^3.0.0-beta.15"
}
```

Make sure you also have Vue Router v5+ too, which is now the minimum version required!

```json /package.json
"dependencies": {
  "vue-router": "^5.0.6"
}
```

### Global search and replace

Do a global search for `#q-app/wrappers` and replace with `#q-app`.

Do a global search for `process.env` and replace with `import.meta.env`. For the Quasar supplied constants, you will need to prefix them with `QUASAR_` too. Here's a list:

```diff process.env -> import.meta.env
- process.env.DEV
- process.env.PROD
+ import.meta.env.QUASAR_DEV
+ import.meta.env.QUASAR_PROD

// notice the DEBUGGING -> DEBUG change!
- process.env.DEBUGGING
+ import.meta.env.QUASAR_DEBUG

- process.env.MODE
- process.env.TARGET
+ import.meta.env.QUASAR_MODE
+ import.meta.env.QUASAR_TARGET

- process.env.CLIENT
- process.env.SERVER
+ import.meta.env.QUASAR_CLIENT
+ import.meta.env.QUASAR_SERVER

- process.env.SERVICE_WORKER_FILE
- process.env.PWA_FALLBACK_HTML
- process.env.PWA_SERVICE_WORKER_REGEX
+ import.meta.env.QUASAR_SERVICE_WORKER_FILE
+ import.meta.env.QUASAR_PWA_FALLBACK_HTML
+ import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX

- process.env.QUASAR_ELECTRON_PRELOAD_FOLDER
- process.env.APP_URL
+ import.meta.env.QUASAR_ELECTRON_PRELOAD_FOLDER
+ import.meta.env.QUASAR_APP_URL
- // removed; use ".cjs" instead:
- process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION

// new boolean ones!
+ import.meta.env.QUASAR_SPA_MODE
+ import.meta.env.QUASAR_PWA_MODE
+ import.meta.env.QUASAR_SSR_MODE
+ import.meta.env.QUASAR_ELECTRON_MODE
+ import.meta.env.QUASAR_BEX_MODE
+ import.meta.env.QUASAR_CAPACITOR_MODE
+ import.meta.env.QUASAR_CORDOVA_MODE
```

### Quasar mode package.json

Edit your /package.json file to remove Quasar mode specific dependencies and move them over to new `/src-<mode>/package.json` (create them!):

```tabs /package.json to new /src-<mode>/package.json
<<| js BEX |>>
// create /src-bex/package.json:
{
  "name": "quasar-bex-app",
  "version": "1.0.0",
  "description": "Quasar BEX Folder",
  "private": true,
  "type": "module",
  "devDependencies": {
    "@types/chrome": "^0.1.40" // for TS only
  }
}
<<| js PWA |>>
// remove from /package.json
{
  "dependencies": {
    "register-service-worker": "^1.7.2"
  },
  "devDependencies": {
    "workbox-build": "^7.0.0",
    "workbox-cacheable-response": "^7.0.0",
    "workbox-core": "^7.0.0",
    "workbox-expiration": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0"
  }
}

// create /src-pwa/package.json:
{
  "name": "quasar-pwa-app",
  "version": "1.0.0",
  "description": "Quasar PWA Folder",
  "private": true,
  "type": "module",
  "dependencies": {
    "register-service-worker": "^1.7.2"
  },
  "devDependencies": {
    "workbox-build": "^7.0.0",
    "workbox-cacheable-response": "^7.0.0",
    "workbox-core": "^7.0.0",
    "workbox-expiration": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0"
  }
}
<<| js Electron |>>
// remove from /package.json
{
  "devDependencies": {
    "electron": "^42.0.0"
  }
}

// create /src-electron/package.json:
{
  "name": "quasar-electron-app",
  "version": "1.0.0",
  "description": "Quasar Electron Folder",
  "private": true,
  "type": "module",
  "devDependencies": {
    "electron": "^42.0.0"
  }
}
<<| js SSR |>>
// create /src-ssr/package.json:
{
  "name": "quasar-ssr-app-express",
  "version": "1.0.0",
  "description": "Quasar SSR server folder",
  "private": true,
  "type": "module",
  "dependencies": {
    "express": "^5.0.0",
    "compression": "^1.8.1",
    "helmet": "^8.1.0"
  },
  "devDependencies": {
    "@types/compression": "^1.8.1", // for TS only
    "@types/express": "^5.0.6" // for TS only
  }
}
```

### PNPM related

If using PNPM, also create a `pnpm-workspace.yaml` file inside `/src-<bex|pwa|electron|ssr>` with this content:

```bash /src-<bex|pwa|electron|ssr>/pnpm-workspace.yaml
# This file exists to force pnpm install deps here, regardless of upper workspaces
# https://pnpm.io/settings
```

Still for PNPM, edit your root project file `/pnpm-workspace.yaml`:

```tabs root /pnpm-workspace.yaml
<<| diff PNPM v11 |>>
- shamefullyHoist: true
- onlyBuiltDependencies:
-  - '@parcel/watcher'
-  - esbuild

+ allowBuilds:
+  '@parcel/watcher': true
+  core-js: true
+  electron-winstaller: true
+  esbuild: true
+  lightningcss: true
+  rolldown: true
+  unrs-resolver: true
<<| diff PNPM v10 |>>
- shamefullyHoist: true
- onlyBuiltDependencies:
-  - '@parcel/watcher'
-  - esbuild

+ onlyBuiltDependencies:
+  '@parcel/watcher': true
+  core-js: true
+  electron-winstaller: true
+  esbuild: true
+  lightningcss: true
+  rolldown: true
+  unrs-resolver: true
```

### Notable /quasar.config file changes

Edit your `/quasar.config` file. These are just the important changes that you need to be aware of:

```diff /quasar.config file
build: {
-  rawDefine: {}
+  define: {} // values need to be JSON.stringify()

-  env: {},
+  defineEnv: {} // or long form "define" with 'import.meta.env.' prefix in key

+  vueOptionsAPI // change to "true" if needed; defaults to "false" now!
-  polyfillModulePreload // deferring to Vite's default

+  // new! Vue Router v5+ filename-based routing
+  filenameBasedRouting: boolean | VueRouterVitePluginOptions
},

sourceFiles: {
   // defaults to: 'src-pwa/register-sw' now!
   // change file name or set to your current one:
+  pwaRegisterServiceWorker: 'src-pwa/register-service-worker',

   // defaults to 'src-pwa/custom-sw' now!
   // change file name or set to your current one:
+  pwaServiceWorker: 'src-pwa/custom-service-worker',
},

cordova: {
-  noIosLegacyBuildFlag: true, // no longer available; only modern build system
},

ssr: {
-  extendPackageJson (pkgJson) {},
+  // can now be async and optionally return object to be merged with default one
+  extendSSRPackageJson (pkgJson) {},

-  extendSSRWebserverConf (esbuildConf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendSSRWebserverConf (rolldownConf) {},

-  pwaExtendGenerateSWOptions (conf) {},
-  pwaExtendInjectManifestOptions (conf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendSSRGenerateSWOptions (conf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendSSRInjectManifestOptions (conf) {},
},

pwa: {
-  extendManifestJson (json) {},
+  // can now be async and optionally return object to be merged with default one
+  extendPWAManifestJson (json) {},

-  injectPwaMetaTags: boolean
+  injectPWAMetaTags: boolean

-  extendGenerateSWOptions (conf) {},
-  extendInjectManifestOptions (conf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendPWAGenerateSWOptions (conf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendPWAInjectManifestOptions (conf) {},

-  extendPWACustomSWConf (esbuildConf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendPWACustomSWConf (rolldownConf) {},
},

electron: {
-  extendPackageJson (pkgJson) {},
+  // can now be async and optionally return object to be merged with default one
+  extendElectronPackageJson (pkgJson) {},

-  extendElectronMainConf (esbuildConf) {},
-  extendElectronPreloadConf (esbuildConf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendElectronMainConf (rolldownConf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendElectronPreloadConf (rolldownConf) {},
},

bex: {
-  extendBexScriptsConf (esbuildConf) {},
+  // can now be async and optionally return object to be merged with default one
+  extendBexScriptsConf (rolldownConf) {},
}
```

### Typescript changes

Edit your `*-env.d.ts` files. Note that we are referencing types supplied by q/app-vite, so you don't have to write them yourself anymore.

```tabs *-env.d.ts changes
<<| diff /src/env.d.ts |>>
- declare namespace NodeJS {
-   interface ProcessEnv {
-     NODE_ENV: string;
-     VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
-     VUE_ROUTER_BASE: string | undefined;
-   }
- }

/// <reference types="@quasar/app-vite/client" />

/**
 * Uncomment and add types for your custom environment
 * variables to avoid TypeScript errors
 * when using them via import.meta.env.VARIABLE_NAME
 *
 * Example:
 *
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string
 *   readonly MY_OTHER_VAR: boolean
 * }
 */
// interface ImportMetaEnv {}
<<| diff /src-pwa/pwa-env.d.ts |>>
- declare namespace NodeJS {
-   interface ProcessEnv {
-     SERVICE_WORKER_FILE: string;
-     PWA_FALLBACK_HTML: string;
-     PWA_SERVICE_WORKER_REGEX: string;
-   }
- }

/// <reference types="@quasar/app-vite/client/pwa" />

/**
 * Uncomment and add types for your custom environment
 * variables to avoid TypeScript errors
 * when using them via import.meta.env.VARIABLE_NAME
 *
 * Example:
 *
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string
 *   readonly MY_OTHER_VAR: boolean
 * }
 */
// interface ImportMetaEnv {}
<<| diff /src-ssr/ssr-env.d.ts |>>
+ /// <reference types="@quasar/app-vite/client/ssr" />

+ /**
+  * Uncomment and add types for your custom environment
+  * variables to avoid TypeScript errors
+  * when using them via import.meta.env.VARIABLE_NAME
+  *
+  * Example:
+  *
+  * interface ImportMetaEnv {
+  *   readonly MY_VAR: string
+  *   readonly MY_OTHER_VAR: boolean
+  * }
+  */
+ // interface ImportMetaEnv {}
<<| diff /src-electron/electron-env.d.ts |>>
- declare namespace NodeJS {
-   interface ProcessEnv {
-     QUASAR_PUBLIC_FOLDER: string;
-     QUASAR_ELECTRON_PRELOAD_FOLDER: string;
-     QUASAR_ELECTRON_PRELOAD_EXTENSION: string;
-     APP_URL: string;
-   }
- }

/// <reference types="@quasar/app-vite/client/electron" />

/**
 * Uncomment and add types for your custom environment
 * variables to avoid TypeScript errors
 * when using them via import.meta.env.VARIABLE_NAME
 *
 * Example:
 *
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string
 *   readonly MY_OTHER_VAR: boolean
 * }
 */
// interface ImportMetaEnv {}
<<| diff /src-bex/bex-env.d.ts |>>
/// <reference types="@quasar/app-vite/client/bex" />
/// <reference types="@types/chrome" />

/**
 * Uncomment and add types for your custom environment
 * variables to avoid TypeScript errors
 * when using them via import.meta.env.VARIABLE_NAME
 *
 * Example:
 *
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string
 *   readonly MY_OTHER_VAR: boolean
 * }
 */
// interface ImportMetaEnv {}
```

### Install new deps

Then yarn/npm/pnpm/bun install in root folder and each `/src-<mode>` one and run `quasar prepare` in the root folder. Restart your IDE to make sure the new dependencies have been correctly picked up.

Make sure to update your `/quasar.config` file with the newest specs in order to satisfy the types. Check all following sections.

## Notable breaking changes

- All imports from `#q-app/wrappers` need to be replaced with `#q-app`. Do a global search and replace.
- Switched from `process.env` to the modern `import.meta.env`. [Link](/quasar-cli-vite/handling-import-meta-env)
- /quasar.config > build > vueOptionsAPI is now `false` by default
- /quasar.config > build > polyfillModulePreload (removed and now defaulting to Vite's own config for this)
- /index.html -> new [HTML Constant Replacement](/quasar-cli-vite/handling-import-meta-env#html-constant-replacement). `<% if (process.env.X) %>` will no longer work.
- New [dotenv files support](/quasar-cli-vite/dotenv-files-support), including for the `/quasar.config` file itself. By default, Quasar CLI will only look for `.env` and `.env.local`, but you can add other files as well to support the ones with prod/dev/mode suffixes.
- /quasar.config > `env` is now used by the new dotenv support. Dropped `build > rawDefine` as well. Use the new build > `define` & `defineEnv` instead. [Link](/quasar-cli-vite/handling-import-meta-env#adding-to-import-meta-env)
- Boot files & preFetch > redirect() usage has changed. Need to return immediately after calling it. No longer supporting throwing an error (or returning a Promise) with the `{ url }` syntax. Directly use `redirect()` instead.
- The /quasar.config file can come with `.js` or `.ts` extensions only. Dropped support for `.cjs`, `.mjs`, `.cts` and `.mts`.
- All Quasar Modes now need to install their specific dependencies directly under their `/src-<mode>` folder. On the Typescript front, we've reworked all `/src-<mode>/<mode>-env.d.ts` files too for increased ease of use (and partly due to the process.env to import.meta.env switch).
- Replaced `esbuild` tool with `Rolldown` for all the specific Quasar mode files (under their `/src-<mode>` folders). This also has impact over all the /quasar.config `extendX()` methods, as they will now receive a Rolldown config object.
- All /quasar.config `extendX()` methods can now be async and optionally return a (Rolldown/etc) config that will be merged with the default one.
- Dropped support for Capacitor v4 and below
- Dropped support for `@electron/packager` v18 and below
- Cordova with iOS now uses the modern build system. The `noIosLegacyBuildFlag` has been removed.
- The "quasar dev -m cordova" command now opens up the corresponding IDE instead (just like Capacitor mode)
- The "quasar dev/build -m bex" command now defaults to "chrome" target, so the `-t|--target` option can be ommitted.

## Electron mode changes

We are introducing `quasarRuntime`. [More info](/quasar-cli-vite/developing-electron-apps/electron-accessing-files).

Move your `/src-electron/icons` to `/src-electron/electron-assets/icons` (create the new `electron-assets` folder).

### Preload script

```js /src-electron/electron-preload (Optional!)
/**
 * Only one preload script should contain this
 */

import { contextBridge } from 'electron'
import { quasarRuntime } from '#q-app/electron/preload'

/**
 * Can be used in the renderer process through `window.quasarRuntime`
 */
contextBridge.exposeInMainWorld('quasarRuntime', quasarRuntime)
```

### Main script

And you might also want to update your `/src-electron/electron-main` script:

```tabs /src-electron/electron-main
<<| diff Diff |>>
- import { fileURLToPath } from 'url'
- const currentDir = fileURLToPath(new URL('.', import.meta.url));

+ import {
+  registerQuasarRuntime,
+  resolveElectronAssetsPath
+ } from "#q-app/electron/main";

- let mainWindow: BrowserWindow | undefined;
- async function createWindow() {
-  mainWindow = new BrowserWindow({
-    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
-    webPreferences: {
-      preload: path.resolve(
-        currentDir,
-        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
-      ),
-    },
+ async function createWindow() {
+  const mainWindow = new BrowserWindow({
+    icon: resolveElectronAssetsPath("icons/icon.png"), // linux
+    webPreferences: {
+      preload: path.join(import.meta.dirname, "electron-preload.cjs")
+    },

-  if (process.env.DEV) {
-    await mainWindow.loadURL(process.env.APP_URL);
-  }
+  if (import.meta.env.QUASAR_DEV) {
+    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
+  }

-  mainWindow.on('closed', () => {
-    mainWindow = undefined;
-  });
}

- void app.whenReady().then(createWindow);
- app.on('window-all-closed', () => {
-  if (platform !== 'darwin') {
-    app.quit();
-  }
- });
- app.on('activate', () => {
-  if (mainWindow === undefined) {
-    void createWindow();
-  }
- });
+ void app.whenReady().then(async () => {
+   await registerQuasarRuntime();
+   void createWindow();
+   app.on("activate", () => {
+     if (BrowserWindow.getAllWindows().length === 0) {
+       void createWindow();
+     }
+   });
+ });
+ app.on("window-all-closed", () => {
+   if (platform !== "darwin") {
+     app.quit();
+   }
+ });
<<| js Full (JS) |>>
import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import os from 'node:os'
import {
  registerQuasarRuntime,
  resolveElectronAssetsPath
} from '#q-app/electron/main'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

async function createWindow () {
  /**
   * Initial window options
   */
  const mainWindow = new BrowserWindow({
    icon: resolveElectronAssetsPath('icons/icon.png'), // linux
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.join(import.meta.dirname, 'electron-preload.cjs')
    }
  })

  if (import.meta.env.QUASAR_DEV) {
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (import.meta.env.QUASAR_DEBUG) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }
}

void app.whenReady().then(async () => {
  await registerQuasarRuntime()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})
<<| ts Full (Typescript) |>>
import { BrowserWindow, app } from "electron";
import path from "node:path";
import os from "node:os";
import {
  registerQuasarRuntime,
  resolveElectronAssetsPath
} from "#q-app/electron/main";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

async function createWindow() {
  /**
   * Initial window options
   */
  const mainWindow = new BrowserWindow({
    icon: resolveElectronAssetsPath("icons/icon.png"), // linux
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.join(import.meta.dirname, "electron-preload.cjs")
    }
  });

  if (import.meta.env.QUASAR_DEV) {
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
  } else {
    await mainWindow.loadFile("index.html");
  }

  if (import.meta.env.QUASAR_DEBUG) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
}

void app.whenReady().then(async () => {
  await registerQuasarRuntime();

  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});
```

### Other Electron Mentions

- Don't forget to look over the [Installing Electron Dependencies](/quasar-cli-vite/developing-electron-apps/installing-electron-dependencies) page.
- You might want to check out the updated [Frameless Electron Window](/quasar-cli-vite/developing-electron-apps/frameless-electron-window) page.

## SSR mode changes

We've added way better support for non-Express.js webservers and highly improved typings. When the SSR mode is added to a project, the Quasar CLI will ask what webserver you would like to use. You can pick from Hono/Express.js/Fastify/Koa.

Instead of diffing here, you might want to check the next pages (even if you still want to stay with Express.js):

- [Installing SSR Dependencies](/quasar-cli-vite/developing-ssr/installing-ssr-dependencies)
- Webserver: check out examples with Hono/Express/Fastify/Koa: [SSR Webserver](/quasar-cli-vite/developing-ssr/ssr-webserver); or remove and add SSR mode again.
- Middlewares: check out examples with Hono/Express/Fastify/Koa: [SSR Middleware](/quasar-cli-vite/developing-ssr/ssr-middleware); or remove and add SSR mode again.
- Check out the [SSR Handling of 404 and 500 Errors](/quasar-cli-vite/developing-ssr/handling-404-and-500-errors) page.
- If using a serverless architecture, then check out the new [Serverless](/quasar-cli-vite/developing-ssr/ssr-webserver#serverless) section in SSR Webserver page.
- You might also want to use thew new `/src-ssr/server-assets` folder (create it). This is copied as-is to dist and can be used in dev too, through `resolve.serverAssets()` or `folders.serverAssets`.
- One more thing to note, for SSR middlewares: `serve.error()` has been changed to `serve.devError()` (with new params).

## Other considerations

### CSP (Content Security Policy)

You may want to add a CSP meta tag in your `/index.html`. This is especially useful for Electron mode where a warning about the lack of one is displayed, but it's a good security measure for all Quasar Modes too:

```html
<!doctype html>
<html>
  <head>
    <!-- add to the head -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';<% if (ctx.dev) { %> connect-src 'self' ws://localhost:*; worker-src 'self' blob:;<% } %>"
    />
  </head>
</html>
```

### Typescript 7

You may also want to upgrade to Typescript 7, which is written in Go for extra speed! As of writing these lines and per Microsoft's own upgrade guide, you need to install:

```diff /package.json
"devDependencies": {
-  "typescript": "...",
+  "typescript": "npm:@typescript/typescript6@^6.0.0"
}
```

Once they release TS 7 directly under the `typescript`, this is what you may want to use. Disregard the `6` in the name. It's not a mistake.

### Switching to Oxlint and Oxfmt

You may also want to switch your linting and formatting to `oxlint` and `oxfmt`. In our opinion, this is the future anyway. At some point in the near future, Quasar's project scaffolding package will only offer this for linting.

As of writing these lines, the support for `.vue` files is not yet fully ready, but you will still be able to enjoy it a lot.

[More info](/quasar-cli-vite/lint-and-format-code#oxlint-oxfmt)

### Filename-based routing with Vue Router v5+

We now have first-class support for Vue Router's filename-based routing.

You might want to [give it a try](/quasar-cli-vite/page-routing-with-vue-router#filename-based-routing).

### New CLI option: --nocolor

By default, all CLI commands output colored text in the terminal (when not running in a CI environment). Should you wish to avoid this, use the `--nocolor` when you run any of the CLI commands.

## Final Note

A quick favor to ask: Please consider supporting our efforts! If you use Quasar at work, drop a message to your management about sponsoring us at [https://donate.quasar.dev/](https://donate.quasar.dev/). We rely on your support to make massive updates like this possible!

And don't forget to enjoy your new modern setup! That's it! 🚀
