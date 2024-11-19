import { useWindowDimensions } from "react-native";

export const fontFamily = {
  light: { fontFamily: "SignikaNegative", fontWeight: "300" },
  regular: { fontFamily: "SignikaNegative", fontWeight: "400" },
  medium: { fontFamily: "SignikaNegative", fontWeight: "500" },
  semiBold: { fontFamily: "SignikaNegative", fontWeight: "600" },
  bold: { fontFamily: "SignikaNegative", fontWeight: "700" },
} as const;

/**
 * A React hook that returns a responsive font size depending on the window width while ignoring device font scale
 * settings.
 */
export function useFontSize() {
  const { width, fontScale } = useWindowDimensions();

  const calcFontSize = (size: number) => {
    const windowWidth = width > 600 ? 600 : width;
    return (size + 16 * ((windowWidth - 320) / 680)) / fontScale;
  };

  const fontSizes = {
    /** **10** */
    tiny: calcFontSize(10),
    /** **12** */
    compact: calcFontSize(12),
    /** **14** */
    small: calcFontSize(14),
    /** **16** */
    normal: calcFontSize(16),
    /** **18** */
    medium: calcFontSize(18),
    /** **22** */
    large: calcFontSize(22),
    /** **28** */
    xLarge: calcFontSize(28),
    /** **36** */
    xxLarge: calcFontSize(36),
    /** Enter a custom value. */
    custom: calcFontSize,
  };

  return fontSizes;
}
