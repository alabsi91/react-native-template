import * as React from "react";

import PortalConsumer from "./PortalConsumer";
import type { PortalMethods } from "./PortalHost";
import PortalHost, { PortalContext } from "./PortalHost";

export type Props = {
  children: React.ReactNode;
};

class Portal extends React.Component<Props> {
  static Host = PortalHost;

  render() {
    const { children } = this.props;

    return (
      <PortalContext.Consumer>
        {manager => <PortalConsumer manager={manager as PortalMethods}>{children}</PortalConsumer>}
      </PortalContext.Consumer>
    );
  }
}

export default Portal;
