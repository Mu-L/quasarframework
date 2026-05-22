---
title: PWA with Typescript
desc: (@quasar/app-vite) How to use Typescript with Quasar PWA
---

In order to support PWA with Typescript, you will need to rename the extension for your files in /src-pwa from `.js` to `.ts` and make the necessary TS code changes.

Also create these files:

```js /src-pwa/pwa-env.d.ts
/// <reference types="vite/client" />
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
```

```js /src-pwa/tsconfig.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["WebWorker", "ESNext"]
  }
}
```

```js /src-pwa/custom-sw.ts
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

void self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

if (import.meta.env.QUASAR_PROD) {
  // Non-SSR fallbacks to index.html
  // Production SSR fallbacks to offline.html (except for dev)
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(import.meta.env.QUASAR_PWA_FALLBACK_HTML),
      {
        denylist: [
          new RegExp(import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX),
          /workbox-(.)*\.js$/
        ]
      }
    )
  );
}
```
