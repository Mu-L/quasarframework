interface ImportMetaEnv extends Record<string, any> {
  readonly QUASAR_APP_URL: string;
  readonly QUASAR_PUBLIC_FOLDER: string;
  readonly QUASAR_ELECTRON_PRELOAD_FOLDER: string;
  readonly QUASAR_ELECTRON_PRELOAD_EXTENSION: string;

  readonly QUASAR_DEV: boolean;
  readonly QUASAR_PROD: boolean;
  readonly QUASAR_DEBUG: boolean;

  readonly QUASAR_MODE: "electron";
  readonly QUASAR_SPA_MODE: false;
  readonly QUASAR_SSR_MODE: false;
  readonly QUASAR_PWA_MODE: false;
  readonly QUASAR_CORDOVA_MODE: false;
  readonly QUASAR_CAPACITOR_MODE: false;
  readonly QUASAR_ELECTRON_MODE: true;
  readonly QUASAR_BEX_MODE: false;

  readonly QUASAR_TARGET:
    | "all"
    | "darwin"
    | "win32"
    | "linux"
    | "win"
    | "mac"
    | "mas";

  readonly QUASAR_SERVER: false;
  readonly QUASAR_CLIENT: true;

  readonly QUASAR_VUE_ROUTER_MODE: "hash" | "history" | "abstract";
  readonly QUASAR_VUE_ROUTER_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
