const { spawn } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');

const cmd = process.platform.startsWith('win') ? 'gradlew.bat' : './gradlew';

const CHOICES = {
  RELEASE: 'Build release',
  DEBUG: 'Build debug',
  CLEAN: 'Clean build cache',
};

(async function () {
  const { operationName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'operationName',
      message: 'Choose an operation :',
      choices: [CHOICES.RELEASE, CHOICES.DEBUG, CHOICES.CLEAN],
    },
  ]);

  if (operationName === CHOICES.RELEASE) {
    // eslint and typescript check
    console.log(chalk.yellow('\n🔄 Checking for'), chalk.cyan('`typescript`'), chalk.yellow('errors ...\n'));
    await executeCommand('npx', ['tsc', '--project', './'], { stdio: 'inherit', shell: true });

    console.log(chalk.yellow('\n🔄 Checking for'), chalk.cyan('`eslint`'), chalk.yellow('errors ...\n'));
    await executeCommand('npx', ['eslint', 'src', '--max-warnings', '0'], { stdio: 'inherit', shell: true });
  }

  const gradleArgs =
    operationName === CHOICES.DEBUG ? 'assembleDebug' : operationName === CHOICES.RELEASE ? 'assembleRelease' : 'clean';

  // build
  console.log(chalk.yellow('\n', operationName === CHOICES.CLEAN ? '🧹 Cleaning build cache' : '📦 Building', '...\n'));
  await executeCommand(cmd, [gradleArgs], { cwd: 'android', stdio: 'inherit' });

  console.log(chalk.green('\n✅ Done!\n'));
})();

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
