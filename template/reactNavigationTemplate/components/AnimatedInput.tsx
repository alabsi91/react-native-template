import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { fontFamily, useFontSize } from '@styles/Fonts';
import { useTheme } from '@styles/Theme';

import type {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  StyleProp,
  TextInputChangeEventData,
  TextStyle,
  ViewStyle,
} from 'react-native';

type Props = {
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
} & TextInput['props'];

export type AnimatedInputRef = {
  setText: (text: string) => void;
  blur: () => void;
};

const AnimatedInput = forwardRef<AnimatedInputRef, Props>(
  ({ placeholder, style, inputStyle, children, ...props }: Props, ref) => {
    const theme = useTheme();
    const fontSize = useFontSize();

    const isFirstRender = useRef(true);
    const inputRef = useRef<TextInput>(null!);
    const titleTopPos = useRef(0);

    const inputValue = useRef(props.value || props.defaultValue);

    const titlePos = useSharedValue(inputValue.current ? -13 : 0),
      titleScale = useSharedValue(inputValue.current ? 0.95 : 1),
      titleColor = useSharedValue(inputValue.current ? theme.text : theme.text),
      titleBackgroundOpacity = useSharedValue(inputValue.current ? 1 : 0),
      borderColor = useSharedValue(theme.text);

    const titleStyle = useAnimatedStyle(() => ({ color: titleColor.value, transform: [{ scale: titleScale.value }] })),
      titleContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: titlePos.value }] })),
      titleBackgroundStyle = useAnimatedStyle(() => ({ opacity: titleBackgroundOpacity.value })),
      borderStyle = useAnimatedStyle(() => ({ borderColor: borderColor.value }));

    const animateUp = () => {
      titlePos.value = withSpring(titleTopPos.current, { damping: 14 });
      titleColor.value = withTiming(theme.text, { duration: 600 });
      titleScale.value = withTiming(0.95);
      titleBackgroundOpacity.value = withTiming(1, { duration: 500 });
    };

    const animateDown = () => {
      titlePos.value = withSpring(0, { damping: 14 });
      titleColor.value = withTiming(theme.text);
      titleScale.value = withTiming(1);
      titleBackgroundOpacity.value = withTiming(0);
    };

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      titleColor.value = inputValue.current || inputRef.current.isFocused() ? theme.text : theme.text;
      inputRef.current.setNativeProps({ text: inputValue.current });
    }, [theme.isDark]);

    const onInputFocus = () => {
      borderColor.value = withTiming(theme.primary, { duration: 400 });
      animateUp();
    };

    const onInputBlur = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      props.onBlur?.(e);
      borderColor.value = withTiming(theme.text, { duration: 400 });
      if (inputValue.current) return;
      animateDown();
    };

    const onTextChange = (text: string) => {
      inputValue.current = text;
      props.onChangeText?.(text);
    };

    const setText = (text: string) => {
      inputValue.current = text;
      inputRef.current.setNativeProps({ text });

      if (text) {
        animateUp();
        return;
      }

      animateDown();
    };

    const onInputLayout = (event: LayoutChangeEvent) => {
      titleTopPos.current = -(event.nativeEvent.layout.height + 2) / 2;
      if (inputValue.current || inputRef.current.isFocused()) titlePos.value = withTiming(titleTopPos.current, { duration: 20 });
    };

    useImperativeHandle(ref, () => ({ setText, blur: () => inputRef.current.blur() }), []);

    return (
      <Animated.View style={[styles.container, borderStyle, { backgroundColor: theme.background }, style]}>
        <TextInput
          ref={inputRef}
          {...props}
          onLayout={onInputLayout}
          style={[styles.input, { color: theme.text, fontSize: fontSize.normal }, inputStyle]}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onChangeText={onTextChange}
          cursorColor={theme.primary}
          placeholder=''
        />
        <Animated.View style={[styles.titleContainer, titleContainerStyle]} pointerEvents='none'>
          <Animated.View style={[styles.line, titleBackgroundStyle, { backgroundColor: theme.background }]} />
          <Animated.Text style={[titleStyle, { fontSize: fontSize.normal, fontFamily: fontFamily.medium }]}>
            {placeholder}
          </Animated.Text>
        </Animated.View>
        {children}
      </Animated.View>
    );
  }
);

export default AnimatedInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 10,
  },
  titleContainer: {
    position: 'absolute',
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    width: '105%',
    height: '100%',
  },
  input: {
    fontFamily: fontFamily.medium,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
