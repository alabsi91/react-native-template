import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

const args = process.argv.slice(2);
const variant = args.includes('--debug') ? '.debug' : '';

const buildGradlePath = path.join('android', 'app', 'build.gradle');
const file = fs.readFileSync(buildGradlePath, { encoding: 'utf-8' });
let packageName = /applicationId (?<package>.*)/.exec(file)?.groups?.package;

if (!packageName) {
  console.log(chalk.red("\n⛔ Couldn't find the"), chalk.cyan('package name'), chalk.red('!!'));
  process.exit(1);
}

packageName = packageName.replaceAll("'", '') + variant;

const adb = process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb') : 'adb';

let devices;

try {
  let { stdout } = await execPromise(`"${adb}" devices`);
  devices = stdout
    .split('\n')
    .filter(e => e.trim() && !e.startsWith('List'))
    .map(e => e.replace(/\s+.+/, '').trim());
} catch (error) {
  console.log(chalk.red('\n⛔ [adb] is not found on your machine !!\n'));
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

try {
  console.log(
    chalk.yellow('\n🚀 Starting'),
    chalk.cyan(packageName),
    chalk.yellow('in your device'),
    chalk.cyan(`(${devices[0]})`),
    chalk.yellow('...\n')
  );
  await execPromise(`"${adb}" -s ${devices[0]} shell monkey -p ${packageName} 1"`);
} catch (error) {
  console.log(chalk.red('\n⛔ Something went wrong !!'));
  console.log('⛔', chalk.red(error.stderr));
  process.exit(1);
}

console.log(chalk.green('✅ Done!\n'));
