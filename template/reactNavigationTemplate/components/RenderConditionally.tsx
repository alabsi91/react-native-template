import React, { useState, useEffect } from 'react';

type Props = {
  if?: unknown;
  withDelay?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function RenderConditionally(props: Props) {
  const IF = 'if' in props ? Boolean(props.if) : true;

  const [isReady, setIsReady] = useState(props.withDelay ? false : IF);

  useEffect(() => {
    if (props.withDelay && IF) {
      setTimeout(() => setIsReady(true), props.withDelay);
      return;
    }

    if (isReady !== IF) setIsReady(IF);
  }, [IF]);

  if (!isReady) return <>{props.fallback}</>;

  return <>{props.children}</>;
}
