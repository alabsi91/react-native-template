import * as React from "react";

import type { PortalMethods } from "./PortalHost";

type Props = {
  manager: PortalMethods;
  children: React.ReactNode;
};

export default class PortalConsumer extends React.Component<Props> {
  componentDidMount() {
    this.checkManager();
    this.key = this.props.manager.mount(this.props.children);
  }

  componentDidUpdate() {
    this.checkManager();
    this.props.manager.update(this.key, this.props.children);
  }

  componentWillUnmount() {
    this.checkManager();
    this.props.manager.unmount(this.key);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private key: any;

  private checkManager() {
    if (!this.props.manager)
      throw new Error("Looks like you forgot to wrap your root component with `Provider` component ");
  }

  render() {
    return null;
  }
}
