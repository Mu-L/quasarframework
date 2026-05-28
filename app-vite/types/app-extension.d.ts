import type { UserConfig as ViteUserConfig } from "vite";
import type { GenerateSWOptions, InjectManifestOptions } from "workbox-build";
import type { RolldownOptions } from "rolldown";
import { QuasarAppPathsResolve } from "./app-paths";
import { QuasarConf, ResolvedQuasarConfValue } from "./configuration/conf";
import { QuasarContext } from "./configuration/context";
import { PwaManifestOptions } from "./configuration/pwa-conf";

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
  /**
   * Quasar ctx (context) object.
   * @type ctx {@link QuasarContext}
   */
  readonly ctx: QuasarContext;
  readonly extId: string;
  /**
   * Utility functions to resolve absolute paths to the app's various directories.
   * @type resolve {@link QuasarAppPathsResolve}
   */
  readonly resolve: QuasarAppPathsResolve;
  readonly appDir: string;

  /**
   * Does the host app have TypeScript support?
   */
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

export type PromptsScriptAnswers<Key extends string = string> = Record<
  Key,
  any
>;

export interface IndexAPI extends BaseAPI, SharedIndexInstallAPI {
  /**
   * Answers received from the Prompts Script (if any).
   * @type prompts {@link PromptsScriptAnswers}
   */
  readonly prompts: PromptsScriptAnswers;

  /**
   * Extend the Quasar configuration object that is used by the CLI.
   *
   * @param cfg {@link QuasarConf}
   * @param api {@link IndexAPI}
   */
  readonly extendQuasarConf: Callback<
    (
      cfg: QuasarConf,
      api: IndexAPI
    ) => QuasarConf | void | Promise<QuasarConf | void>
  >;

  /**
   * Similar in use to /quasar.config > build > extendViteConf
   * @type extendViteConf {@link ExtendViteConfHandler}
   */
  readonly extendViteConf: ExtendViteConfHandler;

  /**
   * Extend the Rolldown config that is used for the bex scripts
   * (background, content scripts, dom script).
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * Similar in use to /quasar.config > bex > extendBexScriptsConf
   *
   * @param cfg {@link RolldownOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > bex > extendBexManifestJson
   *
   * @param json The content of /src-bex/manifest.json as a JavaScript object
   * @param api {@link IndexAPI}
   */
  readonly extendBexManifestJson: (
    json: Record<string, any>,
    api: IndexAPI
  ) => void | Record<string, any> | Promise<void | Record<string, any>>;

  /**
   * Extend the Rolldown config that is used for the electron-main thread.
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * Similar in use to /quasar.config > electron > extendElectronMainConf
   *
   * @param cfg {@link RolldownOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > electron > extendElectronPreloadConf
   *
   * @param cfg {@link RolldownOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > electron > extendElectronPackageJson
   *
   * @param pkgJson The content of the generated package.json for Electron production build
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > pwa > extendPWAManifestJson
   *
   * @param json {@link PwaManifestOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > pwa > extendPWACustomSWConf
   *
   * @param cfg {@link RolldownOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > pwa > extendPWAGenerateSWOptions
   *
   * @param config {@link GenerateSWOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > pwa > extendPWAInjectManifestOptions
   *
   * @param config {@link InjectManifestOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > ssr > extendSSRWebserverConf
   *
   * @param cfg {@link RolldownOptions}
   * @param api {@link IndexAPI}
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
   *
   * Similar in use to /quasar.config > ssr > extendSSRPackageJson
   *
   * @param pkgJson The content of the generated package.json for SSR production build
   * @param api {@link IndexAPI}
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
   *
   * https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * Similar in use to /quasar.config > ssr > extendSSRGenerateSWOptions
   *
   * @param config {@link GenerateSWOptions}
   * @param api {@link IndexAPI}
   */
  readonly extendSSRGenerateSWOptions: (
    config: GenerateSWOptions,
    api: IndexAPI
  ) => void | GenerateSWOptions | Promise<void | GenerateSWOptions>;

  /**
   * Extend/configure the Workbox InjectManifest options
   * Specify Workbox options which will be applied on top of
   *  `pwa > extendPWAInjectManifestOptions()`.
   *
   * https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
   *
   * Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * Similar in use to /quasar.config > ssr > extendSSRInjectManifestOptions
   *
   * @param config {@link InjectManifestOptions}
   * @param api {@link IndexAPI}
   */
  readonly extendSSRInjectManifestOptions: (
    config: InjectManifestOptions,
    api: IndexAPI
  ) => void | InjectManifestOptions | Promise<void | InjectManifestOptions>;

  /**
   * Register a custom CLI command
   *
   * @param commandName The name of the command
   * @param fn The function to execute when the command is called
   */
  readonly registerCommand: (
    commandName: string,
    fn: (processArgv: string[]) => Promise<void> | void
  ) => void;

  /**
   * Register a component/directive/plugin Json API.
   *
   * @param name The name of the component/directive/plugin
   * @param relativePath The relative path to the API file
   */
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

export type IndexAPICallback = (api: IndexAPI) => void | Promise<void>;

type ExitLogHandler = (msg: string) => void;
export interface InstallAPI extends BaseAPI, SharedIndexInstallAPI {
  /**
   * Answers received from the Prompts Script (if any).
   * @type prompts {@link PromptsScriptAnswers}
   */
  readonly prompts: PromptsScriptAnswers;

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

export type InstallAPICallback = (api: InstallAPI) => void | Promise<void>;

export interface UninstallAPI extends BaseAPI {
  /**
   * Answers received from the Prompts Script (if any).
   * @type prompts {@link PromptsScriptAnswers}
   */
  readonly prompts: PromptsScriptAnswers;

  readonly getPersistentConf: GetPersistentConfHandler;
  readonly hasExtension: HasExtensionHandler;
  readonly removePath: (__path: string) => void;
  readonly onExitLog: ExitLogHandler;
}

export type UninstallAPICallback = (api: UninstallAPI) => void | Promise<void>;

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

export type PromptsAPICallback = (
  api: PromptsAPI
) =>
  | PromptsScriptAnswers
  | Promise<PromptsScriptAnswers>
  | void
  | Promise<void>;
