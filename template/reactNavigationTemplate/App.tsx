import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { enableFreeze } from 'react-native-screens';

import Confirm from '@components/Confirm';
import Portal from '@components/Portal/Portal';
import Toast from '@components/ToastMessage';
import Home from '@screens/Home';
import { ThemeProvider, useTheme } from '@styles/Theme';

import type { RootStackParamList } from '@types';

enableFreeze(true);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <Portal.Host>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Home' screenOptions={{ header: () => null }}>
            <Stack.Screen name='Home' component={Home} />
          </Stack.Navigator>
        </NavigationContainer>
      </Portal.Host>

      {/* Everything included here will be rendered on top of the app.  */}
      <Confirm.Provider />
      <Toast.Provider />
    </ThemeProvider>
  );
}

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar backgroundColor='transparent' barStyle={theme.isDark ? 'light-content' : 'dark-content'} translucent />;
}
