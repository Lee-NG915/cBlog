'use client';

import dynamic from 'next/dynamic';
import type { DialogTitleProps } from '@castlery/fortress';
import type { ComponentType } from 'react';

const DialogTitle = dynamic(() => import('@castlery/fortress').then((mod) => mod.DialogTitle), {
  ssr: false,
}) as ComponentType<DialogTitleProps>;

export const DynamicDialogTitle = ({ children, ...props }: DialogTitleProps) => {
  return <DialogTitle {...props}>{children}</DialogTitle>;
};

DynamicDialogTitle.displayName = 'DialogTitle';
(DynamicDialogTitle as any).muiName = 'DialogTitle';
