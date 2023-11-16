#!/usr/bin/env node
import { exec } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import gradient from 'gradient-string';
import path from 'path';
import util from 'util';
import { progress } from './utils.js';
import { OS, addAppTsx, addBabelConfig, askForInstallingDeps, askForKeepingJest, askForPlatforms, askForPreInstalledLibs, askForProjectName, copyReactNavigationTemplate, copyScripts, editIndexJs, editPackageJson, edit_tsconfigJson, installDependencies, removeJest, runVSCode, } from './methods.js';
import { installWindows } from './Windows/addWindowsSupport.js';
import { webScript } from './Web/addWebSupport.js';
import { addGlobalTypes, configureMetroForSVG } from './All/rnSvgSetup.js';
import { addKotlinDependency, addKotlinVersion } from './Android/addKotlinVersion.js';
import { fixMainActivity, fixPageTransition } from './Android/rnScreensFix.js';
import { enableSeparateBuild } from './Android/enableSeparateBuild.js';
import config from './template.config.js';
const cmd = util.promisify(exec);
const coolGradient = gradient([
    { color: '#FA8BFF', pos: 0 },
    { color: '#2BD2FF', pos: 0.5 },
    { color: '#2BFF88', pos: 1 },
]);
console.log(coolGradient("\n.______       _______     ___       ______ .___________.   .__   __.      ___   .___________. __  ____    ____  _______ \n|   _  \\     |   ____|   /   \\     /      ||           |   |  \\ |  |     /   \\  |           ||  | \\   \\  /   / |   ____|\n|  |_)  |    |  |__     /  ^  \\   |  ,----'`---|  |----`   |   \\|  |    /  ^  \\ `---|  |----`|  |  \\   \\/   /  |  |__   \n|      /     |   __|   /  /_\\  \\  |  |         |  |        |  . `  |   /  /_\\  \\    |  |     |  |   \\      /   |   __|  \n|  |\\  \\----.|  |____ /  _____  \\ |  `----.    |  |        |  |\\   |  /  _____  \\   |  |     |  |    \\    /    |  |____ \n| _| `._____||_______/__/     \\__\\ \\______|    |__|        |__| \\__| /__/     \\__\\  |__|     |__|     \\__/     |_______|\n                                                                                                                        \n"));
async function app() {
    const inputs = {
        name: await askForProjectName(),
        platforms: await askForPlatforms(),
        preLibs: await askForPreInstalledLibs(),
        keepJest: await askForKeepingJest(),
        installDependencies: await askForInstallingDeps(),
    };
    const isAndroid = inputs.platforms.includes(OS.Android);
    const isIOS = inputs.platforms.includes(OS.IOS);
    const isWeb = inputs.platforms.includes(OS.Web);
    const isWindows = inputs.platforms.includes(OS.Windows);
    const isReactNavigationSelected = inputs.preLibs.includes('react-navigation');
    const configuration = inputs.keepJest ? config : removeJest();
    if (isReactNavigationSelected) {
        inputs.preLibs.splice(inputs.preLibs.indexOf('react-navigation'), 1, '@react-navigation/native');
        inputs.preLibs.push('@react-navigation/native-stack');
        inputs.preLibs.push('react-native-screens');
        inputs.preLibs.push('react-native-safe-area-context');
    }
    if (inputs.preLibs.includes('reanimated-color-picker')) {
        inputs.preLibs.push('react-native-reanimated');
        inputs.preLibs.push('react-native-gesture-handler');
    }
    if (inputs.preLibs.includes('react-native-reanimated')) {
        configuration.babelPlugins.push('react-native-reanimated/plugin');
    }
    if (inputs.preLibs.includes('react-native-svg')) {
        configuration.dev_deps_to_add.push(['react-native-svg-transformer', 'latest']);
    }
    const libs = [...new Set(inputs.preLibs)].map(lib => [lib, 'latest']);
    configuration.dep_to_add.push(...libs);
    const loading = progress('Downloading ...');
    try {
        await cmd(`npx -y react-native init "${inputs.name}" --skip-install ${process.argv.slice(2).join(' ')}`);
    }
    catch (error) {
        loading.error('Error while downloading the template !!');
        process.exit(1);
    }
    loading.start('Applying settings ...');
    if (isAndroid) {
        try {
            await copyScripts(inputs.name);
        }
        catch (error) {
            loading.error('Error while Copying Scripts !!');
        }
    }
    if (isAndroid) {
        try {
            await enableSeparateBuild(inputs.name);
        }
        catch (error) {
            loading.error('Error enabling Separate Builds for Android !!');
        }
    }
    if (inputs.preLibs.includes('react-native-screens') && isAndroid) {
        try {
            await fixMainActivity(inputs.name);
            await fixPageTransition(inputs.name);
        }
        catch (error) {
            loading.error('Error while applying a fix for react-native-screens on Android !!');
        }
    }
    if (isAndroid) {
        try {
            await addKotlinVersion(inputs.name);
            await addKotlinDependency(inputs.name);
        }
        catch (error) {
            loading.error('Error adding kotlin version to build.gradle file !!');
        }
    }
    try {
        await editPackageJson(inputs.name, inputs.platforms);
    }
    catch (error) {
        loading.error('Error while editing "package.json" !!');
    }
    let to_delete = configuration.delete;
    if (!isAndroid)
        to_delete = to_delete.concat(configuration.delete_android);
    if (!isIOS)
        to_delete = to_delete.concat(configuration.delete_ios);
    try {
        for (const file of to_delete) {
            const filePath = path.join(inputs.name, file);
            const isFile = existsSync(filePath);
            if (isFile)
                await fs.rm(filePath, { recursive: true });
        }
    }
    catch (error) {
        loading.error('Error while deleting files !!');
    }
    try {
        await addAppTsx(inputs.name);
    }
    catch (error) {
        loading.error('Error while adding "App.tsx" file !!');
    }
    try {
        await editIndexJs(inputs.name);
    }
    catch (error) {
        loading.error('Error while editing "index.js" !!');
    }
    try {
        await edit_tsconfigJson(inputs.name);
    }
    catch (error) {
        loading.error('Error while editing "tsconfig.json" !!');
    }
    if (isWeb) {
        try {
            await webScript(inputs.name);
        }
        catch (error) {
            loading.error('Error while applying the web platform script !!');
        }
    }
    try {
        await addBabelConfig(inputs.name);
    }
    catch (error) {
        loading.error('Error while adding "babel.config.js" !!');
    }
    if (inputs.installDependencies) {
        loading.start('Installing dependencies ...');
        try {
            await installDependencies(inputs.name);
        }
        catch (error) {
            loading.error('Error while installing dependencies !!');
        }
    }
    if (isWindows) {
        loading.start('Applying settings for Windows platform ...');
        try {
            await installWindows(inputs.name);
        }
        catch (error) {
            loading.error('Error while applying settings for Windows platform !!');
        }
    }
    try {
        for (let i = 0; i < config.create_folders.length; i++) {
            const folderPath = path.join(inputs.name, config.create_folders[i]);
            await fs.mkdir(folderPath);
        }
        for (let i = 0; i < config.create_files.length; i++) {
            const { path: name, content } = config.create_files[i];
            await fs.appendFile(path.join(inputs.name, name), content, { encoding: 'utf-8' });
        }
    }
    catch (error) {
        loading.error('Error while creating empty folders and files for the template !!');
    }
    if (inputs.preLibs.includes('react-native-svg')) {
        try {
            await configureMetroForSVG(inputs.name);
            await addGlobalTypes(inputs.name);
        }
        catch (error) {
            loading.error('Error while editing "metro.config.js" !!');
        }
    }
    if (isReactNavigationSelected) {
        try {
            await copyReactNavigationTemplate(inputs.name);
        }
        catch (error) {
            loading.error('Error while copying react navigation template !!');
        }
    }
    try {
        await runVSCode(inputs.name);
    }
    catch (error) {
        loading.error('Error while opening with VSCode !!');
    }
    loading.success('Done!!');
}
app();
