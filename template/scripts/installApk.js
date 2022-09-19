const { exec } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const execPromise = util.promisify(exec);

const adb = process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb') : 'adb';

const args = process.argv.slice(2);
const variant = args.includes('--debug') ? 'debug' : 'release';

const pathToBuild = path.join(__dirname, `../android/app/build/outputs/apk/${variant}`);

if (args.includes('--help')) {
  console.log(chalk.cyan('   --debug'), chalk.yellow('       install the debug variant.'));
  process.exit(0);
}

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

  if (devices.length > 1) {
    console.log(chalk.yellow('Found more than 2 devices, using', chalk.cyan(devices[0])));
  }

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
    console.log(chalk.yellow('\n⬇️ Installing the'), chalk.cyan(variant), chalk.yellow('variant in your device ...\n'));
    await execPromise(`"${adb}" -s ${devices[0]} install -r ${apkName}`, { cwd: pathToBuild });
  } catch (error) {
    console.log(chalk.red('\n⛔ Something went wrong !!'));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  console.log(chalk.green('✅ Done!\n'));
})();
