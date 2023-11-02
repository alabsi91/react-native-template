const colors = {
  default: null,
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  grey: 90,
  redBright: 91,
  greenBright: 92,
  yellowBright: 93,
  blueBright: 94,
  magentaBright: 95,
  cyanBright: 96,
  whiteBright: 97,
};

const resetColors = '\x1b[0m';

const textColor = (color: number) => `\x1b[${color}m`;
const bgColor = (color: number) => `\x1b[${color + 10}m`;

export default class Log {
  static debug = (message: string) => {
    console.log(
      textColor(colors.whiteBright) +
        '| ' +
        resetColors +
        bgColor(colors.whiteBright) +
        textColor(colors.black) +
        '  DEBUG  ' +
        resetColors +
        textColor(colors.whiteBright) +
        ' |',
      message,
      resetColors
    );
  };

  static warn = (message: string) => {
    console.log(
      textColor(colors.yellow) +
        '| ' +
        resetColors +
        bgColor(colors.yellow) +
        textColor(colors.black) +
        ' WARNING ' +
        resetColors +
        textColor(colors.yellow) +
        ' |',
      message,
      resetColors
    );
  };

  static info = (message: string) => {
    console.log(
      textColor(colors.cyanBright) +
        '| ' +
        resetColors +
        bgColor(colors.cyan) +
        textColor(colors.black) +
        '  INFO   ' +
        resetColors +
        textColor(colors.cyanBright) +
        ' |',
      message,
      resetColors
    );
  };

  static error = (message: string) => {
    console.log(
      textColor(colors.redBright) +
        '| ' +
        resetColors +
        bgColor(colors.red) +
        textColor(colors.black) +
        '  ERROR  ' +
        resetColors +
        textColor(colors.redBright) +
        ' |',
      message,
      resetColors
    );
  };

  static success = (message: string) => {
    console.log(
      textColor(colors.greenBright) +
        '| ' +
        resetColors +
        bgColor(colors.greenBright) +
        textColor(colors.black) +
        ' SUCCESS ' +
        resetColors +
        textColor(colors.greenBright) +
        ' |',
      message,
      resetColors
    );
  };
}
