import { StyleSheet, useWindowDimensions } from 'react-native';

export const globalStyle = {
  background: StyleSheet.create({}),
  text: StyleSheet.create({}),
  textInput: StyleSheet.create({}),
};

/** - A React hook that returns a responsive font size depending on the window width while ignoring device font scale settings. */
export function useFontSize() {
  const { width, fontScale } = useWindowDimensions();
  return (size: number) => ({ fontSize: (width > 600 ? size : size + 16 * ((width - 320) / 680)) / fontScale });
}
