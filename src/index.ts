#!/usr/bin/env node

import { existsSync } from "fs";
import fs from "fs/promises";
import gradient from "gradient-string";
import path from "path";
import { safeParse } from "zod-args-parser";

import { spinner } from "@cli/spinner.js";
import { $, CONSTANTS } from "@cli/terminal.js";
import { cliSchema } from "@commands/cli.js";
import {
  askForInstallingDeps,
  askForKeepingJest,
  askForPlatforms,
  askForPreInstalledLibs,
  askForProjectName,
} from "@utils/utils.js";
import { addGlobalTypes, configureMetroForSVG } from "./All/rnSvgSetup.js";
import { enableSeparateBuild } from "./Android/enableSeparateBuild.js";
import { fixMainActivity, fixPageTransition } from "./Android/rnScreensFix.js";
import { webScript } from "./Web/addWebSupport.js";
import { installWindows } from "./Windows/addWindowsSupport.js";
import {
  addAppTsx,
  addBabelConfig,
  copyPatches,
  copyReactNavigationTemplate,
  copyScripts,
  editIndexJs,
  editPackageJson,
  edit_tsconfigJson,
  installDeps,
  removeJest,
  runVSCode,
} from "./methods.js";
import config from "./template.config.js";
import { OS } from "./types.js";

// ? 👇 title text gradient colors. for more colors see: `https://cssgradient.io/gradient-backgrounds`
const coolGradient = gradient([
  { color: "#FA8BFF", pos: 0 },
  { color: "#2BD2FF", pos: 0.5 },
  { color: "#2BFF88", pos: 1 },
]);

// ? `https://www.kammerl.de/ascii/AsciiSignature.php`     👈 to convert your app's title to ASCII art.
// ? `https://codebeautify.org/javascript-escape-unescape` 👈 escape your title's string for JavaScript.
console.log(
  coolGradient(
    "\n.______       _______     ___       ______ .___________.   .__   __.      ___   .___________. __  ____    ____  _______ \n|   _  \\     |   ____|   /   \\     /      ||           |   |  \\ |  |     /   \\  |           ||  | \\   \\  /   / |   ____|\n|  |_)  |    |  |__     /  ^  \\   |  ,----'`---|  |----`   |   \\|  |    /  ^  \\ `---|  |----`|  |  \\   \\/   /  |  |__   \n|      /     |   __|   /  /_\\  \\  |  |         |  |        |  . `  |   /  /_\\  \\    |  |     |  |   \\      /   |   __|  \n|  |\\  \\----.|  |____ /  _____  \\ |  `----.    |  |        |  |\\   |  /  _____  \\   |  |     |  |    \\    /    |  |____ \n| _| `._____||_______/__/     \\__\\ \\______|    |__|        |__| \\__| /__/     \\__\\  |__|     |__|     \\__/     |_______|\n                                                                                                                        \n",
  ),
);

// ⚠️ For testing in development mode only
const testArgs: string[] = [];

const args = CONSTANTS.isDev ? testArgs : process.argv.slice(2);

async function main() {
  // Add all commands schemas here 👇
  const results = safeParse(args, cliSchema);

  // ! Error
  if (!results.success) {
    console.error(results.error.message);
    process.exit(1);
  }

  const { name, platform, libs, jest, install, help } = results.data;

  if (help) {
    results.printCliHelp();
    process.exit(0);
  }

  // * get user inputs
  const inputs = {
    name: name ?? (await askForProjectName()),
    platforms: platform ?? (await askForPlatforms()),
    preLibs: libs ?? (await askForPreInstalledLibs()),
    keepJest: jest ?? (await askForKeepingJest()),
    installDependencies: install ?? (await askForInstallingDeps()),
  };

  const isAndroid = inputs.platforms.includes(OS.Android);
  const isIOS = inputs.platforms.includes(OS.IOS);
  const isWeb = inputs.platforms.includes(OS.Web);
  const isWindows = inputs.platforms.includes(OS.Windows);

  const isReactNavigationSelected = inputs.preLibs.includes("react-navigation");

  const configuration = inputs.keepJest ? config : removeJest();

  // add deps for react-navigation if included
  if (isReactNavigationSelected) {
    inputs.preLibs.splice(inputs.preLibs.indexOf("react-navigation"), 1, "@react-navigation/native");
    inputs.preLibs.push("@react-navigation/native-stack");
    inputs.preLibs.push("react-native-screens");
    inputs.preLibs.push("react-native-safe-area-context");
  }

  // add react-native-reanimated and react-native-gesture-handler if reanimated-color-picker selected
  if (inputs.preLibs.includes("reanimated-color-picker")) {
    inputs.preLibs.push("react-native-reanimated");
    inputs.preLibs.push("react-native-gesture-handler");
  }

  // add babel plugin for react native reanimated if selected
  if (inputs.preLibs.includes("react-native-reanimated")) {
    configuration.babelPlugins.push("react-native-reanimated/plugin");
  }

  // add babel dev dep for react-native-svg
  if (inputs.preLibs.includes("react-native-svg")) {
    configuration.dev_deps_to_add.push(["react-native-svg-transformer", "latest"]);
  }

  // * add chosen libs to template_configs
  const libraries = [...new Set(inputs.preLibs)].map(lib => [lib, "latest"]);
  configuration.dep_to_add.push(...libraries);

  // * download template
  const loading = spinner("Downloading ...");
  try {
    await $`npx -y @react-native-community/cli@latest init "${inputs.name}" --skip-install`;
  } catch (_error) {
    loading.error("Error while downloading the template !!");
    process.exit(1);
  }

  loading.start("Applying settings ...");

  // * copy scripts folder
  if (isAndroid) {
    try {
      await copyScripts(inputs.name);
    } catch (_error) {
      loading.error("Error while Copying Scripts !!");
    }
  }

  // * copy patches folder
  if (isAndroid) {
    try {
      await copyPatches(inputs.name);
    } catch (_error) {
      loading.error("Error while Copying Scripts !!");
    }
  }

  // * enabling Separate Builds for Android
  if (isAndroid) {
    try {
      await enableSeparateBuild(inputs.name);
    } catch (_error) {
      loading.error("Error enabling Separate Builds for Android !!");
    }
  }

  // * fix for react-native-screens on Android
  if (inputs.preLibs.includes("react-native-screens") && isAndroid) {
    try {
      await fixMainActivity(inputs.name);
      await fixPageTransition(inputs.name);
    } catch (_error) {
      loading.error("Error while applying a fix for react-native-screens on Android !!");
    }
  }

  // * edit "package.json'
  try {
    await editPackageJson(inputs.name, inputs.platforms);
  } catch (_error) {
    loading.error('Error while editing "package.json" !!');
  }

  // * delete files
  let to_delete = configuration.delete;
  if (!isAndroid) to_delete = to_delete.concat(configuration.delete_android);
  if (!isIOS) to_delete = to_delete.concat(configuration.delete_ios);
  try {
    for (const file of to_delete) {
      const filePath = path.join(inputs.name, file);
      const isFile = existsSync(filePath);
      if (isFile) await fs.rm(filePath, { recursive: true });
    }
  } catch (_error) {
    loading.error("Error while deleting files !!");
  }

  // * add "App.tsx"
  try {
    await addAppTsx(inputs.name);
  } catch (_error) {
    loading.error('Error while adding "App.tsx" file !!');
  }

  // * edit "index.js"
  try {
    await editIndexJs(inputs.name);
  } catch (_error) {
    loading.error('Error while editing "index.js" !!');
  }

  // * edit "tsconfig.json"
  try {
    await edit_tsconfigJson(inputs.name);
  } catch (_error) {
    loading.error('Error while editing "tsconfig.json" !!');
  }

  // * applying web script
  if (isWeb) {
    try {
      await webScript(inputs.name);
    } catch (_error) {
      loading.error("Error while applying the web platform script !!");
    }
  }

  // * add "babel.config.js"
  try {
    await addBabelConfig(inputs.name);
  } catch (_error) {
    loading.error('Error while adding "babel.config.js" !!');
  }

  // * install npm dependencies
  if (inputs.installDependencies) {
    loading.start("Installing dependencies ...");

    try {
      await installDeps(inputs.name);
    } catch (_error) {
      loading.error("Error while installing dependencies !!");
    }
  }

  // * run windows script
  if (isWindows) {
    loading.start("Applying settings for Windows platform ...");

    try {
      await installWindows(inputs.name);
    } catch (_error) {
      loading.error("Error while applying settings for Windows platform !!");
    }
  }

  // * create folders and files
  try {
    // create folders
    for (let i = 0; i < config.create_folders.length; i++) {
      const folderPath = path.join(inputs.name, config.create_folders[i]);
      await fs.mkdir(folderPath);
    }

    // create files
    for (let i = 0; i < config.create_files.length; i++) {
      const { path: name, content } = config.create_files[i];
      await fs.appendFile(path.join(inputs.name, name), content, { encoding: "utf-8" });
    }
  } catch (_error) {
    loading.error("Error while creating empty folders and files for the template !!");
  }

  // * for processing .svg files
  if (inputs.preLibs.includes("react-native-svg")) {
    try {
      await configureMetroForSVG(inputs.name);
      await addGlobalTypes(inputs.name);
    } catch (_error) {
      loading.error('Error while editing "metro.config.js" !!');
    }
  }

  // * copy react navigation template
  if (isReactNavigationSelected) {
    try {
      copyReactNavigationTemplate(inputs.name);
    } catch (_error) {
      loading.error("Error while copying react navigation template !!");
    }
  }

  // * run VSCode
  try {
    await runVSCode(inputs.name);
  } catch (_error) {
    // ignore
  }

  loading.success("Done!!");
}

main(); // 🚀 Start the app.
