import { useWindowDimensions } from 'react-native';

export const fontFamily = {
  semiBold: 'SignikaNegative-SemiBold',
  regular: 'SignikaNegative-Regular',
  medium: 'SignikaNegative-Medium',
  light: 'SignikaNegative-Light',
  bold: 'SignikaNegative-Bold',
};

/**
 * A React hook that returns a responsive font size depending on the window width
 * while ignoring device font scale settings.
 */
export function useFontSize() {
  const { width, fontScale } = useWindowDimensions();

  const calcFontSize = (size: number) => {
    const windowWidth = width > 600 ? 600 : width;
    return (windowWidth > 600 ? size : size + 16 * ((windowWidth - 320) / 680)) / fontScale;
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
