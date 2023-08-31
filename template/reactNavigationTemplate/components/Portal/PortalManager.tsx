import * as React from 'react';
import { View, StyleSheet } from 'react-native';

type State = {
  portals: { key: number; children: React.ReactNode }[];
};

/** Portal host is the component which actually renders all Portals.*/
export default class PortalManager extends React.PureComponent<object, State> {
  state: State = { portals: [] };

  mount = (key: number, children: React.ReactNode) => {
    this.setState(state => ({ portals: [...state.portals, { key, children }] }));
  };

  update = (key: number, children: React.ReactNode) => {
    this.setState(state => ({ portals: state.portals.map(item => (item.key === key ? { ...item, children } : item)) }));
  };

  unmount = (key: number) => {
    this.setState(state => ({ portals: state.portals.filter(item => item.key !== key) }));
  };

  render() {
    return this.state.portals.map(({ key, children }) => (
      <View key={key} collapsable={false} pointerEvents='box-none' style={StyleSheet.absoluteFill}>
        {children}
      </View>
    ));
  }
}
