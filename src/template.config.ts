const config = {
  delete: [".prettierrc.js", ".eslintrc.js", ".watchmanconfig", "app.json", "README.md", "App.tsx"],
  delete_android: ["android", ".buckconfig"],
  delete_ios: ["ios", "Gemfile"],

  scripts: [
    ["dev-server", "rn-tools start-server"],
    ["reset-cache", "rn-tools start-server -c"],
    ["rn-tools", "rn-tools"],
    ["postinstall", "patch-package"],
    ["test", "jest"],
  ],

  scripts_android: [
    ["emulator", "rn-tools emulator"],
    ["build", "rn-tools build"],
    ["install-apk", "rn-tools install-apk"],
    ["run-app", "rn-tools launch-app"],
    ["adb-wireless", "adb connect 192.168.1.112:5555 || adb tcpip 5555"],
  ],

  scripts_ios: [["ios", "react-native run-ios"]],

  scripts_web: [
    ["start-web", "expo start --web"],
    ["build-web", "expo export:web"],
    ["customize-web", "expo customize"],
  ],

  eslint: {
    extends: ["@react-native", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    ignorePatterns: ["*.js"],
    rules: {
      curly: 0,
      "@typescript-eslint/consistent-type-imports": 1,
      "@typescript-eslint/no-non-null-assertion": 0,
      "react-native/no-unused-styles": 1,
      "react-native/no-inline-styles": 0,
      "react-native/no-single-element-style-arrays": 1,
      "react-native/no-raw-text": 2,
      "react-hooks/exhaustive-deps": 0,
      "object-shorthand": 1,
      "require-await": 1,
      "prettier/prettier": 1,
      "no-shadow": 0,
      "no-bitwise": 0,
      "jsx-quotes": 0,
    },
  },

  prettier: {
    arrowParens: "avoid" as const,
    printWidth: 130,
    jsxSingleQuote: true,
    semi: true,
    bracketSpacing: true,
    bracketSameLine: false,
    endOfLine: "lf" as const,
    singleQuote: false,
  },

  preLibs: [
    "reanimated-color-picker",
    "react-navigation",
    "react-native-vector-icons",
    "react-native-svg",
    "react-native-safe-area-context",
    "react-native-reanimated",
    "react-native-mmkv",
    "react-native-material-you-colors",
    "react-native-linear-gradient",
    "react-native-gesture-handler",
    "react-native-device-info",
    "react-native-bootsplash",
    "lottie-react-native",
    "firebase",
    "@shopify/react-native-skia",
    "@shopify/flash-list",
    "@react-native-google-signin/google-signin",
    "@react-native-community/netinfo",
    "@react-native-community/datetimepicker",
    "@react-native-community/blur",
    "@react-native-async-storage/async-storage",
  ],

  babelPresets: ["module:@react-native/babel-preset"],
  babelPlugins: [] as string[],

  deps_to_remove: [] as string[],

  dep_to_add: [] as string[][],

  dev_deps_to_add: [
    ["rn-tools", "github:alabsi91/react-native-tools-cli"],
    ["patch-package", "latest"],
    ["@typescript-eslint/eslint-plugin", "latest"],
    ["@typescript-eslint/parser", "latest"],
    ["prettier", "latest"],
    ["eslint-plugin-prettier", "latest"],
    ["babel-plugin-transform-remove-console", "latest"],
    ["babel-plugin-module-resolver", "latest"],
    ["inquirer", "8.0.0"],
    ["chalk", "4.1.2"],
  ],

  web_deps: [
    ["react-dom", "18.2.0"],
    ["react-native-web", "^0.19.6"],
  ],

  web_dev_deps: [
    ["babel-plugin-react-native-web", "latest"],
    ["@babel/plugin-proposal-optional-chaining", "latest"],
    ["@babel/plugin-proposal-export-namespace-from", "latest"],
    ["babel-plugin-module-resolver", "latest"],
    ["@expo/cli", "latest"],
    ["@expo/webpack-config", "latest"],
  ],

  create_folders: [
    "src/assets",
    "src/assets/svg",
    "src/assets/lottie",
    "src/assets/icons",
    "src/assets/fonts",
    "src/components",
    "src/screens",
    "src/styles",
  ],
  create_files: [
    {
      path: "src/Types.d.ts",
      content:
        "import type { ImageSourcePropType } from 'react-native';\n\ndeclare global {\n  declare module '*.png' {\n    const value: ImageSourcePropType;\n    export default value;\n  }\n}",
    },
    {
      path: "react-native.config.js",
      content:
        "module.exports = {\n  project: {\n    ios: {},\n    android: {},\n  },\n  iosAssets: ['src/assets/fonts/'],\n};\n// run the command `npx react-native-asset` to link fonts.\n// don't forget to rebuild your project.",
    },
  ],

  tsconfig: {
    extends: "@react-native/typescript-config/tsconfig.json",
    compilerOptions: {
      types: ["react-native", "jest"],
      baseUrl: ".",
      paths: {
        "@assets/*": ["src/assets/*"],
        "@components/*": ["src/components/*"],
        "@screens/*": ["src/screens/*"],
        "@styles/*": ["src/styles/*"],
        "@types": ["src/Types"],
      },
    },
  },
};

export default config;
