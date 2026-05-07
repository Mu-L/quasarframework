# Quasar App Extension <%= scope.name %> (<%= scope.pkgName %>)

> TODO: Add a short description of your App Extension. What does it do? How is it beneficial? Why would someone want to use it?

[![npm](https://img.shields.io/npm/v/<%= scope.pkgName %>.svg?label=<%= scope.pkgName %>)](https://www.npmjs.com/package/<%= scope.pkgName %>)
[![npm](https://img.shields.io/npm/dt/<%= scope.pkgName %>.svg)](https://www.npmjs.com/package/<%= scope.pkgName %>)

# Install

```bash
quasar ext add <%= scope.name %>
```

Quasar CLI will retrieve it from NPM and install the extension.

## Global component typings

Add this to `src/quasar.d.ts` to load the global component typings:
```ts
// Load global component typings
/// <reference types="<%= scope.pkgName %>" />
```

## Prompts

> TODO: If your app extension uses prompts, explain them here, otherwise remove this section and remove prompts.ts file.

# Uninstall

```bash
quasar ext remove <%= scope.name %>
```

# Info

> TODO: Add longer information here that will help the user of your app extension.

# Other Info

> TODO: Add other information that's not as important to know

# Development

See [the root README](../README.md) for more information.

# Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).

# License

MIT (c) <%= scope.author %>
