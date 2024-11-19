import { MMKV } from "react-native-mmkv";

const mmkv = new MMKV();

const storage = {
  keys: {
    isGuest: "isGuest",
  },

  get isGuest() {
    return mmkv.getBoolean(this.keys.isGuest);
  },
  set isGuest(value: boolean | undefined) {
    typeof value === "undefined" ? mmkv.delete(this.keys.isGuest) : mmkv.set(this.keys.isGuest, value);
  },

  clearAll: () => mmkv.clearAll(),
  addEventListener: (onValueChanged: (key: string) => void) => {
    return mmkv.addOnValueChangedListener(key => {
      onValueChanged(key);
    });
  },
};

export default storage;
