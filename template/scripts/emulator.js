const { exec, spawn } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const util = require('util');
const path = require('path');
const execPromise = util.promisify(exec);

const emulator = process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'emulator', 'emulator') : 'emulator';

(async function () {
  let devices;

  try {
    let { stdout } = await execPromise(`"${emulator}" -list-avds`);
    const re = /(?<device>.+?)\s+/g;
    devices = [...stdout.matchAll(re)].map(e => e.groups.device);
  } catch (error) {
    console.log(chalk.red('\n⛔ [emulator] is not found in your machine !!\n'));
    process.exit(1);
  }

  if (devices.length === 0) {
    console.log(chalk.red('\n⛔ No emulators found !!\n'));
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

  console.log(chalk.yellow('\n🚀 Opening'), chalk.cyan(devices[0]), chalk.yellow('emulator ...\n'));

  /* Spawning a new process. */
  spawn(emulator, ['-avd', devices[0]], { detached: false, stdio: 'ignore', windowsHide: true, timeout: 10000 }).unref();
})();
