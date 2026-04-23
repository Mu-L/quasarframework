interface ImportMetaEnv {
  readonly QUASAR_DEV: boolean;
  readonly QUASAR_PROD: boolean;
  readonly QUASAR_DEBUG: boolean;

  readonly QUASAR_MODE:
    | "spa"
    | "ssr"
    | "pwa"
    | "cordova"
    | "capacitor"
    | "electron"
    | "bex";

  readonly QUASAR_SPA_MODE: boolean;
  readonly QUASAR_SSR_MODE: boolean;
  readonly QUASAR_PWA_MODE: boolean;
  readonly QUASAR_CORDOVA_MODE: boolean;
  readonly QUASAR_CAPACITOR_MODE: boolean;
  readonly QUASAR_ELECTRON_MODE: boolean;
  readonly QUASAR_BEX_MODE: boolean;

  readonly QUASAR_TARGET:
    | "chrome"
    | "firefox"
    | "all"
    | "darwin"
    | "win32"
    | "linux"
    | "win"
    | "mac"
    | "mas"
    | undefined;

  readonly QUASAR_SERVER: boolean;
  readonly QUASAR_CLIENT: boolean;

  readonly QUASAR_VUE_ROUTER_MODE: "hash" | "history" | "abstract";
  readonly QUASAR_VUE_ROUTER_BASE: string;
}
