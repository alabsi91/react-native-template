import chalk from 'chalk';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';

// ? 💁 See `https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json` for more spinners.
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/** ⚠️ if the terminal's window is resized while the spinner is running, weird behavior may occur. */
export function progress(message: string, autoStopTimer = 0) {
  let rowNumber: number, // row number
    id: NodeJS.Timeout | null; // to save the interval id

  async function start(startMessage = message, timer = autoStopTimer) {
    if (id) clearInterval(id);
    process.stdin.setEncoding('utf8'); // set encoding to utf8
    process.stdin.setRawMode(true); // disable buffering

    process.stdin.once('readable', () => {
      const buf = process.stdin.read(), // read the buffer
        str = JSON.stringify(buf), // "\u001b[9;1R
        xy = /\[(.*)/g.exec(str)?.[0].replace(/\[|R"/g, '').split(';'), // get x and y coordinates
        pos = { rows: +(xy?.[0] || '0'), cols: +(xy?.[1] || '0') }; // get cursor position

      process.stdin.setRawMode(false); // disable raw mode

      rowNumber = pos.rows - (id ? 1 : 0); // set row number
      id = null;
      // animate the spinner with a message.
      let i = 0;
      id = setInterval(() => {
        process.stdout.cursorTo(0, rowNumber); // ⤴️ move cursor to the start of the line.
        process.stdout.clearLine(0); // 🧹 clear first progress line.
        const spinner = chalk.cyan(frames[i++ % frames.length]); // get next frame
        const loadingMessage = chalk.yellow(startMessage); // ✉️ user message.
        process.stdout.write(`${spinner}  ${loadingMessage}`); // 🖨️ print spinner to the console.
      }, 80);
    });

    process.stdin.resume();
    process.stdout.write('\u001b[6n'); // will report the cursor position to the application

    // 🕐 wait for a certain amount of time before stopping the spinner.
    if (timer) {
      await sleep(timer);
      stop();
    }
  }

  function stop() {
    if (!id) return;
    clearInterval(id); // 🛑 stop the animation.
    id = null;
    process.stdout.cursorTo(0, rowNumber); // ⤴️ move cursor to the start of the line.
    process.stdout.clearLine(0); // 🧹 clear the progress line.
  }

  start(); // 🚀 start the spinner.

  // ↪️ return a function to stop the spinner with a message.
  return {
    /** 🚀 start the spinner. this will stop the previous one. */
    start,
    /** 🛑 stop the animation and clear it. */
    stop,
    /** ✅ stop with a success styled message. */
    success: function (endMessage: string) {
      stop();
      const successMessage = chalk.green(`✅ ${endMessage}`); // ✅ success message if isError is false
      process.stdout.write(`${successMessage}\n\n`); // 🖨️ print end message to the console.
    },
    /** ⛔ stop with an error styled message. */
    error: function (endMessage: string) {
      stop();
      const errorMessage = chalk.red(`⛔ ${endMessage}`); // ⛔ error message if isError is true
      process.stdout.write(`${errorMessage}\n\n`); // 🖨️ print end message to the console.
    },
    /** stop with a none styled message. */
    log: function (logMessage: string) {
      stop();
      process.stdout.write(logMessage); // 🖨️ print end message to the console.
    },
  };
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function copyRecursive(source: string, target: string): Promise<void> {
  const sourceStats = await stat(source);

  if (sourceStats.isDirectory()) {
    await mkdir(target, { recursive: true });

    const files = await readdir(source);

    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      await copyRecursive(sourcePath, targetPath);
    }
  } else if (sourceStats.isFile()) {
    await copyFile(source, target);
  }
}

const NAME_REGEX = /^[$A-Z_][0-9A-Z_$]*$/i;
// ref: https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html
const javaKeywords = [
  'abstract',
  'continue',
  'for',
  'new',
  'switch',
  'assert',
  'default',
  'goto',
  'package',
  'synchronized',
  'boolean',
  'do',
  'if',
  'private',
  'this',
  'break',
  'double',
  'implements',
  'protected',
  'throw',
  'byte',
  'else',
  'import',
  'public',
  'throws',
  'case',
  'enum',
  'instanceof',
  'return',
  'transient',
  'catch',
  'extends',
  'int',
  'short',
  'try',
  'char',
  'final',
  'interface',
  'static',
  'void',
  'class',
  'finally',
  'long',
  'strictfp',
  'volatile',
  'const',
  'float',
  'native',
  'super',
  'while',
];

const reservedNames = ['react', 'react-native', ...javaKeywords];

export function validateProjectName(name: string) {
  if (!String(name).match(NAME_REGEX)) {
    throw new Error(`"${name}" is not a valid name for a project. Please use a valid identifier name (alphanumeric).`);
  }

  const lowerCaseName = name.toLowerCase();
  if (reservedNames.includes(lowerCaseName)) {
    throw new Error(`Not a valid name for a project. Please do not use the reserved word "${lowerCaseName}".`);
  }

  if (name.match(/helloworld/gi)) {
    throw new Error('Project name shouldn\'t contain "HelloWorld" name in it, because it is CLI\'s default placeholder name.');
  }
}
