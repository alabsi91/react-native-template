module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
