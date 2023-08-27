import chalk from 'chalk';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import path from 'path';
import prettier from 'prettier';
import util from 'util';
import { copyRecursive } from './helpers.js';
import config from './template.config.js';

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
  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'scripts');
  const toPath = path.join(templateName, 'scripts');

  if (!existsSync(toPath)) await fs.mkdir(toPath);
  const scripts = await fs.readdir(fromPath);
  for (const file of scripts) await fs.copyFile(path.join(fromPath, file), path.join(toPath, file));
}

/** - Copy react navigation template */
export async function copyReactNavigationTemplate(templateName: string) {
  const source = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'reactNavigationTemplate');
  const target = path.join(templateName, 'src');
  copyRecursive(source, target);
}

/** - Add `App.tsx` file to the new template folder */
export async function addAppTsx(templateName: string) {
  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'App.tsx');
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

/** - Edit `metro.config.js` file to process svg fils */
export async function configureMetroForSVG(templateName: string) {
  const metroConfigPath = path.join(templateName, 'metro.config.js');
  const str = await fs.readFile(metroConfigPath, { encoding: 'utf-8' });

  // Find the position after the last "require" statement
  const lastMatch = str.match(/require\(.+\).*/g)?.at(-1) ?? '';
  const insertPosition = str.indexOf(lastMatch) + lastMatch.length;

  // Insert the text at the calculated position
  let modifiedStr =
    str.slice(0, insertPosition) +
    `

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;` +
    str.slice(insertPosition);

  // add config
  modifiedStr = modifiedStr.replace(
    /([\s\S]+const\s+config\s*=\s*{)()([\s\S]+)/,
    `$1
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
$3`
  );

  await fs.writeFile(metroConfigPath, modifiedStr, { encoding: 'utf-8' });
}

/** - Add `babel.config.js` to template */
export async function addBabelConfig(templateName: string) {
  type RegExpMatchArrayWithIndices = RegExpMatchArray & { indices: Array<[number, number]> };

  const fromPath = path.join(path.dirname(process.argv[1]).replace('.dev-server', ''), 'template', 'babel.config.js');
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

  const formattedString = prettier.format(str, { ...config.prettier, parser: 'babel' });

  await fs.writeFile(indexPath, formattedString, { encoding: 'utf-8' });
}

/** - Android enable separate build in gradle.build */
export async function enableSeparateBuild(templateName: string) {
  const pathToGradle = path.join(templateName, 'android', 'app', 'build.gradle');
  const fileStr = await fs.readFile(pathToGradle, { encoding: 'utf-8' });
  const newStr = fileStr
    .replace(
      'android {',
      `android {
    splits {
        abi {
            reset()
            enable true
            universalApk true
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }`
    )
    .replace(/\s*\/\*[\s\S]*?\*\//gm, '') // remove comment blocks
    .replace(/\s*\/\/.*$/gm, ''); // remove inline comments

  await fs.writeFile(pathToGradle, newStr, { encoding: 'utf-8' });
}

/** - Run windows platform script */
export async function installWindows(templateName: string) {
  await cmd('npx -y react-native-windows-init --overwrite', { cwd: templateName });
}

/** - Install npm dependencies */
export async function installDependencies(templateName: string) {
  await cmd('npm i --force', { cwd: templateName });
}

/** - Fix for react native screens */
export async function fixMainActivity(templateName: string) {
  const pathJavaMain = path.join(templateName, 'android', 'app', 'src', 'main', 'java', 'com', templateName, 'MainActivity.java');
  const fileStr = await fs.readFile(pathJavaMain, { encoding: 'utf-8' });
  let newStr = fileStr.replace(/(^package.+)(\s)([\s\S]+)/, '$1\n\nimport android.os.Bundle;$3');
  newStr = newStr.replace(
    /(MainActivity extends ReactActivity[\s\S]+?{)(\s)([\s\S]+)/,
    `$1

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }
$3`
  );

  await fs.writeFile(pathJavaMain, newStr, { encoding: 'utf-8' });
}

/** - Add kotlin version to build.gradle */
export async function addKotlinVersion(templateName: string) {
  const pathBuildGradle = path.join(templateName, 'android', 'build.gradle');
  const fileStr = await fs.readFile(pathBuildGradle, { encoding: 'utf-8' });
  const newStr = fileStr.replace(/(buildscript\s+{[\s\S]+?ext\s+{)(\s)([\s\S]+)/, '$1\n        kotlinVersion = "1.7.0"\n$3');

  await fs.writeFile(pathBuildGradle, newStr, { encoding: 'utf-8' });
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

const NAME_REGEX = /^[$A-Z_][0-9A-Z_$]*$/i;

// ref: https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html
const javaKeywords = [
  'abstract',
  'continue',
  'for',
  'new',
  'switch',
  'assert',
  'default',
  'goto',
  'package',
  'synchronized',
  'boolean',
  'do',
  'if',
  'private',
  'this',
  'break',
  'double',
  'implements',
  'protected',
  'throw',
  'byte',
  'else',
  'import',
  'public',
  'throws',
  'case',
  'enum',
  'instanceof',
  'return',
  'transient',
  'catch',
  'extends',
  'int',
  'short',
  'try',
  'char',
  'final',
  'interface',
  'static',
  'void',
  'class',
  'finally',
  'long',
  'strictfp',
  'volatile',
  'const',
  'float',
  'native',
  'super',
  'while',
];

const reservedNames = ['react', 'react-native', ...javaKeywords];

export function validateProjectName(name: string) {
  if (!String(name).match(NAME_REGEX)) {
    throw new Error(`"${name}" is not a valid name for a project. Please use a valid identifier name (alphanumeric).`);
  }

  const lowerCaseName = name.toLowerCase();
  if (reservedNames.includes(lowerCaseName)) {
    throw new Error(`Not a valid name for a project. Please do not use the reserved word "${lowerCaseName}".`);
  }

  if (name.match(/helloworld/gi)) {
    throw new Error('Project name shouldn\'t contain "HelloWorld" name in it, because it is CLI\'s default placeholder name.');
  }
}
