import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';

import Home from '@screens/Home';
import { ThemeProvider } from './Theme';

import type { RootStackParamList } from '@types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar backgroundColor='#1f1f26' barStyle='light-content' translucent />
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Home' screenOptions={{ header: () => null }}>
            <Stack.Screen name='Home' component={Home} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </>
  );
}
