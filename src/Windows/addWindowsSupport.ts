import chalk from "chalk";
import { existsSync } from "fs";
import path from "path";

import { $ } from "@cli/terminal.js";

/** - Run windows platform script */
export async function installWindows(templateName: string) {
  const node_modules_path = path.join(templateName, "node_modules");
  if (!existsSync(node_modules_path)) {
    console.log(
      chalk.yellow(
        '\n\nThe "node_modules" folder does not exist, please run "npm i". Afterward, execute the following command in your project\'s root directory to set up the Windows platform: "npx -y react-native-windows-init --overwrite"\n\n',
      ),
      chalk.reset(""),
    );
    return;
  }
  await $`npx -y react-native-windows-init --overwrite ${{ cwd: templateName }}`;
}
