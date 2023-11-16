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
export var OS;
(function (OS) {
    OS["Android"] = "Android";
    OS["IOS"] = "IOS";
    OS["Web"] = "Web";
    OS["Windows"] = "Windows";
})(OS = OS || (OS = {}));
console.log(OS);
export async function askForProjectName() {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            default: 'myproject',
            message: 'Please enter the new project name : ',
        },
    ]);
    try {
        validateProjectName(name);
    }
    catch (error) {
        console.log('\n⛔', chalk.red.bold(error), '\n');
        return askForProjectName();
    }
    if (existsSync(name)) {
        console.log(chalk.red.bold(`\n⛔ "${name}" directory already exists !!\n`));
        return askForProjectName();
    }
    return name;
}
export async function askForPlatforms() {
    const { platforms } = await inquirer.prompt([
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
export async function askForInstallingDeps() {
    const { installDeps } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'installDeps',
            default: true,
            message: 'Do you want to install the dependencies : ',
        },
    ]);
    return installDeps;
}
export async function askForKeepingJest() {
    const { keepJest } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'keepJest',
            default: false,
            message: 'Do you want to keep jest : ',
        },
    ]);
    return keepJest;
}
export async function askForPreInstalledLibs() {
    const { libs } = await inquirer.prompt([
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
export async function copyScripts(templateName) {
    const fromPath = path.join(process.cwd(), 'template', 'scripts');
    const toPath = path.join(templateName, 'scripts');
    if (!existsSync(toPath))
        await fs.mkdir(toPath);
    const scripts = await fs.readdir(fromPath);
    for (const file of scripts)
        await fs.copyFile(path.join(fromPath, file), path.join(toPath, file));
}
export async function copyReactNavigationTemplate(templateName) {
    const source = path.join(process.cwd(), 'template', 'reactNavigationTemplate');
    const target = path.join(templateName, 'src');
    copyRecursive(source, target);
}
export async function addAppTsx(templateName) {
    const fromPath = path.join(process.cwd(), 'template', 'App.tsx');
    const toPath = path.join(templateName, 'src', 'App.tsx');
    const srcPath = path.join(templateName, 'src');
    if (!existsSync(srcPath))
        await fs.mkdir(srcPath);
    await fs.copyFile(fromPath, toPath);
}
export async function getPkgVersion(pkg) {
    const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    const json = (await res.json());
    return `^${json.version.trim()}`;
}
export async function editPackageJson(templateName, platforms) {
    const packageJsonPath = path.join(templateName, 'package.json');
    const packageJson = await fs.readFile(packageJsonPath, { encoding: 'utf-8' });
    const json = JSON.parse(packageJson);
    json.name = json.name.toLowerCase();
    delete json.jest;
    json.scripts = {};
    if (platforms.includes(OS.Android) || platforms.includes(OS.IOS))
        for (const script of config.scripts)
            json.scripts[script[0]] = script[1];
    if (platforms.includes(OS.Android))
        for (const script of config.scripts_android)
            json.scripts[script[0]] = script[1];
    if (platforms.includes(OS.IOS))
        for (const script of config.scripts_ios)
            json.scripts[script[0]] = script[1];
    if (platforms.includes(OS.Web))
        for (const script of config.scripts_web)
            json.scripts[script[0]] = script[1];
    json.eslintConfig = config.eslint;
    json.prettier = config.prettier;
    for (const d of config.deps_to_remove) {
        delete json.dependencies?.[d];
        delete json.devDependencies?.[d];
    }
    for (const dep of config.dep_to_add) {
        const pkg = dep[0], ver = dep[1];
        json.dependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
    }
    for (const dep of config.dev_deps_to_add) {
        const pkg = dep[0], ver = dep[1];
        json.devDependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
    }
    if (platforms.includes(OS.Web)) {
        for (const dep of config.web_deps) {
            const pkg = dep[0], ver = dep[1];
            json.dependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
        }
        for (const dep of config.web_dev_deps) {
            const pkg = dep[0], ver = dep[1];
            json.devDependencies[pkg] = ver === 'latest' ? await getPkgVersion(pkg) : ver;
        }
    }
    const formattedString = prettier.format(JSON.stringify(json), { ...config.prettier, parser: 'json' });
    await fs.writeFile(packageJsonPath, formattedString, { encoding: 'utf-8' });
}
export async function addBabelConfig(templateName) {
    const fromPath = path.join(process.cwd(), 'template', 'babel.config.js');
    const toPath = path.join(templateName, 'babel.config.js');
    const regex = {
        presets: /presets\s*=\s*\[(?<presets>(?:\[[^\]]*\]|[^[\]]*)*)\]/d,
        plugins: /plugins\s*=\s*\[(?<plugins>(?:\[[^\]]*\]|[^[\]]*)*)\]/d,
    };
    let file = await fs.readFile(fromPath, { encoding: 'utf-8' });
    const presetsMatch = regex.presets.exec(file);
    const pluginsMatch = regex.plugins.exec(file);
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
export async function editIndexJs(templateName) {
    const indexPath = path.join(templateName, 'index.js');
    const indexStr = await fs.readFile(indexPath, { encoding: 'utf-8' });
    const newStr = indexStr
        .replace("import {name as appName} from './app.json';", '')
        .replace('appName', `'${templateName}'`)
        .replace('./App', './src/App')
        .replace(/\/\*\*[\s\S]*?\*\/\n/g, '');
    const formattedString = prettier.format(newStr, { ...config.prettier, parser: 'babel' });
    await fs.writeFile(indexPath, formattedString, { encoding: 'utf-8' });
}
export async function edit_tsconfigJson(templateName) {
    const tsPath = path.join(templateName, 'tsconfig.json');
    const formattedString = prettier.format(JSON.stringify(config.tsconfig), { ...config.prettier, parser: 'json' });
    await fs.writeFile(tsPath, formattedString, { encoding: 'utf-8' });
}
export async function installDependencies(templateName) {
    await cmd('npm i --force', { cwd: templateName });
}
export async function runVSCode(templateName) {
    await cmd('code .', { cwd: templateName });
}
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
