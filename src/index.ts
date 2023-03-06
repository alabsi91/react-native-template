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
  askForPlatforms,
  askForProjectName,
  copyScripts,
  addBabelConfig,
  editIndexJs,
  editPackageJson,
  enableSeparateBuild,
  installDependencies,
  OS,
  runVSCode,
  webScript,
  askForPreInstalledLibs,
  addAppTsx,
  installWindows,
  edit_tsconfigJson,
  removeJest,
  askForKeepingJest,
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
    platforms: await askForPlatforms(),
    preLibs: await askForPreInstalledLibs(),
    keepJest: await askForKeepingJest(),
    installDependencies: await askForInstallingDeps(),
  };

  const configuration = inputs.keepJest ? config : removeJest(config);

  // add deps for react-navigation if included
  if (inputs.preLibs.includes('react-navigation')) {
    inputs.preLibs.splice(inputs.preLibs.indexOf('react-navigation'), 1, '@react-navigation/native');
    inputs.preLibs.push('@react-navigation/native-stack');
    inputs.preLibs.push('react-native-screens');
    inputs.preLibs.push('react-native-safe-area-context');
  }

  if (inputs.preLibs.includes('react-native-reanimated')) configuration.babelPlugins.push('react-native-reanimated/plugin');

  // * add choosen libs to template_configs
  const libs = inputs.preLibs.map(lib => [lib, 'latest']);
  configuration.dep_to_add.push(...libs);

  const loading = progress('Downloading ...');
  try {
    await cmd(`npx -y react-native init "${inputs.name}" --skip-install ${process.argv.slice(2).join(' ')}`);
  } catch (error) {
    loading.error('Error while downloaing the template !!');
    process.exit(1);
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
    await editPackageJson(inputs.name, inputs.platforms);
  } catch (error) {
    loading.error('Error while editing "package.json" !!');
  }

  // * delete files
  let to_delete = configuration.delete;
  if (!inputs.platforms.includes(OS.Android)) to_delete = to_delete.concat(configuration.delete_android);
  if (!inputs.platforms.includes(OS.IOS)) to_delete = to_delete.concat(configuration.delete_ios);
  try {
    for (const file of to_delete) {
      const filePath = path.join(inputs.name, file);
      const isFile = existsSync(filePath);
      if (isFile) await fs.rm(filePath, { recursive: true });
    }
  } catch (error) {
    loading.error('Error while deleting files !!');
  }

  // * add "App.tsx"
  try {
    await addAppTsx(inputs.name);
  } catch (error) {
    loading.error('Error while adding "App.tsx" file !!');
  }

  // * edit "index.js"
  try {
    await editIndexJs(inputs.name);
  } catch (error) {
    loading.error('Error while editing "index.js" !!');
  }

  // * edit "tsconfig.json"
  try {
    await edit_tsconfigJson(JSON.stringify(configuration.tsconfig, null, 2), inputs.name);
  } catch (error) {
    loading.error('Error while editing "tsconfig.json" !!');
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

  // * run windows script
  if (inputs.platforms.includes(OS.Windows)) {
    loading.start('Applying settings for Windows platform ...');

    try {
      await installWindows(inputs.name);
    } catch (error) {
      loading.error('Error while applying settings for Windows platform !!');
    }
  }

  // * create empty folders and files
  try {
    await fs.mkdir(path.join(inputs.name, 'src', 'components'));
    await fs.mkdir(path.join(inputs.name, 'src', 'screens'));
    await fs.mkdir(path.join(inputs.name, 'src', 'helpers'));
    await fs.mkdir(path.join(inputs.name, 'src', 'data'));
    await fs.appendFile(path.join(inputs.name, 'src', 'types.ts'), '');
  } catch (error) {
    loading.error('Error while creating empty folders and files for the template !!');
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
