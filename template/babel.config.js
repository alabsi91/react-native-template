const fs = require('fs');

module.exports = function (api) {
  api.cache(true);

  const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', { encoding: 'utf-8' }));
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