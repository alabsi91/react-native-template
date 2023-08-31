import React, { useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, useFontSize } from '@styles/Fonts';
import { useTheme } from '@styles/Theme';
import ConditionalMount from './ConditionalMount';
import Portal from './Portal/Portal';

import type { GestureResponderEvent, PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { EntryAnimationsValues } from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';

type Props<T extends { label: string; value: unknown; icon?: React.FC<SvgProps> | number }> = {
  children?: React.ReactNode;
  data: T[];
  selected?: T['value'];
  offsetX?: number;
  offsetY?: number;
  containerStyle?: StyleProp<ViewStyle>;
  openOnLongPress?: boolean;
  renderIcons?: boolean;
  width?: number;
  dividerColor?: string;

  onMenuButtonPress?: (e: GestureResponderEvent) => void;
  onMenuButtonLongPress?: (e: GestureResponderEvent) => void;
  onChange?: (value: T['value'], label: string) => void;
} & PressableProps;

const ITEM_HEIGHT = 50;
const PADDING = 0;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Menu<T extends { label: string; value: unknown; icon?: React.FC<SvgProps> | number }>({
  children,
  data,
  offsetX = 0,
  offsetY = 0,
  width = 116,
  openOnLongPress = false,
  renderIcons = false,
  containerStyle = {},
  selected,
  dividerColor,
  onChange,
  onMenuButtonLongPress,
  onMenuButtonPress,
  ...pressableProps
}: Props<T>) {
  const theme = useTheme();
  const fontSize = useFontSize();
  const { height: screenHeight } = useWindowDimensions();
  const { top: statusbarHeight, bottom: navbarHeight } = useSafeAreaInsets();

  const [visible, setVisible] = useState(false); // show select menu.
  const [pos, setPos] = useState<{ maxHeight: number | undefined; x: number; y: number }>({ maxHeight: undefined, x: 0, y: 0 });

  const MENU_HEIGHT = (ITEM_HEIGHT + 1) * data.length + PADDING;

  const renderItem = ({ item, index }: { item: (typeof data)[number]; index: number }) => {
    const onPress = () => {
      setVisible(false);
      onChange?.(item.value, item.label);
    };

    // eslint-disable-next-line react/no-unstable-nested-components
    const Icon = () => {
      // require
      if (typeof item.icon === 'number') {
        return <Image source={item.icon} style={{ width: 20, height: 20 }} width={24} height={24} tintColor={theme.icon} />;
      }

      // null
      if (!item.icon) return <View style={{ width: 20, height: 20 }} />;

      // svg
      const SvgIcon = item.icon;
      return <SvgIcon width={20} height={20} fill={theme.icon} />;
    };

    const separatorStyle =
      index !== data.length - 1 ? { borderBottomWidth: 1, borderBottomColor: dividerColor ?? theme.background } : {};

    return (
      <Pressable onPress={onPress} android_ripple={{ color: theme.primary }}>
        <Animated.View
          style={[
            styles.menuItem,
            separatorStyle,
            { backgroundColor: item.value === selected ? theme.primary + '20' : undefined },
          ]}
          entering={FadeInUp.delay((index + 1) * 10)}
        >
          <ConditionalMount mount={renderIcons}>
            <Icon />
          </ConditionalMount>

          <Text style={{ color: theme.text, fontSize: fontSize.normal, fontFamily: fontFamily.light }} numberOfLines={1}>
            {item.label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const close = () => {
    setVisible(false);
  };

  const show = (e: GestureResponderEvent) => {
    const pageX = e.nativeEvent.pageX - width;
    const pageY = e.nativeEvent.pageY;

    const isEnoughSpaceDownward = pageY + MENU_HEIGHT + offsetY < screenHeight - navbarHeight;
    const isEnoughSpaceUpward = pageY - MENU_HEIGHT - offsetY > statusbarHeight;
    const isEnoughSpaceLeft = e.nativeEvent.pageX - offsetX > width;

    const x = isEnoughSpaceLeft ? pageX - offsetX : pageX + offsetX + width;
    let y = isEnoughSpaceDownward ? pageY + offsetY : pageY - offsetY - MENU_HEIGHT,
      maxHeight: number | undefined;

    // not enough space for the menu upward or downward
    if (!isEnoughSpaceDownward && !isEnoughSpaceUpward) {
      // choose the longest part (upward or downward)
      const isDownwardLongest = pageY <= screenHeight / 2;

      if (isDownwardLongest) {
        y = pageY + offsetY;
        maxHeight = screenHeight - navbarHeight - pageY - offsetY;
      } else {
        // upward is the longest
        maxHeight = pageY - offsetY - statusbarHeight;
        y = pageY - offsetY - maxHeight;
      }
    }

    setVisible(true);
    setPos({ maxHeight, x, y });

    if (openOnLongPress) {
      onMenuButtonLongPress?.(e);
      return;
    }

    onMenuButtonPress?.(e);
  };

  // prevent hardware back button default behavior
  useEffect(() => {
    if (!visible) return;

    const backAction = () => {
      close();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [visible]);

  return (
    <>
      <AnimatedPressable
        onPress={openOnLongPress ? onMenuButtonPress : show}
        onLongPress={openOnLongPress ? show : onMenuButtonLongPress}
        {...pressableProps}
        delayLongPress={150}
      >
        {children}
      </AnimatedPressable>

      <ConditionalMount mount={visible}>
        <Portal>
          {/* press out side to close */}
          <Pressable onPress={close} style={styles.bg} />

          {/* the wrapper to center the container in the middle */}
          <View style={styles.bg} pointerEvents='box-none'>
            <Animated.View
              entering={CustomEnteringAnimation}
              exiting={FadeOutUp.duration(200)}
              style={[
                styles.menuContainer,
                { width, backgroundColor: theme.header, top: pos.y, left: pos.x, maxHeight: pos.maxHeight },
                containerStyle,
              ]}
            >
              <FlatList data={data} renderItem={renderItem} />
            </Animated.View>
          </View>
        </Portal>
      </ConditionalMount>
    </>
  );
}

function CustomEnteringAnimation(values: EntryAnimationsValues) {
  'worklet';

  // your animations
  const animations = {
    opacity: withTiming(1),
    height: withTiming(values.targetHeight),
  };

  // initial values for animations
  const initialValues = {
    opacity: 0,
    height: 0,
  };

  // optional callback that will fire when layout animation ends
  const callback = () => {};
  return {
    initialValues,
    animations,
    callback,
  };
}

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 10,
    paddingVertical: PADDING,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
    elevation: 1,
  },
  menuItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
});
