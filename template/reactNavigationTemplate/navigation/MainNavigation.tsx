import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StatusBar } from "react-native";
import { enableFreeze } from "react-native-screens";

import Home from "@screens/Home";
import { useTheme } from "@styles/Theme";

import type { RootStackParamList } from "@types";

enableFreeze(true);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNavigation() {
  const theme = useTheme();

  return (
    <>
      <StatusBar backgroundColor="transparent" barStyle={theme.isDark ? "light-content" : "dark-content"} translucent />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ header: () => null }}>
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
