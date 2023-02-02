const config = {
  delete: ['.prettierrc.js', '.eslintrc.js', '.watchmanconfig', 'app.json', '.node-version', 'App.tsx'],
  delete_android: ['android', '.buckconfig'],
  delete_ios: ['ios', '.ruby-version', 'Gemfile'],

  scripts: [
    ['💻 dev-server', 'node scripts/startServer.js'],
    ['🔁 reset-cache', 'node scripts/startServer.js --reset-cache'],
    ['🔎 test', 'jest'],
  ],

  scripts_android: [
    ['📱 emulator', 'node scripts/emulator.js'],
    ['📦 build-debug', 'cd android && .\\gradlew assembleDebug'],
    ['📦 build-release', 'node scripts/updateVersion && cd android && .\\gradlew assembleRelease'],
    ['🧹 clean-build', 'cd android && .\\gradlew clean'],
    ['⬇️ install-apk', 'node scripts/installApk.js'],
    ['🚀 run-app', 'node scripts/startAppOnDevice.js'],
    ['🔌 adb-wirless', 'adb connect 192.168.1.112:5555 || adb tcpip 5555 -s 192.168.1.112:5555'],
  ],

  scripts_ios: [['🚀 ios', 'react-native run-ios']],

  scripts_web: [
    ['🌐 start-web', 'expo start --web'],
    ['🌐 build-web', 'expo export:web'],
    ['🌐 customize-web', 'expo customize'],
  ],

  eslint: {
    extends: '@react-native-community',
    rules: {
      curly: 0,
      'react-native/no-unused-styles': 1,
      'react-native/no-inline-styles': 0,
      'react-hooks/exhaustive-deps': 0,
      'prettier/prettier': 0,
      'no-shadow': 0,
      'no-bitwise': 0,
      'jsx-quotes': 0,
    },
  },

  preLibs: [
    'reanimated-color-picker',
    'react-navigation',
    'react-native-vector-icons',
    'react-native-svg',
    'react-native-safe-area-context',
    'react-native-reanimated',
    'react-native-linear-gradient',
    'react-native-gesture-handler',
    'react-native-device-info',
    'lottie-react-native',
    'firebase',
    '@shopify/flash-list',
    '@react-native-google-signin/google-signin',
    '@react-native-community/netinfo',
    '@react-native-community/datetimepicker',
    '@react-native-async-storage/async-storage',
  ],

  babelPlugins: ['optional-require'],

  deps_to_remove: ['prettier'],

  dep_to_add: [] as string[][],

  dev_deps_to_add: [
    ['babel-plugin-transform-remove-console', 'latest'],
    ['babel-plugin-optional-require', 'latest'],
    ['inquirer', '8.0.0'],
    ['chalk', '4.1.2'],
  ],

  web_deps: [
    ['react-dom', '18.1.0'],
    ['react-native-web', '^0.18.9'],
  ],

  web_dev_deps: [
    ['babel-plugin-react-native-web', 'latest'],
    ['@babel/plugin-proposal-optional-chaining', 'latest'],
    ['@babel/plugin-proposal-export-namespace-from', 'latest'],
    ['babel-plugin-module-resolver', 'latest'],
    ['@expo/cli', 'latest'],
    ['@expo/webpack-config', 'latest'],
  ],

  tsconfig: {
    extends: '@tsconfig/react-native/tsconfig.json',
    compilerOptions: {
      types: ['react-native', 'jest'],
    },
  },
};

export default config;
