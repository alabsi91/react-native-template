const config = {
  delete: ['__tests__', '.prettierrc.js', '.eslintrc.js', '.watchmanconfig', 'app.json', '.node-version', 'App.js'],
  delete_android: ['android', '.buckconfig'],
  delete_ios: ['ios', '.ruby-version', 'Gemfile'],

  scripts: [
    ['๐ป dev-server', 'start react-native start'],
    ['๐ server-reset-cache', 'start react-native start --reset-cache'],
  ],

  scripts_android: [
    ['๐ฑ emulator', 'node scripts/emulator.js'],
    ['๐ฆ build-debug', 'cd android && .\\gradlew assembleDebug'],
    ['๐ฆ build-release', 'node scripts/updateVersion && cd android && .\\gradlew assembleRelease'],
    ['๐งน clean-build', 'cd android && .\\gradlew clean'],
    ['๐ stop-daemon', 'cd android && .\\gradlew --stop'],
    ['โฌ๏ธ install-apk-release', 'node scripts/installApk.js'],
    ['โฌ๏ธ install-apk-debug', 'node scripts/installApk.js --debug'],
    ['๐ run-app', 'node scripts/startAppOnDevice.js'],
    ['๐ adb-wirless', 'adb connect 192.168.1.112:5555'],
    ['๐ adb-tcp', 'adb reverse tcp:8081 tcp:8081 && start react-native start'],
  ],

  scripts_ios: [['๐ ios', 'react-native run-ios']],

  scripts_web: [
    ['๐ start-web', 'expo start --web'],
    ['๐ build-web', 'expo export:web'],
    ['๐ customize-web', 'expo customize'],
  ],

  eslint: {
    extends: '@react-native-community',
    rules: {
      'react-native/no-inline-styles': 0,
      'prettier/prettier': 0,
      'jsx-quotes': 0,
      curly: 0,
      'no-shadow': 0,
      'no-bitwise': 0,
      'react-hooks/exhaustive-deps': 0,
    },
  },

  preLibs: [
    'reanimated-color-picker',
    'react-navigation',
    'react-native-vector-icons',
    'react-native-svg',
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

  deps_to_remove: ['jest', 'babel-jest', 'react-test-renderer'],

  dep_to_add: [] as string[][],

  dev_deps_to_add: [
    ['babel-plugin-transform-remove-console', 'latest'],
    ['babel-plugin-optional-require', 'latest'],
    ['chalk', '4.1.2'],
  ],

  web_deps: [
    ['react-dom', '^17.0.2'],
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

  ts_dev_deps_to_add: [
    ['@tsconfig/react-native', 'latest'],
    ['@types/react-native', 'latest'],
    ['typescript', 'latest'],
  ],
};

export default config;
