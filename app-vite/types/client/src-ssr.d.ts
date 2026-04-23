interface ImportMetaEnv extends Record<string, any> {
  readonly QUASAR_DEV: boolean;
  readonly QUASAR_PROD: boolean;
  readonly QUASAR_DEBUG: boolean;

  readonly QUASAR_MODE: "ssr";
  readonly QUASAR_SPA_MODE: false;
  readonly QUASAR_SSR_MODE: true;
  readonly QUASAR_PWA_MODE: boolean;
  readonly QUASAR_CORDOVA_MODE: false;
  readonly QUASAR_CAPACITOR_MODE: false;
  readonly QUASAR_ELECTRON_MODE: false;
  readonly QUASAR_BEX_MODE: false;

  readonly QUASAR_TARGET: undefined;

  readonly QUASAR_SERVER: true;
  readonly QUASAR_CLIENT: false;

  readonly QUASAR_VUE_ROUTER_MODE: "hash" | "history" | "abstract";
  readonly QUASAR_VUE_ROUTER_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
