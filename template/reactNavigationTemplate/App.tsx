import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ThemeProvider } from 'src/styles/Theme';
import Home from '@screens/Home';

import type { RootStackParamList } from '@types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home' screenOptions={{ header: () => null }}>
          <Stack.Screen name='Home' component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
