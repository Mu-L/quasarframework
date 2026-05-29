import { join } from "node:path";

type ScriptType = "js" | "ts";
type AppEngine = "vite-2" | "vite-3";
type PackageManager = "yarn" | "npm" | "pnpm";

type CreateProjectOptions = {
  scriptType: ScriptType;
  appEngine: AppEngine;
  packageManager: PackageManager;
};

export async function createProject({
  scriptType,
  appEngine,
  packageManager
}: CreateProjectOptions) {
  // To bypass Corepack enforcing what's specified in the closest package.json file that has the 'packageManager' field
  process.env.COREPACK_ENABLE_STRICT = "0";
  // See https://github.com/yarnpkg/yarn/issues/9015
  process.env.SKIP_YARN_COREPACK_CHECK = "1";

  const scope = {
    nogit: false,
    projectType: "app",
    projectFolder: join(process.cwd(), "test-project"),
    projectFolderName: "test-project",
    overwrite: true,
    packageManager,

    preset:
      scriptType === "ts"
        ? ["typescript", "sass", "linting"]
        : ["sass", "linting"],
    linter: appEngine === "vite-3" ? "oxlint" : "eslint",
    engine: appEngine,

    name: "test-project",
    productName: "Test Project",
    author: "Quasar Team (info@quasar.dev)"
  };

  const { createProjectFolder } = await import("../create-project-folder.js");
  await createProjectFolder(scope);
}

const args = process.argv.slice(2) as [ScriptType, AppEngine, PackageManager];

// oxlint-disable-next-line unicorn/prefer-top-level-await
void createProject({
  scriptType: args[0],
  appEngine: args[1],
  packageManager: args[2]
}).catch(err => {
  console.error(err);
  process.exit(1);
});
