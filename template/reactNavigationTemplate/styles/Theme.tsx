import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';

import type { NativeEventSubscription } from 'react-native';

// ? use only HEX colors
const lightTheme = {
  isDark: false,

  primary: '#007bff',

  text: '#333',
  textMedium: '#555',
  textFaded: '#777',

  BorW: '#000',
  shadow: '#ddd',

  background: '#fff',
  header: '#f5f5f5',
  card: '#f0f0f0',
  icon: '#555',
};

const darkTheme: typeof lightTheme = {
  isDark: true,

  primary: '#9ed5ff',

  text: '#e0f2ff',
  textMedium: '#dbe0e6',
  textFaded: '#acc1d2',

  BorW: '#fff',
  shadow: '#222',

  background: '#1a191f',
  header: '#1f1f26',
  card: '#282d33',
  icon: '#acc1d2',
};

export const theme = Appearance.getColorScheme() === 'light' ? lightTheme : darkTheme;

type ColorScheme = 'light' | 'dark' | 'auto';

type ThemeContextType = typeof theme & { setTheme: (value: typeof theme) => void } & {
  setColorScheme: (value: ColorScheme) => void;
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

  const setTheme = (value: typeof theme) => {
    setInitialTheme(i => ({ ...i, ...value }));
  };

  const setColorScheme = (value: ColorScheme) => {
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
    setColorScheme(defaultTheme);
  }, []);

  return (
    <>
      <StatusBar backgroundColor='transparent' barStyle={initialTheme.isDark ? 'light-content' : 'dark-content'} translucent />
      <ThemeContext.Provider value={{ ...initialTheme, setTheme, setColorScheme }}>{children}</ThemeContext.Provider>
    </>
  );
}
