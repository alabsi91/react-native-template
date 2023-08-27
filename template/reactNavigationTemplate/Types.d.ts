import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type React from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { SvgProps } from 'react-native-svg';

declare global {
  declare module '*.png' {
    const value: ImageSourcePropType;
    export default value;
  }
  declare module '*.svg' {
    const content: React.FC<SvgProps>;
    export default content;
  }
}

// Screens and Their Parameters
export type RootStackParamList = {
  Home: undefined;
};

// Each screen's prop type
export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
