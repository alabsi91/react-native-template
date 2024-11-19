import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { fontFamily, useFontSize } from "@styles/Fonts";
import { useTheme } from "@styles/Theme";
import RenderConditionally from "./RenderConditionally";

import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";

type Props = {
  title?: string;
  onPress?: ((event: GestureResponderEvent) => void) | null;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  icon?: React.FC<SvgProps> | number;
};

export default function Button({ title, onPress, style, disabled, icon }: Props) {
  const theme = useTheme();
  const fontSize = useFontSize();

  // eslint-disable-next-line react/no-unstable-nested-components
  const Icon = () => {
    // require
    if (typeof icon === "number") {
      return (
        <Image
          style={[styles.icon, { width: 20, height: 20 }]}
          source={icon}
          width={24}
          height={24}
          tintColor={theme.header}
        />
      );
    }

    // null
    if (!icon) return <View style={{ width: 20, height: 20 }} />;

    // svg component
    const SvgIcon = icon;
    return <SvgIcon style={styles.icon} width={20} height={20} fill={theme.header} />;
  };

  return (
    <View style={[styles.button, { backgroundColor: theme.primary }, style]}>
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: theme.primary + "50" }}
      >
        <RenderConditionally if={icon}>
          <Icon />
        </RenderConditionally>

        <RenderConditionally if={title}>
          <Text
            style={[
              styles.text,
              { color: theme.background, paddingHorizontal: icon ? 20 : 0, fontSize: fontSize.normal },
            ]}
          >
            {title}
          </Text>
        </RenderConditionally>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",

    shadowColor: "#191919",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
    elevation: 1,
  },
  pressable: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  text: {
    ...fontFamily.regular,
    flexGrow: 1,
    fontSize: 16,
    textAlign: "center",
  },
  icon: {
    position: "absolute",
    left: 10,
  },
});
