export interface IResolve {
  readonly cli: (dir: string) => string;
  readonly app: (dir: string) => string;
  readonly src: (dir: string) => string;
  readonly public: (dir: string) => string;
  readonly pwa: (dir: string) => string;
  readonly ssr: (dir: string) => string;
  readonly cordova: (dir: string) => string;
  readonly capacitor: (dir: string) => string;
  readonly electron: (dir: string) => string;
  readonly bex: (dir: string) => string;
}

export interface QuasarAppPaths {
  readonly cliDir: string;
  readonly appDir: string;
  readonly srcDir: string;
  readonly publicDir: string;
  readonly pwaDir: string;
  readonly ssrDir: string;
  readonly cordovaDir: string;
  readonly capacitorDir: string;
  readonly electronDir: string;
  readonly bexDir: string;

  readonly quasarConfigFilename: string;
  readonly quasarConfigInputFormat: "esm" | "ts";

  readonly resolve: IResolve;
}
