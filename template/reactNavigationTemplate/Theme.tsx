import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import type { NativeEventSubscription } from 'react-native';

const lightTheme = {
  isDark: false,
  primary: '#0074D9',
  secondary: '#FF4136',
  background: '#F5F5F5',
  text: '#333333',
  header: '#fff',
  button: '#2ECC40',
  border: '#DDDDDD',
  info: '#428BCA',
  shadow: '#888888',
  disabled: '#CCCCCC',
};

const darkTheme = {
  isDark: true,
  primary: '#1E90FF',
  secondary: '#FF6347',
  background: '#1E1E1E',
  text: '#FFFFFF',
  header: '#000',
  button: '#3CB371',
  border: '#555555',
  info: '#66B2FF',
  shadow: '#333333',
  disabled: '#888888',
};

export const theme = Appearance.getColorScheme() === 'light' ? lightTheme : darkTheme;

type ColorScheme = 'light' | 'dark' | 'auto';

type ThemeContextType = typeof theme & { setColor: (value: typeof theme) => void } & {
  setTheme: (value: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType>(null!);

export function useTheme() {
  return useContext(ThemeContext);
}

type ThemeProviderProps = {
  defaultTheme?: ColorScheme;
  children: React.ReactNode;
};
export function ThemeProvider({ defaultTheme = 'auto', children }: ThemeProviderProps) {
  const [initialTheme, setInitialTheme] = useState(theme);

  const colorSchemeListener = useRef<NativeEventSubscription>(null!);

  const setColor = (value: typeof theme) => {
    setInitialTheme(i => ({ ...i, ...value }));
  };

  const setTheme = (value: ColorScheme) => {
    if (value === 'auto') {
      const scheme = Appearance.getColorScheme() ?? 'dark';
      setInitialTheme(scheme === 'light' ? lightTheme : darkTheme);

      // add color scheme listener
      if (colorSchemeListener.current) colorSchemeListener.current.remove();
      colorSchemeListener.current = Appearance.addChangeListener(({ colorScheme }) => {
        setInitialTheme(colorScheme === 'light' ? lightTheme : darkTheme);
      });

      return;
    }

    setInitialTheme(value === 'light' ? lightTheme : darkTheme);
    // remove color scheme listener
    if (colorSchemeListener.current) colorSchemeListener.current.remove();
  };

  useEffect(() => {
    setTheme(defaultTheme);
  }, []);

  return (
    <>
      <StatusBar backgroundColor='transparent' barStyle={initialTheme.isDark ? 'light-content' : 'dark-content'} translucent />
      <ThemeContext.Provider value={{ ...initialTheme, setColor, setTheme }}>{children}</ThemeContext.Provider>
    </>
  );
}
