import chalk from 'chalk';
import { spawn } from 'child_process';
import inquirer from 'inquirer';

const cmd = process.platform.startsWith('win') ? 'gradlew.bat' : './gradlew';

const CHOICES = {
  APK_RELEASE: 'Build APK Release',
  APK_DEBUG: 'Build APK Debug',
  BUNDLE_RELEASE: 'Build Bundle Release (AAB)',
  BUNDLE_DEBUG: 'Build Bundle Debug (AAB)',
  CLEAN: 'Clean Build Cache',
  STOP: 'Stop Gradle',
};

const { operationName } = await inquirer.prompt([
  {
    type: 'list',
    name: 'operationName',
    message: 'Choose an operation :',
    choices: [CHOICES.APK_RELEASE, CHOICES.APK_DEBUG, CHOICES.BUNDLE_DEBUG, CHOICES.BUNDLE_RELEASE, CHOICES.CLEAN, CHOICES.STOP],
  },
]);

// eslint and typescript check
if (operationName === CHOICES.APK_RELEASE || operationName === CHOICES.BUNDLE_RELEASE) {
  console.log(chalk.yellow('\n🔄 Checking for'), chalk.cyan('`typescript`'), chalk.yellow('errors ...\n'));
  await executeCommand('npx', ['tsc', '--project', './'], { stdio: 'inherit', shell: true });

  console.log(chalk.yellow('\n🔄 Checking for'), chalk.cyan('`eslint`'), chalk.yellow('errors ...\n'));
  await executeCommand('npx', ['eslint', 'src', '--max-warnings', '0'], { stdio: 'inherit', shell: true });
}

let gradleArgs = '';
let logMessage = '';
switch (operationName) {
  case CHOICES.APK_RELEASE:
    gradleArgs = 'assembleRelease';
    logMessage = '📦 Building Release';
    break;
  case CHOICES.APK_DEBUG:
    gradleArgs = 'assembleDebug';
    logMessage = '📦 Building Debug';
    break;
  case CHOICES.BUNDLE_DEBUG:
    gradleArgs = 'bundleDebug';
    logMessage = '📦 Bundling Debug';
    break;
  case CHOICES.BUNDLE_RELEASE:
    gradleArgs = 'bundleRelease';
    logMessage = '📦 Bundling Release';
    break;
  case CHOICES.CLEAN:
    gradleArgs = 'clean';
    logMessage = '🧹 Cleaning The Build Cache';
    break;
  case CHOICES.STOP:
    gradleArgs = '--stop';
    logMessage = '🛑 Stopping Gradle daemons';
    break;
}

// build
console.log(chalk.yellow('\n', logMessage, '...\n'));
await executeCommand(cmd, [gradleArgs], { cwd: 'android', stdio: 'inherit' });

console.log(chalk.green('\n✅ Done!\n'));

function executeCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);
    let output = '';

    childProcess.on('close', code => {
      if (code === 0) {
        resolve(output);
        return;
      }

      reject(new Error(`Command exited with code ${code}`));
    });
  });
}
