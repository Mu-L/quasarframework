interface ImportMetaEnv {
  readonly QUASAR_SERVICE_WORKER_FILE: string;
  readonly QUASAR_PWA_FALLBACK_HTML: string;
  readonly QUASAR_PWA_SERVICE_WORKER_REGEX: string;

  readonly QUASAR_DEV: boolean;
  readonly QUASAR_PROD: boolean;
  readonly QUASAR_DEBUG: boolean;

  readonly QUASAR_MODE: "pwa";
  readonly QUASAR_SPA_MODE: false;
  readonly QUASAR_SSR_MODE: boolean;
  readonly QUASAR_PWA_MODE: true;
  readonly QUASAR_CORDOVA_MODE: false;
  readonly QUASAR_CAPACITOR_MODE: false;
  readonly QUASAR_ELECTRON_MODE: false;
  readonly QUASAR_BEX_MODE: false;

  readonly QUASAR_TARGET: undefined;

  readonly QUASAR_SERVER: false;
  readonly QUASAR_CLIENT: true;

  readonly QUASAR_VUE_ROUTER_MODE: "hash" | "history" | "abstract";
  readonly QUASAR_VUE_ROUTER_BASE: string;
}
