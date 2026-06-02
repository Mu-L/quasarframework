---
title: Configuring Capacitor
desc: (@quasar/app-vite) How to manage your Capacitor apps with Quasar CLI.
related:
  - /quasar-cli-vite/quasar-config-file
---

We'll be using Quasar CLI to develop and build a Mobile App. The difference between building a SPA, PWA, Electron App or a Mobile App is simply determined by the "mode" parameter in "quasar dev" and "quasar build" commands.

There are two configuration files of great importance to your mobile apps. We'll go over each one.

## capacitor.config.json

The most important config file for your mobile app is `/src-capacitor/capacitor.config.json`. The `/src-capacitor` folder is a Capacitor project, so please refer to [Capacitor documentation](https://capacitorjs.com) in order to understand what each file from there does. But for now, have a few moments to read about [capacitor.config.json](https://capacitorjs.com/docs/basics/configuring-your-app).

The `appId` and `appName` fields are captured once via prompts when you run `quasar mode add capacitor`. They're applied to the native projects at platform-add time (`cap add android` / `cap add ios`). Due to how Capacitor works, changing them later in `capacitor.config.json` won't propagate to existing native projects. Edit `ios/App/App/Info.plist > CFBundleDisplayName` and `android/app/src/main/res/values/strings.xml > app_name` directly.

## quasar.config file

There are two places in the `/quasar.config` file where you can configure Quasar specific features for Capacitor.

```ts /quasar.config file
return {
  capacitor: {
    /**
     * Automatically hide the Capacitor Splashscreen when app is ready,
     * (is using the Splashscreen Capacitor plugin).
     *
     * @default true
     */
    hideSplashscreen?: boolean;

    /**
     * Preparation params with which the Capacitor CLI is called
     *
     * @default [ 'sync', ctx.targetName ]
     */
    capacitorCliPreparationParams?: string[];
  }
}
```

And you can also configure:

```js /quasar.config file
return {
  framework: {
    config: {
      capacitor: {
        iosStatusBarPadding: true / false // add the dynamic top padding on iOS mobile devices
      }
    }
  }
}
```

Finally, you can also disable or configure the back button hook (used for Dialogs):

```js /quasar.config file
return {
  framework: {
    config: {
      capacitor: {
        // Quasar handles app exit on mobile phone back button.
        backButtonExit: true / false / '*' / ['/login', '/home', '/my-page'],

        // On the other hand, the following completely
        // disables Quasar's back button management.
        backButton: true / false
      }
    }
  }
}
```

Should you want to tamper with the Vite config for UI in /src:

```js /quasar.config file
export default defineConfig(ctx => {
  return {
    build: {
      extendViteConf(viteConf) {
        if (ctx.mode.capacitor) {
          // do something with viteConf
          // or return an object to deeply merge with current viteConf
        }
      }
    }
  }
})
```
