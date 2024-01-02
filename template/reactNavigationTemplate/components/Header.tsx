import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fontFamily, useFontSize } from '@styles/Fonts';
import { useTheme } from '@styles/Theme';
import RenderConditionally from './RenderConditionally';

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  onBackPress?: () => void;
};

const TOP_PADDING = 20;

export default function Header({ title = 'header', onBackPress, children }: HeaderProps) {
  const theme = useTheme();
  const fontSize = useFontSize();

  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: theme.header, paddingTop: top + TOP_PADDING }]}>
      <View style={styles.titleIconContainer}>
        <RenderConditionally if={onBackPress}>
          <Pressable onPress={onBackPress}>
            <Svg viewBox='0 0 24 24' height='24px' width='24px' fill={theme.primary}>
              <Path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
            </Svg>
          </Pressable>
        </RenderConditionally>

        <Text style={[styles.title, { color: theme.text, fontSize: fontSize.medium }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: (StatusBar.currentHeight || 25) + TOP_PADDING,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titleIconContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    ...fontFamily.bold,
    marginRight: 45,
  },
  childrenContainer: {
    flexDirection: 'row',
    gap: 16,
  },
});
