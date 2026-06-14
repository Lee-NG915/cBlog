'use client';
import React from 'react';
import { Stack } from '@castlery/fortress';
import { addImpressionFlag, createDataTrackingData } from '@castlery/utils';
import { usePathname } from 'next/navigation';

interface DtStackProps {
  children: React.ReactNode;
  uid: string;
  componentName: string;
  useImpression?: boolean;
  elementName?: string;
}
export function DtStack({
  children,
  uid,
  componentName,
  elementName,
  useImpression = false,
  ...restProps
}: DtStackProps) {
  const pathname = usePathname();

  const impressionProps = useImpression ? addImpressionFlag(uid) : {};
  const trackingProps = createDataTrackingData({
    pathname,
    module: componentName,
    elementName: elementName,
  });

  return (
    <Stack {...impressionProps} {...trackingProps} {...restProps}>
      {children}
    </Stack>
  );
}

export default DtStack;
