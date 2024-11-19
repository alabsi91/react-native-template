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

const resetColors = "\x1b[0m";
const textColor = (color: number) => `\x1b[${color}m`;
const bgColor = (color: number) => `\x1b[${color + 10}m`;

/** | TYPE | MESSAGE .... `TRACE` */
function format(type: string, color: number, message: string, trace?: string) {
  const traceFormat = trace ? textColor(colors.grey) + "".padStart(50 - message.length, ".") + ` \`${trace}\`` : "";
  return (
    textColor(color) +
    "|" +
    resetColors +
    bgColor(color) +
    textColor(colors.black) +
    type +
    resetColors +
    textColor(color) +
    "| " +
    textColor(color) +
    message +
    " " +
    traceFormat +
    resetColors
  );
}

export default function Log(message?: string) {
  if (!__DEV__ || !message) return;
  console.log(format("   LOG   ", colors.whiteBright, message, ""));
}

Log.debug = (message: string, trace?: string) => {
  if (!__DEV__) return;
  console.log(format("  DEBUG  ", colors.whiteBright, message, trace));
};

Log.warn = (message: string, trace?: string) => {
  if (!__DEV__) return;
  console.log(format(" WARNING ", colors.yellow, message, trace));
};

Log.info = (message: string, trace?: string) => {
  if (!__DEV__) return;
  console.log(format("  INFO   ", colors.cyanBright, message, trace));
};

Log.error = (message: string, trace?: string) => {
  if (!__DEV__) return;
  console.log(format("  ERROR  ", colors.redBright, message, trace));
};

Log.success = (message: string, trace?: string) => {
  if (!__DEV__) return;
  console.log(format(" SUCCESS ", colors.greenBright, message, trace));
};
