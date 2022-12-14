#!/usr/bin/env node

import { exec } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import gradient from 'gradient-string';
import path from 'path';
import util from 'util';
import { progress } from './helpers.js';
import {
  askForInstallingDeps,
  askForLang,
  askForPlatforms,
  askForProjectName,
  copyScripts,
  addTsConfig,
  addBabelConfig,
  editIndexJs,
  editPackageJson,
  enableSeparateBuild,
  installDependencies,
  language,
  OS,
  runVSCode,
  webScript,
  askForPreInstalledLibs,
  addAppjs,
} from './methods.js';
import config from './template.config.js';

const cmd = util.promisify(exec);

const coolGradient = gradient([
  { color: '#FA8BFF', pos: 0 },
  { color: '#2BD2FF', pos: 0.5 },
  { color: '#2BFF88', pos: 1 },
]);

console.log(
  coolGradient(
    "\n.______       _______     ___       ______ .___________.   .__   __.      ___   .___________. __  ____    ____  _______ \n|   _  \\     |   ____|   /   \\     /      ||           |   |  \\ |  |     /   \\  |           ||  | \\   \\  /   / |   ____|\n|  |_)  |    |  |__     /  ^  \\   |  ,----'`---|  |----`   |   \\|  |    /  ^  \\ `---|  |----`|  |  \\   \\/   /  |  |__   \n|      /     |   __|   /  /_\\  \\  |  |         |  |        |  . `  |   /  /_\\  \\    |  |     |  |   \\      /   |   __|  \n|  |\\  \\----.|  |____ /  _____  \\ |  `----.    |  |        |  |\\   |  /  _____  \\   |  |     |  |    \\    /    |  |____ \n| _| `._____||_______/__/     \\__\\ \\______|    |__|        |__| \\__| /__/     \\__\\  |__|     |__|     \\__/     |_______|\n                                                                                                                        \n"
  )
);

async function app() {
  // * get user inputs
  const inputs = {
    name: await askForProjectName(),
    lang: await askForLang(),
    platforms: await askForPlatforms(),
    preLibs: await askForPreInstalledLibs(),
    installDependencies: await askForInstallingDeps(),
  };

  // add deps for react-navigation if included
  if (inputs.preLibs.includes('react-navigation')) {
    inputs.preLibs.splice(inputs.preLibs.indexOf('react-navigation'), 1, '@react-navigation/native');
    inputs.preLibs.push('react-native-screens');
    inputs.preLibs.push('react-native-safe-area-context');
  }

  if (inputs.preLibs.includes('react-native-reanimated')) config.babelPlugins.push('react-native-reanimated/plugin');

  // * add choosen libs to template_configs
  const libs = inputs.preLibs.map(lib => [lib, 'latest']);
  config.dep_to_add.push(...libs);

  const loading = progress('Downloading ...');
  try {
    await cmd(`npx react-native init "${inputs.name}" --skip-install ${process.argv.slice(2).join(' ')}`);
  } catch (error) {
    loading.error('Error while downloaing template !!');
  }

  loading.start('Applying settings ...');

  // * copy scripts folder
  if (inputs.platforms.includes(OS.Android)) {
    try {
      await copyScripts(inputs.name);
    } catch (error) {
      loading.error('Error while Copying Scripts !!');
    }
  }

  // * copy 'metro.config.js' file
  try {
    const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'metro.config.js');
    const toPath = path.join(inputs.name, 'metro.config.js');
    await fs.copyFile(fromPath, toPath);
  } catch (error) {
    loading.error('Error while Copying "metro.config.js" !!');
  }

  // * enabling Separate Builds for Android
  if (inputs.platforms.includes(OS.Android)) {
    try {
      await enableSeparateBuild(inputs.name);
    } catch (error) {
      loading.error('Error enabling Separate Builds for Android !!');
    }
  }

  // * edit "package.json'
  try {
    await editPackageJson(inputs.name, inputs.lang, inputs.platforms);
  } catch (error) {
    loading.error('Error while editing "package.json" !!');
  }

  // * delete files
  let to_delete = config.delete;
  if (!inputs.platforms.includes(OS.Android)) to_delete = to_delete.concat(config.delete_android);
  if (!inputs.platforms.includes(OS.IOS)) to_delete = to_delete.concat(config.delete_ios);
  try {
    for (const file of to_delete) {
      const filePath = path.join(inputs.name, file);
      const isFile = existsSync(filePath);
      if (isFile) await fs.rm(filePath, { recursive: true });
    }
  } catch (error) {
    loading.error('Error while deleting files !!');
  }

  // * add "App.js/tsx"
  try {
    await addAppjs(inputs.name, inputs.lang);
  } catch (error) {
    loading.error('Error while adding "App.js" file !!');
  }

  // * edit "index.js"
  try {
    await editIndexJs(inputs.name);
  } catch (error) {
    loading.error('Error while editing "index.js" !!');
  }

  // * add "tsconfig.json" file
  if (inputs.lang === language.TypeScript) {
    try {
      await addTsConfig(inputs.name);
    } catch (error) {
      loading.error('Error while adding "tsconfig.json" !!');
    }
  }

  // * applying web script
  if (inputs.platforms.includes(OS.Web)) {
    try {
      await webScript(inputs.name);
    } catch (error) {
      loading.error('Error while applying the web platform script !!');
    }
  }

  // * add "babel.config.js"
  try {
    await addBabelConfig(inputs.name);
  } catch (error) {
    loading.error('Error while adding "babel.config.js" !!');
  }

  // * install npm dependencies
  if (inputs.installDependencies) {
    loading.start('Installing dependencies ...');

    try {
      await installDependencies(inputs.name);
    } catch (error) {
      loading.error('Error while installing dependencies !!');
    }
  }

  // * run VSCode
  try {
    await runVSCode(inputs.name);
  } catch (error) {
    loading.error('Error while opening with VSCode !!');
  }

  loading.success('Done!!');
}

app();
