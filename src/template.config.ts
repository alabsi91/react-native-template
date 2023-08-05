const config = {
  delete: ['.prettierrc.js', '.eslintrc.js', '.watchmanconfig', 'app.json', 'README.md', 'App.tsx'],
  delete_android: ['android', '.buckconfig'],
  delete_ios: ['ios', 'Gemfile'],

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
    ['🔌 adb-wireless', 'adb connect 192.168.1.112:5555 || adb tcpip 5555'],
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
      'react-native/no-single-element-style-arrays': 1,
      'react-native/no-raw-text': 2,
      'react-hooks/exhaustive-deps': 0,
      'object-shorthand': 1,
      'require-await': 1,
      'prettier/prettier': 1,
      'no-shadow': 0,
      'no-bitwise': 0,
      'jsx-quotes': 0,
    },
  },

  prettier: {
    arrowParens: 'avoid' as const,
    printWidth: 130,
    jsxSingleQuote: true,
    semi: true,
    bracketSpacing: true,
    bracketSameLine: false,
    endOfLine: 'auto' as const,
    singleQuote: true,
  },

  preLibs: [
    'reanimated-color-picker',
    'react-navigation',
    'react-native-vector-icons',
    'react-native-svg',
    'react-native-safe-area-context',
    'react-native-reanimated',
    'react-native-mmkv',
    'react-native-linear-gradient',
    'react-native-gesture-handler',
    'react-native-device-info',
    'react-native-bootsplash',
    'lottie-react-native',
    'firebase',
    '@shopify/react-native-skia',
    '@shopify/flash-list',
    '@react-native-google-signin/google-signin',
    '@react-native-community/netinfo',
    '@react-native-community/datetimepicker',
    '@react-native-async-storage/async-storage',
  ],

  babelPresets: ['module:metro-react-native-babel-preset'],
  babelPlugins: [] as string[],

  deps_to_remove: [] as string[],

  dep_to_add: [] as string[][],

  dev_deps_to_add: [
    ['babel-plugin-transform-remove-console', 'latest'],
    ['babel-plugin-module-resolver', 'latest'],
    ['inquirer', '8.0.0'],
    ['chalk', '4.1.2'],
  ],

  web_deps: [
    ['react-dom', '18.2.0'],
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

  create_folders: ['src/assets', 'src/components', 'src/screens'],
  create_files: [
    {
      path: 'src/Types.d.ts',
      content:
        "declare global {\n  declare module '*.png' {\n    const value: import('react-native').ImageSourcePropType;\n    export default value;\n  }\n}",
    },
  ],

  tsconfig: {
    extends: '@tsconfig/react-native/tsconfig.json',
    compilerOptions: {
      types: ['react-native', 'jest'],
      baseUrl: '.',
      paths: {
        '@assets/*': ['src/assets/*'],
        '@components/*': ['src/components/*'],
        '@screens/*': ['src/screens/*'],
        '@types': ['src/Types'],
      },
      importsNotUsedAsValues: 'error',
    },
  },
};

export default config;
