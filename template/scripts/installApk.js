const { exec } = require('child_process');
const inquirer = require('inquirer');
const { existsSync } = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const execPromise = util.promisify(exec);

const adb = process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb') : 'adb';

(async function () {
  let devices;
  let apkName;

  try {
    let { stdout } = await execPromise(`"${adb}" devices`);
    const re = /(?<device>.+?)\s+device\b/g;
    devices = [...stdout.matchAll(re)].map(e => e.groups.device);
  } catch (error) {
    console.log(chalk.red('\n⛔ [adb] is not found in your machine !!\n'));
    process.exit(1);
  }

  if (devices.length === 0) {
    console.log(chalk.red('\n⛔ No connected devices found !!\n'));
    process.exit(1);
  }

  const { variantName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'variantName',
      message: 'Choose a variant :',
      choices: ['debug', 'release'],
    },
  ]);

  let variant = variantName ?? 'release';
  const pathToBuild = path.join(__dirname, `../android/app/build/outputs/apk/${variant}`);

  if (devices.length > 1) {
    console.log(chalk.yellow('Found more than 1 device'));
    const { deviceName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deviceName',
        message: 'Choose a device :',
        choices: devices,
      },
    ]);

    devices = [deviceName];
  }

  // get device architecture
  try {
    const { stdout } = await execPromise(`"${adb}" -s ${devices[0]} shell getprop ro.product.cpu.abi devices`);
    apkName = `app-${stdout.trim()}-${variant}.apk`;
  } catch (error) {
    console.log(chalk.red("\n⛔ Couldn't get device architecture !!\n"));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  const isApkExist = existsSync(path.join(pathToBuild, apkName));

  if (!isApkExist) {
    console.log(chalk.red("\n⛔ Couldn't find"), chalk.yellow(apkName), chalk.red('!!\n'));
    process.exit(1);
  }

  try {
    console.log(
      chalk.yellow('\n ⬇️ Installing the'),
      chalk.cyan(variant),
      chalk.yellow('variant in your device'),
      chalk.cyan(`(${devices[0]})`),
      chalk.yellow('...\n')
    );
    await execPromise(`"${adb}" -s ${devices[0]} install -r ${apkName}`, { cwd: pathToBuild });
  } catch (error) {
    console.log(chalk.red('\n⛔ Something went wrong !!'));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  console.log(chalk.green('✅ Done!\n'));
})();
