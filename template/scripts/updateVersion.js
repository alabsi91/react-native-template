const util = require('util');
const chalk = require('chalk');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query) {
  return new Promise(resolve => {
    readline.question(query, resolve);
    setTimeout(resolve, 5000);
  });
}

(async function () {
  const toUpdate = await ask(chalk.yellow('❔ Do you want to update app version ? ') + chalk.cyan('[y/N] : '));
  const yes = toUpdate === 'y';
  console.log(chalk.yellow(`\n${yes ? '✅ Yes' : '❌ No'}\n`));
  if (yes) await updateAppVersion();
  console.log(
    chalk.yellow('🔄 Checking for'),
    chalk.cyan('`typescript`'),
    chalk.yellow('and'),
    chalk.cyan('`eslint`'),
    chalk.yellow('errors ...\n')
  );

  process.exit(0);
})();

async function updateAppVersion() {
  let version, updatedVersion;

  try {
    const data = JSON.parse(await readFile('package.json', 'utf8'));
    version = data.version;
    updatedVersion = version
      .split('.')
      .map((v, i) => (i === 2 ? +v + 1 : v))
      .join('.');
    data.version = updatedVersion;

    await writeFile('package.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(chalk.red('\n⛔ Something went wrong !!'));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  try {
    const data = await readFile('android\\app\\build.gradle', 'utf8');
    const updatedData = data.replace(/versionName\s*'.*'/, `versionName '${updatedVersion}'`);

    await writeFile('android\\app\\build.gradle', updatedData);
  } catch (error) {
    console.log(chalk.red('\n⛔ Something went wrong !!'));
    console.log('⛔', chalk.red(error.stderr));
    process.exit(1);
  }

  console.log(
    chalk.green('\n✅ App version updated from'),
    chalk.cyan(version),
    chalk.green('to'),
    chalk.cyan(updatedVersion),
    chalk.green('.\n')
  );
}
