import { BlurView } from '@react-native-community/blur';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, FadeOutDown, ZoomInDown } from 'react-native-reanimated';

import CancelIcon from '@assets/svg/close.svg';
import DoneIcon from '@assets/svg/done.svg';
import { fontFamily, useFontSize } from '@styles/Fonts';
import { useTheme } from '@styles/Theme';
import Log from '../utils/logger.js';
import Button from './Button';
import RenderConditionally from './RenderConditionally';

import type { SvgProps } from 'react-native-svg';

type Props = {
  okButtonTitle?: string;
  okButtonIcon?: React.FC<SvgProps> | number;
  cancelButtonTitle?: string;
  cancelButtonIcon?: React.FC<SvgProps> | number;
};

export type ConfirmRefType = {
  show: (options: {
    message: string;
    confirmButtonTitle?: string;
    confirmButtonIcon?: React.FC<SvgProps> | number;
    closeButtonTitle?: string;
    closeButtonIcon?: React.FC<SvgProps> | number;
  }) => Promise<boolean>;
  close: () => void;
};

const confirmRef = React.createRef<ConfirmRefType>();

const ConfirmComponent = forwardRef<ConfirmRefType, Props>(
  ({ okButtonTitle = 'Ok', cancelButtonTitle = 'Cancel', okButtonIcon, cancelButtonIcon }, ref) => {
    const theme = useTheme();
    const fontSize = useFontSize();

    const [options, setOptions] = useState({
      visible: false,
      message: '',
      confirmButtonTitle: okButtonTitle,
      confirmButtonIcon: okButtonIcon,
      closeButtonTitle: cancelButtonTitle,
      closeButtonIcon: cancelButtonIcon,
    });

    const resolvePromise = useRef<(value: boolean) => void>(null!);

    const close = () => {
      setOptions(init => ({ ...init, visible: false }));
      resolvePromise.current(false);
    };

    const show = ({
      message = '',
      confirmButtonTitle = okButtonTitle,
      confirmButtonIcon = okButtonIcon,
      closeButtonTitle = cancelButtonTitle,
      closeButtonIcon = cancelButtonIcon,
    }) => {
      setOptions({ visible: true, message, confirmButtonTitle, closeButtonTitle, confirmButtonIcon, closeButtonIcon });
      return new Promise<boolean>(resolve => (resolvePromise.current = resolve));
    };

    const doneHandle = () => {
      resolvePromise.current(true);
      setOptions(init => ({ ...init, visible: false }));
    };

    // prevent hardware back button default behavior
    useEffect(() => {
      if (!options.visible) return;

      const backAction = () => {
        close();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => backHandler.remove();
    }, [options.visible]);

    useImperativeHandle(ref, () => ({ show, close }));

    return (
      <RenderConditionally if={options.visible}>
        {/* the background with fade animations */}
        <Animated.View style={styles.bg} entering={FadeIn} exiting={FadeOut.duration(200)}>
          <BlurView style={{ flex: 1 }} blurType={theme.isDark ? 'dark' : 'light'} blurAmount={5} />
        </Animated.View>

        {/* press out side to close */}
        <Pressable onPress={close} style={styles.bg} />

        <View style={styles.wrapper} pointerEvents='box-none'>
          <Animated.View
            style={[styles.container, { backgroundColor: theme.header, borderColor: theme.header + '10' }]}
            entering={ZoomInDown.easing(Easing.elastic(0.7))}
            exiting={FadeOutDown.duration(200)}
          >
            <Text style={[styles.msg, { color: theme.text, fontSize: fontSize.normal }]}>{options.message}</Text>
            <View style={styles.buttonsContainer}>
              <Button
                style={styles.buttons}
                onPress={doneHandle}
                title={options.confirmButtonTitle}
                icon={options.confirmButtonIcon ?? DoneIcon}
              />
              <Button
                style={styles.buttons}
                title={options.closeButtonTitle}
                onPress={close}
                icon={options.closeButtonIcon ?? CancelIcon}
              />
            </View>
          </Animated.View>
        </View>
      </RenderConditionally>
    );
  }
);

const Confirm = {
  Provider: (props: Props) => <ConfirmComponent ref={confirmRef} {...props} />,

  show: (options => {
    if (confirmRef.current) return confirmRef.current.show(options);
    Log.warn('[Confirm]: The Confirm Component is not yet ready.');
  }) as ConfirmRefType['show'],

  hide: () => {
    if (confirmRef.current) return confirmRef.current.close();
    Log.warn('[Confirm]: The Confirm Component is not yet ready.');
  },
};

export default Confirm;

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
    position: 'absolute',
    marginTop: 50,
    height: '100%',
    width: '100%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  container: {
    width: '85%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#282831',
    padding: 20,
    backgroundColor: '#1f1f26',
  },
  msg: {
    ...fontFamily.regular,
    lineHeight: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginTop: 30,
  },
  buttons: {
    flex: 1,
  },
});
