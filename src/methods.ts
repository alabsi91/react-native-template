import chalk from 'chalk';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import path from 'path';
import prettier from 'prettier';
import util from 'util';
import config from './template.config.js';
import { copyRecursive, validateProjectName } from './utils.js';

export const cmd = util.promisify(exec);

export enum OS {
  Android = 'Android',
  IOS = 'IOS',
  Web = 'Web',
  Windows = 'Windows',
}

type packageJsonType = {
  name: string;
  jest?: object;
  scripts: { [key: string]: string };
  dependencies: { [key: string]: string };
  devDependencies: { [key: string]: string };
  eslintConfig: typeof config.eslint;
  prettier: typeof config.prettier;
};

/** Ask the user for the template project name */
export async function askForProjectName(): Promise<string> {
  type answersT = { name: string };

  const { name } = await inquirer.prompt<answersT>([
    {
      type: 'input',
      name: 'name',
      default: 'myproject',
      message: 'Please enter the new project name : ',
    },
  ]);

  try {
    validateProjectName(name);
  } catch (error) {
    console.log('\n⛔', chalk.red.bold(error), '\n');
    return askForProjectName();
  }

  if (existsSync(name)) {
    console.log(chalk.red.bold(`\n⛔ "${name}" directory already exists !!\n`));
    return askForProjectName();
  }

  return name;
}

/** - Ask the user which platforms to include */
export async function askForPlatforms() {
  type answersT = { platforms: [OS.Android, OS.IOS, OS.Web, OS.Windows] };

  const { platforms } = await inquirer.prompt<answersT>([
    {
      type: 'checkbox',
      name: 'platforms',
      default: [true, false],
      choices: [
        { checked: true, name: OS.Android },
        { checked: false, name: OS.IOS },
        { checked: false, name: OS.Web },
        { checked: false, name: OS.Windows },
      ],
      message: 'Please choose the template platforms : ',
    },
  ]);

  return platforms;
}

/** - Ask the user if to install dependencies */
export async function askForInstallingDeps() {
  type answersT = { installDeps: boolean };

  const { installDeps } = await inquirer.prompt<answersT>([
    {
      type: 'confirm',
      name: 'installDeps',
      default: true,
      message: 'Do you want to install the dependencies : ',
    },
  ]);

  return installDeps;
}

/** - Ask the user if to keep jest */
export async function askForKeepingJest() {
  type answersT = { keepJest: boolean };

  const { keepJest } = await inquirer.prompt<answersT>([
    {
      type: 'confirm',
      name: 'keepJest',
      default: false,
      message: 'Do you want to keep jest : ',
    },
  ]);

  return keepJest;
}

/** - Ask the user for pre-installed libraries */
export async function askForPreInstalledLibs() {
  type answersT = { libs: string[] };

  const { libs } = await inquirer.prompt<answersT>([
    {
      type: 'checkbox',
      name: 'libs',
      pageSize: config.preLibs.length,
      choices: config.preLibs.map(l => ({ name: l })),
      message: 'Choose what library to pre-install : ',
    },
  ]);

  return libs;
}

/** - Copy the scripts folder to the new template folder */
export async function copyScripts(templateName: string) {
  const fromPath = path.join(process.cwd(), 'template', 'scripts');
  const toPath = path.join(templateName, 'scripts');

  if (!existsSync(toPath)) await fs.mkdir(toPath);
  const scripts = await fs.readdir(fromPath);
  for (const file of scripts) await fs.copyFile(path.join(fromPath, file), path.join(toPath, file));
}

/** - Copy react navigation template */
export async function copyReactNavigationTemplate(templateName: string) {
  const source = path.join(process.cwd(), 'template', 'reactNavigationTemplate');
  const target = path.join(templateName, 'src');
  copyRecursive(source, target);
}

/** - Add `App.tsx` file to the new template folder */
export async function addAppTsx(templateName: string) {
  const fromPath = path.join(process.cwd(), 'template', 'App.tsx');
  const toPath = path.join(templateName, 'src', 'App.tsx');
  const srcPath = path.join(templateName, 'src');
  if (!existsSync(srcPath)) await fs.mkdir(srcPath);
  await fs.copyFile(fromPath, toPath);
}

/** - Get the latest version string for a package from `npm` */
export async function getPkgVersion(pkg: string) {
  type responseT = { name: string; version: string };
  const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
  const json = (await res.json()) as responseT;
  return `^${json.version.trim()}`;
}

/** - Edit `package.json` file */
export async function editPackageJson(templateName: string, platforms: OS[]) {
  const packageJsonPath = path.join(templateName, 'package.json');
  const packageJson = await fs.readFile(packageJsonPath, { encoding: 'utf-8' });
  const json = JSON.parse(packageJson) as packageJsonType;

  json.name = json.name.toLowerCase();

  // * remove jest
  delete json.jest;

  // * remove scripts
  json.scripts = {};

  // * add scripts
  if (platforms.includes(OS.Android) || platforms.includes(OS.IOS))
    for (const script of config.scripts) json.scripts[script[0]] = script[1];
  if (platforms.includes(OS.Android)) for (const script of config.scripts_android) json.scripts[script[0]] = script[1];
  if (platforms.includes(OS.IOS)) for (const script of config.scripts_ios) json.scripts[script[0]] = script[1];
  if (platforms.includes(OS.Web)) for (const script of config.scripts_web) json.scripts[script[0]] = script[1];

  // * add eslint config
  json.eslintConfig = config.eslint;

  // * add prettier config
  json.prettier = config.prettier;

  // * remove deps
  for (const d of config.deps_to_remove) {
    delete json.dependencies?.[d];
    delete json.devDependencies?.[d];
  }

  // * add production deps
  for (const dep of config.dep_to_add) {
    const pkg = dep[0],
      ver = dep[1];
    json.dependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
  }

  // * add dev deps
  for (const dep of config.dev_deps_to_add) {
    const pkg = dep[0],
      ver = dep[1];
    json.devDependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
  }

  // * add web deps
  if (platforms.includes(OS.Web)) {
    // production deps
    for (const dep of config.web_deps) {
      const pkg = dep[0],
        ver = dep[1];
      json.dependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
    }
    // deb deps
    for (const dep of config.web_dev_deps) {
      const pkg = dep[0],
        ver = dep[1];
      json.devDependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
    }
  }
  const formattedString = prettier.format(JSON.stringify(json), { ...config.prettier, parser: 'json' });

  await fs.writeFile(packageJsonPath, formattedString, { encoding: 'utf-8' });
}

/** - Add `babel.config.js` to template */
export async function addBabelConfig(templateName: string) {
  type RegExpMatchArrayWithIndices = RegExpMatchArray & { indices: Array<[number, number]> };

  const fromPath = path.join(process.cwd(), 'template', 'babel.config.js');
  const toPath = path.join(templateName, 'babel.config.js');

  const regex = {
    presets: /presets\s*=\s*\[(?<presets>(?:\[[^\]]*\]|[^[\]]*)*)\]/d,
    plugins: /plugins\s*=\s*\[(?<plugins>(?:\[[^\]]*\]|[^[\]]*)*)\]/d,
  };

  let file = await fs.readFile(fromPath, { encoding: 'utf-8' });

  // match array contents without the brackets
  const presetsMatch = regex.presets.exec(file) as RegExpMatchArrayWithIndices;
  const pluginsMatch = regex.plugins.exec(file) as RegExpMatchArrayWithIndices;

  if (typeof pluginsMatch?.groups?.plugins === 'string') {
    const insertAt = pluginsMatch.indices[1][1];
    file = file.slice(0, insertAt) + config.babelPlugins.map(e => `'${e}'`).join(',') + file.slice(insertAt);
  }

  if (typeof presetsMatch?.groups?.presets === 'string') {
    const insertAt = presetsMatch.indices[1][1];
    file = file.slice(0, insertAt) + config.babelPresets.map(e => `'${e}'`).join(',') + file.slice(insertAt);
  }

  const formattedString = prettier.format(file, { ...config.prettier, parser: 'babel' });

  await fs.writeFile(toPath, formattedString, { encoding: 'utf-8' });
}

/** - Edit `index.js` file */
export async function editIndexJs(templateName: string) {
  const indexPath = path.join(templateName, 'index.js');
  const indexStr = await fs.readFile(indexPath, { encoding: 'utf-8' });
  const newStr = indexStr
    .replace("import {name as appName} from './app.json';", '')
    .replace('appName', `'${templateName}'`)
    .replace('./App', './src/App')
    .replace(/\/\*\*[\s\S]*?\*\/\n/g, ''); // remove comment blocks

  const formattedString = prettier.format(newStr, { ...config.prettier, parser: 'babel' });

  await fs.writeFile(indexPath, formattedString, { encoding: 'utf-8' });
}

/** - Edit `tsconfig.json` file */
export async function edit_tsconfigJson(templateName: string) {
  const tsPath = path.join(templateName, 'tsconfig.json');
  const formattedString = prettier.format(JSON.stringify(config.tsconfig), { ...config.prettier, parser: 'json' });
  await fs.writeFile(tsPath, formattedString, { encoding: 'utf-8' });
}

/** - Install npm dependencies */
export async function installDependencies(templateName: string) {
  await cmd('npm i --force', { cwd: templateName });
}

/** - Open `VSCode` */
export async function runVSCode(templateName: string) {
  await cmd('code .', { cwd: templateName });
}

/** - Change config file to remove jest */
export function removeJest() {
  config.delete.push('__tests__');
  config.delete.push('jest.config.js');

  config.deps_to_remove.push('jest');
  config.deps_to_remove.push('babel-jest');
  config.deps_to_remove.push('react-test-renderer');
  config.deps_to_remove.push('@types/jest');
  config.deps_to_remove.push('@types/react-test-renderer');

  const typeIndex = config.tsconfig.compilerOptions.types.indexOf('jest');
  config.tsconfig.compilerOptions.types.splice(typeIndex, 1);

  const scriptIndex = config.scripts.findIndex(e => e[1] === 'jest');
  config.scripts.splice(scriptIndex, 1);

  return config;
}
