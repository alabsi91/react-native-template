import fs from "fs/promises";
import path from "path";
import * as prettier from "prettier";

import config from "../template.config.js";

/** - Copy file from template folder for web platform */
export async function webScript(templateName: string) {
  config.babelPlugins.unshift(
    ...["@babel/plugin-proposal-export-namespace-from", "@babel/plugin-proposal-optional-chaining"],
  );

  // modify index.js
  const indexPath = path.join(templateName, "index.js");
  const file = await fs.readFile(indexPath, { encoding: "utf-8" });
  const str =
    file.replace("AppRegistry", " AppRegistry, Platform ") +
    `
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication('${templateName}', { rootTag });
}
`;

  const formattedString = await prettier.format(str, { ...config.prettier, parser: "babel" });

  await fs.writeFile(indexPath, formattedString, { encoding: "utf-8" });
}
