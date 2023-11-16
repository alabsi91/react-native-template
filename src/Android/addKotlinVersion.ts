import fs from 'fs/promises';
import path from 'path';

const KOTLIN_VERSION = '1.8.0';

/** - Add kotlin version to build.gradle */
export async function addKotlinVersion(templateName: string) {
  const pathBuildGradle = path.join(templateName, 'android', 'build.gradle');
  const fileStr = await fs.readFile(pathBuildGradle, { encoding: 'utf-8' });
  const newStr = fileStr.replace(
    /(buildscript\s+{[\s\S]+?ext\s+{)(\s)([\s\S]+)/,
    '$1\n        kotlinVersion = "' + KOTLIN_VERSION + '"\n$3'
  );

  await fs.writeFile(pathBuildGradle, newStr, { encoding: 'utf-8' });
}

/** - Add kotlin Dependency to app/build.gradle */
export async function addKotlinDependency(templateName: string) {
  const pathBuildGradle = path.join(templateName, 'android', 'app', 'build.gradle');
  const fileStr = await fs.readFile(pathBuildGradle, { encoding: 'utf-8' });
  const newStr = fileStr.replace(
    /(dependencies\s+{[\s\S])(\s)([\s\S]+)/,
    '$1\n   implementation(platform("org.jetbrains.kotlin:kotlin-bom:' + KOTLIN_VERSION + '"))\n$3'
  );

  await fs.writeFile(pathBuildGradle, newStr, { encoding: 'utf-8' });
}
