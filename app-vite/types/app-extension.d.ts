import { IResolve } from "./app-paths";
import { QuasarConf, ResolvedQuasarConfValue } from "./configuration/conf";
import { QuasarContext } from "./configuration/context";
import { RolldownOptions } from "rolldown";

type ExtendViteConfHandler = (
  fn: (
    ...args: [
      ...Parameters<ResolvedQuasarConfValue<"build.extendViteConf">>,
      api: IndexAPI
    ]
  ) => void
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

  readonly extendQuasarConf: Callback<(cfg: QuasarConf, api: IndexAPI) => void>;

  readonly extendViteConf: ExtendViteConfHandler;

  readonly extendBexScriptsConf: Callback<
    (cfg: RolldownOptions, api: IndexAPI) => void
  >;
  readonly extendElectronMainConf: Callback<
    (cfg: RolldownOptions, api: IndexAPI) => void
  >;
  readonly extendElectronPreloadConf: Callback<
    (cfg: RolldownOptions, api: IndexAPI) => void
  >;
  readonly extendPWACustomSWConf: Callback<
    (cfg: RolldownOptions, api: IndexAPI) => void
  >;
  readonly extendSSRWebserverConf: Callback<
    (cfg: RolldownOptions, api: IndexAPI) => void
  >;

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
