interface ImportMetaEnv extends Record<string, any> {
  readonly QUASAR_DEV: boolean;
  readonly QUASAR_PROD: boolean;
  readonly QUASAR_DEBUG: boolean;

  readonly QUASAR_MODE: "bex";
  readonly QUASAR_SPA_MODE: false;
  readonly QUASAR_SSR_MODE: false;
  readonly QUASAR_PWA_MODE: false;
  readonly QUASAR_CORDOVA_MODE: false;
  readonly QUASAR_CAPACITOR_MODE: false;
  readonly QUASAR_ELECTRON_MODE: false;
  readonly QUASAR_BEX_MODE: true;

  readonly QUASAR_TARGET: "chrome" | "firefox";

  readonly QUASAR_SERVER: false;
  readonly QUASAR_CLIENT: true;

  readonly QUASAR_VUE_ROUTER_MODE: "hash" | "history" | "abstract";
  readonly QUASAR_VUE_ROUTER_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
