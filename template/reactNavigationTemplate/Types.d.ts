import type { ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  declare module '*.png' {
    const value: ImageSourcePropType;
    export default value;
  }
}

// Screens and Their Parameters
export type RootStackParamList = {
  Home: undefined;
};

// Each screen's prop type
export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
