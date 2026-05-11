import { UserConfig as ViteUserConfig } from "vite";
import { GenerateSWOptions, InjectManifestOptions } from "workbox-build";
import { IResolve } from "./app-paths";
import { QuasarConf, ResolvedQuasarConfValue } from "./configuration/conf";
import { QuasarContext } from "./configuration/context";
import { PwaManifestOptions } from "./configuration/pwa-conf";
import { RolldownOptions } from "rolldown";

type ExtendViteConfHandler = (
  fn: (
    ...args: [
      ...Parameters<ResolvedQuasarConfValue<"build.extendViteConf">>,
      api: IndexAPI
    ]
  ) => ViteUserConfig | void | Promise<ViteUserConfig | void>
) => void;

type GetPersistentConfHandler = () => Record<string, unknown>;
type HasExtensionHandler = (extId: string) => boolean;

interface BaseAPI {
  readonly engine: "@quasar/app-vite";

  readonly ctx: QuasarContext;
  readonly extId: string;
  readonly resolve: IResolve;
  readonly appDir: string;

  readonly hasVite: true;
  readonly hasWebpack: false;

  readonly hasTypescript: () => Promise<boolean>;
  readonly getStorePackageName: () => "pinia" | undefined;
  readonly getNodePackagerName: () => Promise<"npm" | "yarn" | "pnpm" | "bun">;
}

interface SharedIndexInstallAPI {
  readonly getPersistentConf: GetPersistentConfHandler;
  readonly setPersistentConf: (cfg: Record<string, unknown>) => void;
  readonly mergePersistentConf: (cfg: Record<string, unknown>) => void;
  readonly compatibleWith: (
    packageName: string,
    semverCondition?: string
  ) => void;
  readonly hasPackage: (
    packageName: string,
    semverCondition?: string
  ) => boolean;
  readonly hasExtension: HasExtensionHandler;
  readonly getPackageVersion: (packageName: string) => string | undefined;
}

type Callback<T> = (callback: T) => void;

export interface IndexAPI extends BaseAPI, SharedIndexInstallAPI {
  readonly prompts: Record<string, unknown>;

  readonly extendQuasarConf: Callback<
    (
      cfg: QuasarConf,
      api: IndexAPI
    ) => QuasarConf | void | Promise<QuasarConf | void>
  >;

  readonly extendViteConf: ExtendViteConfHandler;

  /**
   * Extend the Rolldown config that is used for the bex scripts
   * (background, content scripts, dom script).
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendBexScriptsConf: Callback<
    (
      cfg: RolldownOptions,
      api: IndexAPI
    ) => void | RolldownOptions | Promise<void | RolldownOptions>
  >;

  /**
   * Should you need some dynamic changes to the Browser Extension manifest file
   * (/src-bex/manifest.json) then use this method to do it.
   *
   * Can directly modify the "json" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendBexManifestJson: (
    json: object,
    api: IndexAPI
  ) => void | object | Promise<void | object>;

  /**
   * Extend the Rolldown config that is used for the electron-main thread.
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendElectronMainConf: Callback<
    (
      cfg: RolldownOptions,
      api: IndexAPI
    ) => void | RolldownOptions | Promise<void | RolldownOptions>
  >;

  /**
   * Extend the Rolldown config that is used for the electron-preload thread.
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendElectronPreloadConf: Callback<
    (
      cfg: RolldownOptions,
      api: IndexAPI
    ) => void | RolldownOptions | Promise<void | RolldownOptions>
  >;

  /**
   * Add/remove/change properties of Electron production generated package.json
   *
   * Can directly modify the "pkgJson" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendElectronPackageJson: (
    pkgJson: { [index in string]: any },
    api: IndexAPI
  ) =>
    | void
    | { [index in string]: any }
    | Promise<void | { [index in string]: any }>;

  /**
   * Should you need some dynamic changes to the /src-pwa/manifest.json,
   * use this method to do it.
   *
   * Can directly modify the "json" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendPWAManifestJson: (
    json: PwaManifestOptions,
    api: IndexAPI
  ) => void | PwaManifestOptions | Promise<void | PwaManifestOptions>;

  /**
   * Extend the Rolldown config that is used for the custom service worker
   * (if using it through workboxMode: 'InjectManifest').
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendPWACustomSWConf: Callback<
    (
      cfg: RolldownOptions,
      api: IndexAPI
    ) => void | RolldownOptions | Promise<void | RolldownOptions>
  >;

  /**
   * Extend/configure the Workbox GenerateSW options.
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendPWAGenerateSWOptions: (
    config: GenerateSWOptions,
    api: IndexAPI
  ) => void | GenerateSWOptions | Promise<void | GenerateSWOptions>;

  /**
   * Extend/configure the Workbox InjectManifest options.
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendPWAInjectManifestOptions: (
    config: InjectManifestOptions,
    api: IndexAPI
  ) => void | InjectManifestOptions | Promise<void | InjectManifestOptions>;

  /**
   * Extend the Rolldown config that is used for the SSR webserver
   * (which includes the SSR middlewares).
   *
   * Can directly modify the "rolldownConf" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendSSRWebserverConf: Callback<
    (
      cfg: RolldownOptions,
      api: IndexAPI
    ) => void | RolldownOptions | Promise<void | RolldownOptions>
  >;

  /**
   * Add/remove/change properties of SSR production generated package.json
   *
   * Can directly modify the "pkgJson" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendSSRPackageJson: (
    pkgJson: { [index in string]: any },
    api: IndexAPI
  ) =>
    | void
    | { [index in string]: any }
    | Promise<void | { [index in string]: any }>;

  /**
   * Extend/configure the Workbox GenerateSW options
   * Specify Workbox options which will be applied on top of
   *  `pwa > extendPWAGenerateSWOptions()`.
   * More info: https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendSSRGenerateSWOptions: (
    config: GenerateSWOptions,
    api: IndexAPI
  ) => void | GenerateSWOptions | Promise<void | GenerateSWOptions>;

  /**
   * Extend/configure the Workbox InjectManifest options
   * Specify Workbox options which will be applied on top of
   *  `pwa > extendPWAInjectManifestOptions()`.
   * More info: https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   */
  readonly extendSSRInjectManifestOptions: (
    config: InjectManifestOptions,
    api: IndexAPI
  ) => void | InjectManifestOptions | Promise<void | InjectManifestOptions>;

  readonly registerCommand: (
    commandName: string,
    fn: (params: {
      args: string[];
      params: Record<string, any>;
    }) => Promise<void> | void
  ) => void;

  readonly registerDescribeApi: (name: string, relativePath: string) => void;

  readonly beforeDev: Callback<
    (api: IndexAPI, payload: { quasarConf: QuasarConf }) => Promise<void> | void
  >;
  readonly afterDev: Callback<
    (api: IndexAPI, payload: { quasarConf: QuasarConf }) => Promise<void> | void
  >;
  readonly beforeBuild: Callback<
    (api: IndexAPI, payload: { quasarConf: QuasarConf }) => Promise<void> | void
  >;
  readonly afterBuild: Callback<
    (api: IndexAPI, payload: { quasarConf: QuasarConf }) => Promise<void> | void
  >;
  readonly onPublish: Callback<
    (
      api: IndexAPI,
      opts: { arg: string; distDir: string }
    ) => Promise<void> | void
  >;
}

type ExitLogHandler = (msg: string) => void;
export interface InstallAPI extends BaseAPI, SharedIndexInstallAPI {
  readonly prompts: Record<string, unknown>;

  readonly extendPackageJson: (extPkg: object | string) => void;
  readonly extendJsonFile: (file: string, newData: object) => void;
  readonly render: (templatePath: string, scope?: object) => void;
  readonly renderFile: (
    relativeSourcePath: string,
    relativeTargetPath: string,
    scope?: object
  ) => void;
  readonly onExitLog: ExitLogHandler;
}

export interface UninstallAPI extends BaseAPI {
  readonly prompts: Record<string, unknown>;

  readonly getPersistentConf: GetPersistentConfHandler;
  readonly hasExtension: HasExtensionHandler;
  readonly removePath: (__path: string) => void;
  readonly onExitLog: ExitLogHandler;
}

export interface PromptsAPI extends BaseAPI {
  readonly compatibleWith: (
    packageName: string,
    semverCondition?: string
  ) => void;
  readonly hasPackage: (
    packageName: string,
    semverCondition?: string
  ) => boolean;
  readonly hasExtension: HasExtensionHandler;
  readonly getPackageVersion: (packageName: string) => string | undefined;
}
