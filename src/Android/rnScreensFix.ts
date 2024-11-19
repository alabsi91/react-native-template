import fs from "fs/promises";
import path from "path";

/** - Fix for react native screens */
export async function fixMainActivity(templateName: string) {
  const pathJavaMain = path.join(
    templateName,
    "android",
    "app",
    "src",
    "main",
    "java",
    "com",
    templateName,
    "MainActivity.kt",
  );
  const fileStr = await fs.readFile(pathJavaMain, { encoding: "utf-8" });
  let newStr = fileStr.replace(/(^package.+)(\s)([\s\S]+)/, "$1\n\nimport android.os.Bundle;$3");
  newStr = newStr.replace(
    /(class MainActivity : ReactActivity\(\)[\s\S]+?{)(\s)([\s\S]+)/,
    `$1

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null);
  }
$3`,
  );

  await fs.writeFile(pathJavaMain, newStr, { encoding: "utf-8" });
}

export async function fixPageTransition(templateName: string) {
  const drawablePath = path.join(templateName, "android", "app", "src", "main", "res", "drawable");
  const stylesPath = path.join(templateName, "android", "app", "src", "main", "res", "values", "styles.xml");

  // add alpha_screen.xml layout
  const alpha_screen =
    '<?xml version="1.0" encoding="utf-8"?>\n<layer-list\n        xmlns:android="http://schemas.android.com/apk/res/android"\n        android:opacity="opaque">\n    <item android:gravity="fill">\n        <color android:color="@android:color/transparent" />\n    </item>\n</layer-list>';
  await fs.writeFile(path.join(drawablePath, "alpha_screen.xml"), alpha_screen, { encoding: "utf-8" });

  // add it to styles as a background
  const stylesStr = await fs.readFile(stylesPath, { encoding: "utf-8" });
  const newStr = stylesStr.replace(
    "</style>",
    '    <item name="android:windowBackground">@drawable/alpha_screen</item>\n    </style>',
  );
  await fs.writeFile(stylesPath, newStr, { encoding: "utf-8" });
}
