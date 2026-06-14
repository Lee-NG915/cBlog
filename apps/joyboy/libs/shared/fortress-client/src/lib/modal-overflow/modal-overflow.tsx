'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const ModalOverflow = dynamic(() => import('@castlery/fortress').then((mod) => mod.ModalOverflow), {
  ssr: false,
}) as ComponentType<React.ComponentProps<typeof import('@castlery/fortress').ModalOverflow>>;

export const DynamicModalOverflow = ({ children, ...props }: React.ComponentProps<typeof ModalOverflow>) => {
  return <ModalOverflow {...props}>{children}</ModalOverflow>;
};

DynamicModalOverflow.displayName = 'ModalOverflow';
(DynamicModalOverflow as any).muiName = 'ModalOverflow';
