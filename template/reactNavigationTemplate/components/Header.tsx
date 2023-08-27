import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@styles/Theme';
import ConditionalMount from './ConditionalMount';

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  onBackPress?: () => void;
};

const TOP_PADDING = 20;

export default function Header({ title = 'header', onBackPress, children }: HeaderProps) {
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: theme.header, paddingTop: top + TOP_PADDING }]}>
      <View style={styles.titleIconContainer}>
        <ConditionalMount mount={!!onBackPress}>
          <Pressable onPress={onBackPress}>
            <Svg viewBox='0 0 24 24' height='24px' width='24px' fill={theme.primary}>
              <Path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
            </Svg>
          </Pressable>
        </ConditionalMount>

        <Text style={styles.title} numberOfLines={1}>
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
    justifyContent: 'space-between',
    backgroundColor: '#1f1f26',
    paddingTop: (StatusBar.currentHeight || 25) + TOP_PADDING,
    paddingBottom: 20,
    paddingHorizontal: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 5,
  },
  titleIconContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#acc1d2',
    marginRight: 45,
  },
  childrenContainer: {
    flexDirection: 'row',
  },
});
