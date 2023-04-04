const fs = require('fs');

module.exports = function (api) {
  api.cache(true);

  const fileText = fs
    .readFileSync('./tsconfig.json', { encoding: 'utf-8' })
    .replace(/\s*\/\*[\s\S]*?\*\//gm, '') // remove comment blocks
    .replace(/\s*\/\/.*$/gm, ''); // remove inline comments
  const tsconfig = JSON.parse(fileText);
  const paths = tsconfig.compilerOptions.paths;

  const alias = {};
  for (const key in paths) {
    const aliasName = key.replace(/\/\*$/, '');
    const aliasPath = paths[key][0].replace(/\/\*$/, '/');
    alias[aliasName] = aliasPath.startsWith('./') ? aliasPath : './' + aliasPath;
  }

  const presets = [];
  const plugins = [
    [require.resolve('babel-plugin-module-resolver'), { alias }],
  ];

  return {
    presets,
    plugins,
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};