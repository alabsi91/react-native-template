import React, { useState, useEffect } from 'react';

type Props = {
  mount?: boolean;
  mountDelay?: number;
  unmountDelay?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function ConditionalMount({ mount = true, mountDelay = 0, unmountDelay = 0, children, fallback = null }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mountDelay && mount) {
      setTimeout(() => setIsReady(true), mountDelay);
      return;
    }

    if (unmountDelay && !mount) {
      setTimeout(() => setIsReady(false), unmountDelay);
      return;
    }

    setIsReady(mount);
  }, [mount]);

  if (!isReady) return <>{fallback}</>;

  return <>{children}</>;
}
