import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import config from '../template.config.js';
export async function webScript(templateName) {
    config.babelPlugins.unshift(...[
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-transform-modules-commonjs',
    ]);
    const indexPath = path.join(templateName, 'index.js');
    const file = await fs.readFile(indexPath, { encoding: 'utf-8' });
    const str = file.replace('AppRegistry', ' AppRegistry, Platform ') +
        `
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication('${templateName}', { rootTag });
}
`;
    const formattedString = prettier.format(str, { ...config.prettier, parser: 'babel' });
    await fs.writeFile(indexPath, formattedString, { encoding: 'utf-8' });
}