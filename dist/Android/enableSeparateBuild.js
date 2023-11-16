import fs from 'fs/promises';
import path from 'path';
export async function enableSeparateBuild(templateName) {
    const pathToGradle = path.join(templateName, 'android', 'app', 'build.gradle');
    const fileStr = await fs.readFile(pathToGradle, { encoding: 'utf-8' });
    const newStr = fileStr
        .replace('android {', `android {
    splits {
        abi {
            reset()
            enable true
            universalApk true
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }`)
        .replace(/\s*\/\*[\s\S]*?\*\//gm, '')
        .replace(/\s*\/\/.*$/gm, '');
    await fs.writeFile(pathToGradle, newStr, { encoding: 'utf-8' });
}
