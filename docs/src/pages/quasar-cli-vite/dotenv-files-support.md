---
title: Dotenv files support
desc: (@quasar/app-vite) How to use dotenv files to inject into import.meta.env in a Quasar app.
related:
  - /quasar-cli-vite/handling-import-meta-env
---

A `.env` file (pronounced "dotenv") is a simple text file used to store environment variables for a software project. Instead of hardcoding sensitive information or configuration settings directly into the source code, you can place them in this file.

The variables defined get transformed to `import.meta.env.<VAR_NAME>` and replaced at build time.

::: tip
Before going forward, it would be a good idea to first familiarize yourself with how Quasar CLI [Handles import.meta.env](/quasar-cli-vite/handling-import-meta-env).
:::

## Why Use a .env File?

- Security: It keeps sensitive data—like database passwords, API keys, and secret tokens—safe. Because .env files are kept out of version control (like GitHub), your secrets aren't exposed to the public or everyone on your team.
- Portability: It allows your application to behave differently depending on the environment (development, testing, or production) without changing the code. You just swap out the .env file for each environment.
- Simplicity: It centralizes configuration into one easy-to-read file.

## What Does It Look Like?

A `.env` file uses a straightforward `KEY=VALUE` format. There are no spaces around the equals sign, and quotes are usually only needed if the value contains spaces.

```bash /.env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=super_secret_password
DB_PORT=5432

# API Keys
STRIPE_API_KEY=sk_test_123456789
NODE_ENV=development
```

## The Golden Rule of Dotenv

Never commit your .env file to version control.

You must always add .env to your project's .gitignore file immediately. If you accidentally push a .env file containing real API keys to a public repository, bots can scrape those keys in seconds and exploit them.

Instead, you might want to include a `.env.example` or `.env.template` file in the project folder. This file includes the keys but leaves the values blank or fills them with dummy data, showing other developers what variables the project needs to run:

```bash /.env.template
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_PORT=
STRIPE_API_KEY=
NODE_ENV=
```

## Usage

### Quasar CLI Dotenv Files

These files will be automatically detected and used (the order matters):

```
.env        # loaded in all cases
.env.local  # loaded in dev only, ignored by git
```

...where "ignored by git" assumes a default project folder created after releasing this package, otherwise add `.env.local` to your `/.gitignore` file.

For security purposes and exposing variables with clear intent only, Quasar CLI filters out variables names not starting with the `QCLI_` prefix for the code exposed to the client-side, while leaving all of them for backend code (example: SSR server-side code that the clients cannot view it directly). This prefix can be changed through the /quasar.config file.

```bash
# NOT exposed to client code, but exposed to backend;
# it does NOT start with QCLI_ prefix:
SOME_VAR=content

# this will be embedded into backend & client code,
# as it starts with QCLI_ prefix:
QCLI_SOME_VAR=content
```

```js Usage example
import.meta.env.SOME_VAR // ❌ Not available in client code
import.meta.env.QCLI_SOME_VAR // ✅ Available in client code
```

### Configuring Dotenv Files

```js /quasar.config file
build: {
  env: {
    /**
     * For security reasons, only variables with this prefix from the env files
     * and Node.js process.env will be exposed to the code shipped to the client.
     * The client app code includes Electron main & preload scripts, as they get
     * shipped to the client side as well.
     *
     * Such variables exposed to the client app code should not contain sensitive
     * information such as API keys.
     *
     * Avoid setting it to 'QUASAR_' so it won't conflict with
     * Quasar's own environment variables.
     *
     * Setting it to an empty string will default to
     * the default value (QCLI_).
     *
     * @default 'QCLI_'
     */
    clientPrefix?: string | string[];
    /**
     * Setting this prefix will filter out env files variables and Node.js process.env
     * variables that are exposed to the backend code (like the SSR server-side).
     *
     * Avoid setting it to 'QUASAR_' so it won't conflict with
     * Quasar's own environment variables.
     *
     * @default ''
     */
    backendPrefix?: string | string[];
    /**
     * Folder where Quasar CLI should look for .env* files.
     * Can be an absolute path or a relative path to project root directory.
     *
     * @default appPaths.appDir
     */
    folder?: string | string[];
    /**
     * Additional .env* files to be loaded.
     * Each entry can be an absolute path or a relative path to
     * quasar.config > build > folder.
     *
     * @example ['.env.somefile', '../.env.someotherfile']
     */
    file?: string | string[];
    /**
     * Filter the env files variables & Node.js process.env variables
     * that are exposed to the app code. This does not affects props
     * assigned directly to the quasar.config > build > define prop.
     */
    filter?: (
      env: Record<string, string>,
      type: "client" | "backend"
    ) => Record<string, string>;
  }
}
```

Remember that you can further filter out unwanted keys, or even change values for keys by using `build > env > filter` function:

```js /quasar.config file
build: {
  env: {
    filter (
      originalEnv,
      type // "client" | "backend"
    ) {
      const newEnv = {}
      for (const key in originalEnv) {
        if (/* ...decide if it goes in or not... */) {
          newEnv[ key ] = originalEnv[ key ]
        }
      }

      // remember to return your processed env
      return newEnv
    }
  }
}
```

### Dotenv Files for /quasar.config file itself

Quasar CLI detects dotenv files and uses them for the /quasar.config file itself. However, should you want to configure the behaviour, you will need to edit your /package.json:

```json /package.json file
"quasarCli": {
  "quasarConfEnv": {
    /**
     * Setting this prefix will filter out env files variables and Node.js process.env
     * variables that are exposed.
     *
     * Avoid setting it to 'QUASAR_' so it won't conflict with
     * Quasar's own environment variables.
     *
     * @default ''
     */
    "prefix": "",
    /**
     * Folder where Quasar CLI should look for .env* files.
     * Can be an absolute path or a relative path to project root directory.
     *
     * @default root project file dir
     */
    "folder": "."
    /**
     * Additional .env* files to be loaded.
     * Each entry can be an absolute path or a relative path to
     * quasar.config > build > folder.
     *
     * @example ['.env.somefile', '../.env.someotherfile']
     */
    "file": []
  }
}
```

Usage in the `/quasar.config` file, given that you defined `HTML_MY_VAR` in `/.env`:

```js /quasar.config file example
import { defineConfig } from '#q-app'

export default defineConfig(ctx => {
  return {
    htmlVariables: {
      myVar: import.meta.env.HTML_MY_VAR // <-- notice here
    }
  }
})
```

## HMR (Hot Module Reload)

Adding/removing/changing dotenv files (both the default and the configured ones) will immediately take effect, so you won't have to restart the Quasar CLI devserver.
