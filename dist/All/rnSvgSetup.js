import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
export async function configureMetroForSVG(templateName) {
    const metroConfigPath = path.join(templateName, 'metro.config.js');
    const str = await fs.readFile(metroConfigPath, { encoding: 'utf-8' });
    const lastMatch = str.match(/require\(.+\).*/g)?.at(-1) ?? '';
    const insertPosition = str.indexOf(lastMatch) + lastMatch.length;
    let modifiedStr = str.slice(0, insertPosition) +
        `

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;` +
        str.slice(insertPosition);
    modifiedStr = modifiedStr.replace(/([\s\S]+const\s+config\s*=\s*{)()([\s\S]+)/, `$1
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
$3`);
    await fs.writeFile(metroConfigPath, modifiedStr, { encoding: 'utf-8' });
}
export async function addGlobalTypes(templateName) {
    const typesPath = path.join(templateName, 'src', 'Types.d.ts');
    if (existsSync(typesPath))
        return;
    const typesStr = `import type React from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { SvgProps } from 'react-native-svg';

declare global {
  declare module '*.png' {
    const value: ImageSourcePropType;
    export default value;
  }
  declare module '*.svg' {
    const content: React.FC<SvgProps>;
    export default content;
  }
}`;
    await fs.writeFile(typesPath, typesStr, { encoding: 'utf-8' });
}
