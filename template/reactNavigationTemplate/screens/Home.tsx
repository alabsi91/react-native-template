import React, { useRef } from 'react';
import { Animated, Easing, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@styles/Theme';

import type { HomeProps } from '@types';

export default function App({}: HomeProps) {
  const theme = useTheme();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  Animated.loop(
    Animated.timing(rotateAnim, {
      useNativeDriver: false,
      toValue: 360,
      duration: 5 * 1000,
      easing: Easing.linear,
    })
  ).start();

  const openLink = () => {
    Linking.openURL('https://reactnative.dev/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.Image
        style={[
          styles.logo,
          { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] },
        ]}
        resizeMode='center'
        tintColor={theme.primary}
        source={require('../../node_modules/react-native/Libraries/NewAppScreen/components/logo.png')}
      />
      <Text style={[styles.title, { color: theme.text }]}>React Native</Text>
      <Text style={[styles.tagLine, { color: theme.info }]}>Learn once, write anywhere.</Text>
      <Pressable style={[styles.getStartedButton, { backgroundColor: theme.button }]} onPress={openLink}>
        <Text style={[styles.getStartedTxt, { color: theme.text }]}>Get started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1e21',
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    color: '#61dafb',
    fontWeight: 'bold',
    fontSize: 24,
    marginVertical: 20,
  },
  tagLine: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 20,
  },
  getStartedButton: {
    padding: 20,
    paddingHorizontal: 40,
    marginVertical: 20,
    backgroundColor: '#61dafb',
  },
  getStartedTxt: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#282c34',
  },
});
