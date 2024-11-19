import MaterialYou from "react-native-material-you-colors";

import type { MaterialYouPalette } from "react-native-material-you-colors";

function mapPaletteToTheme(palette: MaterialYouPalette) {
  const light = {
    isDark: false,

    primary: palette.system_accent1[7],

    text: palette.system_accent2[10],
    textMedium: palette.system_accent1[11],
    textFaded: palette.system_neutral2[9],

    BorW: palette.system_accent1[12],
    shadow: "#ddd",

    background: palette.system_neutral1[1],
    header: palette.system_neutral1[2],
    card: palette.system_neutral1[3],
    icon: palette.system_neutral2[10],
  };

  const dark: typeof light = {
    isDark: true,

    primary: palette.system_accent1[4],

    text: palette.system_accent2[2],
    textMedium: palette.system_accent1[1],
    textFaded: palette.system_neutral2[2],

    BorW: palette.system_accent1[0],
    shadow: "#222",

    background: palette.system_neutral1[11],
    header: palette.system_neutral1[10],
    card: palette.system_neutral1[9],
    icon: palette.system_neutral2[2],
  };

  return { light, dark };
}

export const { ThemeProvider, useMaterialYouTheme: useTheme } = MaterialYou.createThemeContext(mapPaletteToTheme);
