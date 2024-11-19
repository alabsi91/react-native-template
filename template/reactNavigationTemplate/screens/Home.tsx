import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import WebIcon from "@assets/svg/web.svg";
import MoreIcon from "@assets/svg/more.svg";
import AnimatedInput from "@components/AnimatedInput";
import Button from "@components/Button";
import Confirm from "@components/Confirm";
import Header from "@components/Header";
import Menu from "@components/Menu";
import SelectMenu from "@components/SelectMenu";
import Toast from "@components/ToastMessage";
import { fontFamily, useFontSize } from "@styles/Fonts";
import { useTheme } from "@styles/Theme";

import type { HomeProps } from "@types";

export default function Home({}: HomeProps) {
  const theme = useTheme();
  const fontSize = useFontSize();

  const openLink = () => {
    Linking.openURL("https://reactnative.dev/");
  };

  const toast = () => {
    Toast.show({ message: "Hello World", type: "success" });
  };

  const confirm = () => {
    Confirm.show({ message: "Are you sure ?", confirmButtonTitle: "Yes", closeButtonTitle: "No" });
  };

  return (
    <>
      <Header title="This is a header" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, backgroundColor: theme.background }}>
        <View style={styles.container}>
          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>Animated Input</Text>
          <AnimatedInput placeholder="place holder" />

          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>3 Dots Menu</Text>
          <Menu
            style={{ alignSelf: "center" }}
            data={[
              { label: "Delete", value: "none" },
              { label: "Remove", value: "none" },
              { label: "Add", value: "none" },
              { label: "Sort", value: "none" },
              { label: "Filter", value: "none" },
              { label: "Undo", value: "none" },
              { label: "Redo", value: "none" },
              { label: "Click", value: "none" },
            ]}
          >
            <MoreIcon width={24} height={24} fill={theme.primary} />
          </Menu>

          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>Select Menu</Text>

          <SelectMenu
            data={[
              { label: "Item 1", value: "1" },
              { label: "Item 2", value: 2 },
              { label: "Item 3", value: 3 },
            ]}
            defaultValue={2}
          />

          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>A Button with Icon</Text>
          <Button onPress={openLink} title="Get started" icon={WebIcon} />

          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>Toast Message</Text>
          <Button onPress={toast} title="Show Toast" />

          <Text style={[styles.tagLine, { color: theme.text, fontSize: fontSize.medium }]}>Confirm PopUp</Text>
          <Button onPress={confirm} title="Show Confirm PupUp" />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  tagLine: {
    ...fontFamily.regular,
    marginTop: 30,
    marginBottom: 10,
  },
});
