import React from "react";

import Confirm from "@components/Confirm";
import Portal from "@components/Portal/Portal";
import Toast from "@components/ToastMessage";
import { ThemeProvider } from "@styles/Theme";
import MainNavigation from "./navigation/MainNavigation";

export default function App() {
  return (
    <ThemeProvider>
      <Portal.Host>
        <MainNavigation />
      </Portal.Host>

      {/* Everything included here will be rendered on top of the app.  */}
      <Confirm.Provider />
      <Toast.Provider />
    </ThemeProvider>
  );
}
