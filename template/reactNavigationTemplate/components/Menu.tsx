import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  I18nManager,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RenderConditionally from './RenderConditionally';
import Portal from './Portal/Portal';
import { useTheme } from '@theme';
import { fontFamily, useFontSize } from '@fonts';

import type { GestureResponderEvent, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { EntryAnimationsValues, ExitAnimationsValues } from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';

const isRTL = I18nManager.isRTL;

type Props<T extends { label: string; value: unknown; icon?: React.FC<SvgProps> | number }> = {
  children?: React.ReactNode;
  data: T[];
  selected?: T['value'];
  offsetX?: number;
  offsetY?: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  openOnLongPress?: boolean;
  renderIcons?: boolean;
  preferUpward?: boolean;
  preferRightward?: boolean;
  dividerColor?: string;
  disable?: boolean;

  onMenuButtonPress?: (e: GestureResponderEvent) => void;
  onMenuButtonLongPress?: (e: GestureResponderEvent) => void;
  onChange?: (value: T['value'], label: string) => void;
} & PressableProps;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type POS = {
  pageX: number;
  pageY: number;
  maxHeight: number;
  visible: boolean;
};

export default function Menu<T extends { label: string; value: unknown; icon?: React.FC<SvgProps> | number }>({
  children,
  data,
  offsetX = 0,
  offsetY = 0,
  openOnLongPress = false,
  renderIcons = false,
  containerStyle = {},
  textStyle = {},
  dividerColor,
  iconSize = 20,
  selected,
  disable,
  preferRightward,
  preferUpward,
  onChange,
  onMenuButtonLongPress,
  onMenuButtonPress,
  ...pressableProps
}: Props<T>) {
  const theme = useTheme();
  const fontSize = useFontSize().compact;

  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { top: statusbarHeight, bottom: navbarHeight } = useSafeAreaInsets();

  const [options, setOptions] = useState<POS>({ pageX: 0, pageY: 0, visible: false, maxHeight: screenHeight });

  const currentScreenOrientation = useRef<'PORTRAIT' | 'LANDSCAPE'>(screenWidth < screenHeight ? 'PORTRAIT' : 'LANDSCAPE');

  const renderItem = ({ item, index }: { item: (typeof data)[number]; index: number }) => {
    const onPress = () => {
      setOptions(pre => ({ ...pre, visible: false }));
      onChange?.(item.value, item.label);
    };

    const Icon = () => {
      // require
      if (typeof item.icon === 'number') {
        return (
          <Image source={item.icon} style={{ width: iconSize, height: iconSize }} width={24} height={24} tintColor={theme.icon} />
        );
      }

      // null
      if (!item.icon) return <View style={{ width: iconSize, height: iconSize }} />;

      // svg
      const SvgIcon = item.icon;
      return <SvgIcon width={iconSize} height={iconSize} fill={theme.icon} />;
    };

    const dividerStyle =
      index !== data.length - 1 ? { borderBottomWidth: 1, borderBottomColor: dividerColor ?? theme.background + '80' } : {};

    return (
      <Pressable onPress={onPress} android_ripple={{ color: theme.primary }}>
        <Animated.View
          style={[styles.menuItem, dividerStyle, { backgroundColor: item.value === selected ? theme.primary + '20' : undefined }]}
          entering={preferUpward ? FadeInDown.delay(6 * data.length - (index + 1) * 6) : FadeInUp.delay((index + 1) * 6)}
        >
          <RenderConditionally if={renderIcons}>
            <Icon />
          </RenderConditionally>

          <Text
            style={[{ color: theme.text, fontSize, ...fontFamily.bold, textAlign: 'center' }, textStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item.label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const calculatePos = (pageX: number, pageY: number, width: number, height: number) => {
    'worklet';
    const isEnoughSpaceDownward = pageY + height + offsetY < screenHeight - navbarHeight;
    const isEnoughSpaceUpward = pageY - height - offsetY > statusbarHeight;

    let x: number;
    let isRightward: boolean;
    if (preferRightward) {
      const isEnoughSpaceRightward = pageX < screenWidth - (offsetX + width);
      x = isEnoughSpaceRightward ? pageX + offsetX : pageX - offsetX - width;
      isRightward = isEnoughSpaceRightward;
    } else {
      const isEnoughSpaceLeftward = pageX > offsetX + width;
      x = isEnoughSpaceLeftward ? pageX - offsetX - width : pageX + offsetX;
      isRightward = !isEnoughSpaceLeftward;
    }
    x = isRTL ? x - screenWidth + width : x;

    let y: number;
    let isUpward: boolean;
    if (preferUpward) {
      y = isEnoughSpaceUpward ? pageY - offsetY - height : pageY + offsetY;
      isUpward = isEnoughSpaceUpward;
    } else {
      y = isEnoughSpaceDownward ? pageY + offsetY : pageY - offsetY - height;
      isUpward = !isEnoughSpaceDownward;
    }

    // Not enough space for the menu upward or downward
    if (!isEnoughSpaceDownward && !isEnoughSpaceUpward) {
      // Choose the longest part (upward or downward)
      const isDownwardLongest = pageY <= screenHeight / 2;

      if (isDownwardLongest) {
        y = pageY + offsetY;
        isUpward = false;
      } else {
        // Upward is the longest
        y = pageY - offsetY - options.maxHeight;
        isUpward = true;
      }
    }

    return { x, y, isUpward, isRightward };
  };

  const close = () => {
    setOptions(pre => ({ ...pre, visible: false }));
  };

  const show = (e: GestureResponderEvent) => {
    if (disable) return;

    const pageX = e.nativeEvent.pageX;
    const pageY = e.nativeEvent.pageY;

    // Choose the longest part (upward or downward)
    const isDownwardLongest = pageY <= screenHeight / 2;
    const maxHeight = isDownwardLongest ? screenHeight - navbarHeight - pageY - offsetY : pageY - offsetY - statusbarHeight;

    setOptions({ pageX, pageY, maxHeight, visible: true });

    currentScreenOrientation.current = screenWidth < screenHeight ? 'PORTRAIT' : 'LANDSCAPE';

    if (openOnLongPress) {
      onMenuButtonLongPress?.(e);
      return;
    }

    onMenuButtonPress?.(e);
  };

  useEffect(() => {
    if (!options.visible) return;

    // close the menu when screen orientation change
    const unsubscribe = Dimensions.addEventListener('change', ({ screen: { width, height } }) => {
      const orientation: 'PORTRAIT' | 'LANDSCAPE' = width < height ? 'PORTRAIT' : 'LANDSCAPE';
      if (currentScreenOrientation.current !== orientation) {
        close();
        currentScreenOrientation.current = orientation;
      }
    });

    // Remap the hardware back button's default behavior to close the menu.
    const backAction = () => {
      close();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      unsubscribe.remove();
    };
  }, [options.visible]);

  const EnteringAnimation = (values: EntryAnimationsValues) => {
    'worklet';
    const { x, y, isUpward, isRightward } = calculatePos(options.pageX, options.pageY, values.targetWidth, values.targetHeight);

    const initialValues = {
      opacity: 0,
      height: 0,
      width: 0,
      transform: [
        { translateX: isRightward ? x : x + values.targetWidth },
        { translateY: isUpward ? y + values.targetHeight : y },
      ],
    };

    const animations = {
      opacity: withTiming(1),
      height: withTiming(values.targetHeight, { easing: Easing.out(Easing.cubic) }),
      width: withTiming(values.targetWidth, { easing: Easing.out(Easing.cubic) }),
      transform: [
        { translateX: withTiming(x, { easing: Easing.out(Easing.cubic) }) },
        { translateY: withTiming(y, { easing: Easing.out(Easing.cubic) }) },
      ],
    };

    return {
      initialValues,
      animations,
    };
  };

  const ExitingAnimation = (values: ExitAnimationsValues) => {
    'worklet';
    const { x, y, isUpward } = calculatePos(options.pageX, options.pageY, values.currentWidth, values.currentHeight);

    const initialValues = {
      opacity: 1,
      height: 0,
      width: 0,
      transform: [{ translateX: x }, { translateY: y }],
    };

    const animations = {
      opacity: withTiming(0, { duration: 200 }),
      transform: [
        { translateX: x },
        { translateY: withTiming(isUpward ? y + 20 : y - 20, { easing: Easing.out(Easing.cubic) }) },
      ],
    };

    return {
      initialValues,
      animations,
    };
  };

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

      <RenderConditionally if={options.visible && !disable}>
        <Portal>
          {/* press out side to close */}
          <Pressable onPress={close} style={styles.bg} />

          {/* the wrapper to center the container in the middle */}
          <View style={styles.bg} pointerEvents='box-none'>
            <Animated.View
              entering={EnteringAnimation}
              exiting={ExitingAnimation}
              style={[
                styles.menuContainer,
                { backgroundColor: theme.background_gray, maxHeight: options.maxHeight },
                containerStyle,
              ]}
            >
              <FlatList data={data} renderItem={renderItem} />
            </Animated.View>
          </View>
        </Portal>
      </RenderConditionally>
    </>
  );
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
    borderWidth: 1,
    borderColor: '#6662',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
