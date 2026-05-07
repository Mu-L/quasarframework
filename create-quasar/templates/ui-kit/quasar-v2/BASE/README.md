<img src="https://img.shields.io/npm/v/quasar-ui-<%= scope.name %>.svg?label=quasar-ui-<%= scope.name %>">
<% if (scope.features.ae) { %><img src="https://img.shields.io/npm/v/quasar-app-extension-<%= scope.name %>.svg?label=quasar-app-extension-<%= scope.name %>"><% } %>

Compatible with Quasar UI v2 and Vue 3.

# Structure
* [/ui](ui) - standalone npm package
<% if (scope.features.ae) { %>
* [/app-extension](app-extension) - Quasar app extension
<% } %>

# Donate
If you appreciate the work that went into this project, please consider [donating to Quasar](https://donate.quasar.dev).

# License
MIT (c) <%= scope.author %>
