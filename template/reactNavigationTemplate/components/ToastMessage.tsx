import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeOutDown, FadeOutUp, ZoomInDown, ZoomInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { fontFamily, useFontSize } from '@styles/Fonts';
import Log from '../utils/logger.js';
import RenderConditionally from './RenderConditionally';

type Props = {
  message?: string;
  type?: 'warning' | 'error' | 'success';
  position?: 'top' | 'bottom';
  duration?: number;
  offset?: number;
};

export type ToastMessageRefType = {
  show: (options?: { message?: string; type?: Props['type']; position?: Props['position']; offset?: number }) => void;
  hide: () => void;
};

// The "toastMessageRef" used to enable the invocation of toast message methods from any part of the code.
const toastMessageRef = React.createRef<ToastMessageRefType>();

const COLORS = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
};

const Icons = {
  success: (
    <Svg width='24' height='24' viewBox='0 0 24 24' fill='#fff'>
      <Path d='M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z' />
    </Svg>
  ),
  warning: (
    <Svg width='24' height='24' viewBox='0 0 24 24' fill='#fff'>
      <Path d='M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z' />
    </Svg>
  ),
  error: (
    <Svg width='24' height='24' viewBox='0 0 24 24' fill='#fff'>
      <Path d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z' />
    </Svg>
  ),
};

const OFFSET = 50;

const ToastMessage = forwardRef<ToastMessageRefType, Props>((props, ref) => {
  const fontSize = useFontSize();

  const duration = props.duration ?? 3000;

  const [options, setOptions] = useState({
    visible: false,
    message: props.message ?? '',
    type: props.type ?? 'success',
    offset: props.offset ?? OFFSET,
    position: props.position ?? 'bottom',
  });

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const show = ({
    message = props.message ?? '',
    type = props.type ?? 'success',
    offset = props.offset ?? OFFSET,
    position = props.position ?? 'bottom',
  } = {}) => {
    if (timeout.current) clearTimeout(timeout.current);

    setOptions({ visible: true, message, type, offset, position });

    timeout.current = setTimeout(hide, duration);
  };

  const hide = () => {
    setOptions(init => ({ ...init, visible: false }));
  };

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  return (
    <RenderConditionally if={options.visible}>
      <Animated.View
        style={[styles.container, { backgroundColor: COLORS[options.type], [options.position]: options.offset }]}
        entering={
          options.position === 'bottom'
            ? ZoomInDown.duration(600).easing(Easing.elastic(0.8))
            : ZoomInUp.duration(600).easing(Easing.elastic(0.8))
        }
        exiting={options.position === 'bottom' ? FadeOutDown.duration(200) : FadeOutUp.duration(200)}
      >
        <Text style={[styles.message, { fontSize: fontSize.normal }]}>{options.message}</Text>
        <View style={styles.icon}>{Icons[options.type]}</View>
      </Animated.View>
    </RenderConditionally>
  );
});

const Toast = {
  Provider: (props: Props) => <ToastMessage ref={toastMessageRef} {...props} />,

  show: (options => {
    if (toastMessageRef.current) return toastMessageRef.current.show(options);
    Alert.alert(options?.message ?? '');
    Log.warn('[Toast]: The Toast Component is not yet ready.');
  }) as ToastMessageRefType['show'],

  hide: () => {
    if (toastMessageRef.current) return toastMessageRef.current.hide();
    Log.warn('[Toast]: The Toast Component is not yet ready.');
  },
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 55,
    paddingVertical: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  message: {
    color: '#fff',
    textAlign: 'center',
    ...fontFamily.semiBold,
  },
  icon: {
    position: 'absolute',
    left: 20,
  },
});
