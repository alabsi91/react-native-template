import chalk from 'chalk';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
export function progress(message, autoStopTimer = 0) {
    let rowNumber, id;
    async function start(startMessage = message, timer = autoStopTimer) {
        if (id)
            clearInterval(id);
        process.stdin.setEncoding('utf8');
        process.stdin.setRawMode(true);
        process.stdin.once('readable', () => {
            const buf = process.stdin.read(), str = JSON.stringify(buf), xy = /\[(.*)/g.exec(str)?.[0].replace(/\[|R"/g, '').split(';'), pos = { rows: +(xy?.[0] || '0'), cols: +(xy?.[1] || '0') };
            process.stdin.setRawMode(false);
            rowNumber = pos.rows - (id ? 1 : 0);
            id = null;
            let i = 0;
            id = setInterval(() => {
                process.stdout.cursorTo(0, rowNumber);
                process.stdout.clearLine(0);
                const spinner = chalk.cyan(frames[i++ % frames.length]);
                const loadingMessage = chalk.yellow(startMessage);
                process.stdout.write(`${spinner}  ${loadingMessage}`);
            }, 80);
        });
        process.stdin.resume();
        process.stdout.write('\u001b[6n');
        if (timer) {
            await sleep(timer);
            stop();
        }
    }
    function stop() {
        if (!id)
            return;
        clearInterval(id);
        id = null;
        process.stdout.cursorTo(0, rowNumber);
        process.stdout.clearLine(0);
    }
    start();
    return {
        start,
        stop,
        success: function (endMessage) {
            stop();
            const successMessage = chalk.green(`✅ ${endMessage}`);
            process.stdout.write(`${successMessage}\n\n`);
        },
        error: function (endMessage) {
            stop();
            const errorMessage = chalk.red(`⛔ ${endMessage}`);
            process.stdout.write(`${errorMessage}\n\n`);
        },
        log: function (logMessage) {
            stop();
            process.stdout.write(logMessage);
        },
    };
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function copyRecursive(source, target) {
    const sourceStats = await stat(source);
    if (sourceStats.isDirectory()) {
        await mkdir(target, { recursive: true });
        const files = await readdir(source);
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            await copyRecursive(sourcePath, targetPath);
        }
    }
    else if (sourceStats.isFile()) {
        await copyFile(source, target);
    }
}
const NAME_REGEX = /^[$A-Z_][0-9A-Z_$]*$/i;
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
export function validateProjectName(name) {
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
