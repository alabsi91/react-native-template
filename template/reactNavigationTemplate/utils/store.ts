import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const store = {
  get isGuest() {
    return storage.getBoolean('isGuest');
  },
  set isGuest(value: boolean | undefined) {
    if (typeof value !== 'undefined') {
      storage.set('isGuest', value);
      return;
    }
    storage.delete('isGuest');
  },
};

export default store;
