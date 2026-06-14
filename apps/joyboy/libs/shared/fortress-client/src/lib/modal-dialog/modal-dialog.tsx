'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const ModalDialog = dynamic(() => import('@castlery/fortress').then((mod) => mod.ModalDialog), {
  ssr: false,
}) as ComponentType<React.ComponentProps<typeof import('@castlery/fortress').ModalDialog>>;

export const DynamicModalDialog = ({ children, ...props }: React.ComponentProps<typeof ModalDialog>) => {
  return <ModalDialog {...props}>{children}</ModalDialog>;
};

DynamicModalDialog.displayName = 'ModalDialog';
(DynamicModalDialog as any).muiName = 'ModalDialog';
