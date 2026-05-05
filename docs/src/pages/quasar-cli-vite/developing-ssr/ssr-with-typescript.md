---
title: SSR with Typescript
desc: (@quasar/app-vite) How to use Typescript with SSR in Quasar
---

In order to support SSR with Typescript, you will need to rename all your files in /src-ssr from `.js` to `.ts` and make the necessary TS code changes.

Check the [SSR Webserver](/quasar-cli-vite/developing-ssr/ssr-webserver) and [SSR Middleware](/quasar-cli-vite/developing-ssr/ssr-middleware) pages for examples with Typescript.

Depending on the webserver of your choice, you may also need to additionally [install @types/\* packages](/quasar-cli-vite/developing-ssr/installing-ssr-dependencies) into your /src-ssr folder.

As opposed to a Javascript project, you will need `/src-ssr/ssr-env.d.ts` in order to have correct typing:

```ts /src-ssr/ssr-env.d.ts
/// <reference types="@quasar/app-vite/client/ssr" />

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
