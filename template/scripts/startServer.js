const { exec } = require('child_process');
const inquirer = require('inquirer');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const execPromise = util.promisify(exec);

const adb = process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb') : 'adb';
const args = process.argv.slice(2);
const cache = args.includes('--reset-cache') ? ' --reset-cache' : '';
const newTerminal = process.platform.startsWith('win') ? 'start ' : '';

(async function () {
  let devices;

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

  // set tcp
  try {
    await execPromise(`"${adb}" -s ${devices[0]} reverse tcp:8081 tcp:8081`);
  } catch (error) {
    console.log(chalk.red("\n⛔ Couldn't set tcp !!\n"));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  try {
    execPromise(newTerminal + 'npx react-native start' + cache);
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.log(chalk.red('\n⛔ Something went wrong !!'));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  console.log(chalk.green('\n✅ Done!\n'));
})();
