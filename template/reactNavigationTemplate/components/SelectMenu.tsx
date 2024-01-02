import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, FadeOutDown, ZoomInDown } from 'react-native-reanimated';

import radioCheckedIcon from '@assets/icons/radio_checked.png';
import radioUncheckedIcon from '@assets/icons/radio_unchecked.png';
import { fontFamily, useFontSize } from '@styles/Fonts';
import { useTheme } from '@styles/Theme';
import Portal from './Portal/Portal';
import RenderConditionally from './RenderConditionally';

type Props<T extends { label: string; value: unknown }> = {
  children?: React.FC<{ label: string }>;
  data: T[];
  defaultValue?: T['value'];
  disableRadioIconRendering?: boolean;
  onChange?: (value: T['value'], label: string) => void;
};

export default function SelectMenu<T extends { label: string; value: unknown }>({
  data,
  defaultValue,
  children,
  disableRadioIconRendering = false,
  onChange,
}: Props<T>) {
  const theme = useTheme();
  const fontSize = useFontSize();

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(defaultValue ?? data[0].value);

  const currentLabel = data.filter(e => e.value === selected)?.[0].label ?? data[0].label;

  /** Passed value should be unique */
  useEffect(() => {
    const valueSet = new Set();

    for (const obj of data) {
      const value = obj.value;

      // Value is not unique
      if (valueSet.has(value)) {
        console.error('SelectMenu: The values passed in the data should be unique.');
        return;
      }

      valueSet.add(value);
    }
  }, []);

  const hide = () => {
    setVisible(false);
  };

  const show = () => {
    setVisible(true);
  };

  const renderItem = ({ item }: { item: (typeof data)[number] }) => {
    const onPress = () => {
      hide();
      onChange?.(item.value, item.label);
      setSelected(item.value);
    };

    const isSelected = selected === item.value;

    return (
      <Pressable style={styles.menuItem} onPress={onPress} android_ripple={{ color: theme.primary }}>
        <Text style={{ color: theme.text, fontSize: fontSize.normal, ...fontFamily.regular }} numberOfLines={1}>
          {item.label}
        </Text>

        <RenderConditionally if={!disableRadioIconRendering}>
          {/* unchecked radio button */}
          <RenderConditionally if={!isSelected}>
            <Image source={radioUncheckedIcon} style={{ width: 24, height: 24 }} width={40} height={40} tintColor={theme.icon} />
          </RenderConditionally>

          {/* checked radio button */}
          <RenderConditionally if={isSelected}>
            <Image source={radioCheckedIcon} style={{ width: 24, height: 24 }} width={40} height={40} tintColor={theme.primary} />
          </RenderConditionally>
        </RenderConditionally>
      </Pressable>
    );
  };

  // prevent hardware back button default behavior
  useEffect(() => {
    if (!visible) return;

    const backAction = () => {
      hide();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [visible]);

  const OpenButton = children ?? OpenButtonDefault;

  return (
    <>
      <Pressable onPress={show}>
        <OpenButton label={currentLabel} />
      </Pressable>

      <RenderConditionally if={visible}>
        <Portal>
          {/* blurry background with fade animation*/}
          <Animated.View style={styles.bg} entering={FadeIn} exiting={FadeOut.duration(200)}>
            <BlurView style={{ flex: 1 }} blurType='dark' blurAmount={5} />
          </Animated.View>

          {/* press out side to close */}
          <Pressable onPress={hide} style={styles.bg} />

          {/* the wrapper to center the container in the middle */}
          <View style={styles.wrapper} pointerEvents='box-none'>
            <Animated.View
              style={[styles.menuContainer, { backgroundColor: theme.header, borderColor: theme.shadow }]}
              entering={ZoomInDown.easing(Easing.elastic(0.7))}
              exiting={FadeOutDown.duration(200)}
            >
              <FlatList data={data} renderItem={renderItem} ItemSeparatorComponent={Separator} />
            </Animated.View>
          </View>
        </Portal>
      </RenderConditionally>
    </>
  );
}

function Separator() {
  const { background } = useTheme();
  return <View style={{ height: 1, backgroundColor: background }} />;
}

function OpenButtonDefault({ label = '' }) {
  const theme = useTheme();
  const fontSize = useFontSize();

  return (
    <Text
      style={{
        color: theme.background,
        backgroundColor: theme.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: fontSize.normal,
        ...fontFamily.regular,
      }}
    >
      {label}
    </Text>
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
  wrapper: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
    maxHeight: '85%',
    minHeight: 55,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
