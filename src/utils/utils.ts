import config from '@/template.config.js';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';
import { OS, type OSType } from '../types.js';

/** Ask the user for the template project name */
export async function askForProjectName(): Promise<string> {
  const { name } = await inquirer.prompt<{ name: string }>([
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
  const { platforms } = await inquirer.prompt<{ platforms: OSType[] }>([
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
  const { installDeps } = await inquirer.prompt<{ installDeps: boolean }>([
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
  const { keepJest } = await inquirer.prompt<{ keepJest: boolean }>([
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
  const { libs } = await inquirer.prompt<{ libs: string[] }>([
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

export async function copyRecursive(source: string, target: string): Promise<void> {
  const sourceStats = await stat(source);

  if (sourceStats.isDirectory()) {
    await mkdir(target, { recursive: true });

    const files = await readdir(source);

    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      await copyRecursive(sourcePath, targetPath);
    }
  } else if (sourceStats.isFile()) {
    await copyFile(source, target);
  }
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
