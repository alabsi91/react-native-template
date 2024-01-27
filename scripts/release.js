import { spawn } from 'child_process';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';

const releasePath = path.join('installer', 'installer.exe');
const REPO = 'alabsi91/react-native-template';

const CHOICES = {
  CREATE: 'create a new release',
  UPLOAD: 'upload assets to a release',
};

const { version: currentVersion } = JSON.parse(await fs.readFile('package.json'));

const { version, operationName } = await inquirer.prompt([
  {
    type: 'list',
    name: 'operationName',
    message: 'Choose an operation :',
    choices: [CHOICES.CREATE, CHOICES.UPLOAD],
  },
  {
    type: 'input',
    name: 'version',
    default: 'v' + currentVersion,
    message: 'Enter the release tag: ',
  },
]);

if (operationName === CHOICES.CREATE) {
  try {
    await executeCommand(
      'gh',
      ['release', 'create', version, '-R', REPO, '--notes', version, '--latest', '--title', version, releasePath],
      { stdio: 'inherit' },
    );
  } catch (error) {
    // console.log(error);
  }
  process.exit();
}

if (operationName === CHOICES.UPLOAD) {
  try {
    await executeCommand('gh', ['release', 'upload', version, '-R', REPO, releasePath, '--clobber'], {
      stdio: 'inherit',
    });
  } catch (error) {
    // console.log(error);
  }
  process.exit();
}

function executeCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);
    let output = '';

    childProcess.on('close', code => {
      if (code === 0) {
        resolve(output);
        return;
      }

      reject(new Error(code));
    });
  });
}
