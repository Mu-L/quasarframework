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
  // To alter the behavior to run correctly within this script
  process.env.CREATE_TEST_PROJECT_OVERRIDE = "true";

  const scope = {
    nogit: false,
    projectType: "app",
    projectFolder: "test-project",
    overwrite: true,
    packageManager,

    scriptType,
    engine: appEngine,

    name: "test-project",
    productName: "Test Project",
    author: "Quasar Team (info@quasar.dev)"
  };

  if (appEngine === "vite-3") {
    Object.assign(scope, {
      preset: ["sass", "linting"],
      linter: "oxlint"
    });
  } else if (appEngine === "vite-2") {
    Object.assign(scope, {
      preset: ["sass", "eslint"],
      prettier: true
    });
  }

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
