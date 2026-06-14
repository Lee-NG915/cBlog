'use client';

import dynamic from 'next/dynamic';
import type { DialogContentProps } from '@castlery/fortress';
import type { ComponentType } from 'react';

const DialogContent = dynamic(() => import('@castlery/fortress').then((mod) => mod.DialogContent), {
  ssr: false,
}) as ComponentType<DialogContentProps>;

export const DynamicDialogContent = ({ children, ...props }: DialogContentProps) => {
  return <DialogContent {...props}>{children}</DialogContent>;
};

DynamicDialogContent.displayName = 'DialogContent';
(DynamicDialogContent as any).muiName = 'DialogContent';
