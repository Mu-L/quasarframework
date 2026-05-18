# <%= scope.productName %> (<%= scope.name %>)

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```
<% if (scope.preset.eslint) { %>

### Lint the files
```bash
yarn lint
# or
npm run lint
```
<% if (scope.prettier) { %>

### Format the files
```bash
yarn format
# or
npm run format
```
<% } } %>

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://legacy-app.quasar.dev/quasar-cli-webpack-v4/quasar-config-js).
