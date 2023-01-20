import config from './template.config.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import chalk from 'chalk';

const cmd = util.promisify(exec);

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
};

/** Ask the user for the template project name */
export async function askForProjectName() {
  type answersT = { name: string };

  const { name } = await inquirer.prompt<answersT>([
    {
      type: 'input',
      name: 'name',
      default: 'myproject',
      message: 'Please enter the new porject name : ',
    },
  ]);

  if (existsSync(name)) {
    console.log(chalk.red(`\n⛔ "${name}" directory already exists !!\n`));
    process.exit(1);
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
  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'scripts');
  const toPath = path.join(templateName, 'scripts');

  if (!existsSync(toPath)) await fs.mkdir(toPath);
  const scripts = await fs.readdir(fromPath);
  for (const file of scripts) await fs.copyFile(path.join(fromPath, file), path.join(toPath, file));
}

/** - Add `App.tsx` file to the new template folder */
export async function addAppjs(templateName: string) {
  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'App.js');
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

  await fs.writeFile(packageJsonPath, JSON.stringify(json, null, 2), { encoding: 'utf-8' });
}

/** - Add `babel.config.js` to template */
export async function addBabelConfig(templateName: string) {
  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'babel.config.js');
  const toPath = path.join(templateName, 'babel.config.js');

  const file = await fs.readFile(fromPath, { encoding: 'utf-8' });
  const match = file.match(/plugins:\s?(\[.*\])/)?.[1];

  if (!match) return console.log("\n⛔ Error while editing 'babel.config.js'");

  const str: string[] = JSON.parse(match.replaceAll("'", '"'));
  str.push(...config.babelPlugins);

  await fs.writeFile(toPath, file.replace(match, JSON.stringify(str, null, 2)), { encoding: 'utf-8' });
}

/** - Edit `index.js` file */
export async function editIndexJs(templateName: string) {
  const indexPath = path.join(templateName, 'index.js');
  const indexStr = await fs.readFile(indexPath, { encoding: 'utf-8' });
  const newStr = indexStr
    .replace("import {name as appName} from './app.json';", '')
    .replace('appName', `'${templateName}'`)
    .replace('./App', './src/App')
    .replace(/\/\*\*[\s\S]*?\*\/\n/g, '') // remove comment blocks
    .replace(/\n{3,}|(\s*\n){3,}/g, '\n\n'); // remove extra spaces
  await fs.writeFile(indexPath, newStr, { encoding: 'utf-8' });
}

/** - Edit `tsconfig.json` file */
export async function edit_tsconfigJson(templateName: string) {
  const tsPath = path.join(templateName, 'tsconfig.json');
  const newStr = `{
  "extends": "@tsconfig/react-native/tsconfig.json",
  "compilerOptions": {
    "types": ["react-native"]
  }
}`;
  await fs.writeFile(tsPath, newStr, { encoding: 'utf-8' });
}

/** - Copy file from template folder for web platform */
export async function webScript(templateName: string) {
  config.babelPlugins.unshift(
    ...[
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-modules-commonjs',
    ]
  );

  // modify index.js
  const indexPath = path.join(templateName, 'index.js');
  const file = await fs.readFile(indexPath, { encoding: 'utf-8' });
  const str =
    file.replace('AppRegistry', ' AppRegistry, Platform ') +
    `
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication('${templateName}', { rootTag });
}
`;
  await fs.writeFile(indexPath, str, { encoding: 'utf-8' });
}

/** - Android enable separate build in garadle.build */
export async function enableSeparateBuild(templateName: string) {
  const pathToGardle = path.join(templateName, 'android', 'app', 'build.gradle');
  const fileStr = await fs.readFile(pathToGardle, { encoding: 'utf-8' });
  const newStr = fileStr
    .replace('def enableSeparateBuildPerCPUArchitecture = false', 'def enableSeparateBuildPerCPUArchitecture = true')
    .replace(/\/\*\*[\s\S]*?\*\/\n/g, '') // remove comment blocks
    .replace(/\/\/.*/g, '') // remove inline comments
    .replace(/\n{3,}|(\s*\n){3,}/g, '\n'); // remove extra spaces
  await fs.writeFile(pathToGardle, newStr, { encoding: 'utf-8' });
}

/** - Run windows platform script */
export async function installWindows(templateName: string) {
  await cmd('npx -y react-native-windows-init --overwrite', { cwd: templateName });
}

/** - Install npm dependencies */
export async function installDependencies(templateName: string) {
  await cmd('npm i --force', { cwd: templateName });
}

/** - Open `VSCode` */
export async function runVSCode(templateName: string) {
  await cmd('code .', { cwd: templateName });
}
