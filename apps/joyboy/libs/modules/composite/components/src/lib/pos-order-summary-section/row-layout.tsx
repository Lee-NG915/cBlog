'use client';
import { Stack } from '@castlery/fortress';
import React from 'react';

export interface RowLayoutProps {
  children?: React.ReactNode;
  handler?: () => void; // 添加handler属性
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sx?: Record<string, any>;
}
export const RowLayout = ({ children, handler, sx = {} }: RowLayoutProps) => {
  const _handler = React.useCallback(() => {
    if (typeof handler === 'function') {
      handler();
    }
    return false;
  }, [handler]);
  return (
    <Stack
      sx={{
        px: 4,
        py: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: typeof handler === 'function' ? 'pointer' : 'static',
        gap: 1,
        ...sx,
      }}
      onClick={_handler}
    >
      {children}
    </Stack>
  );
};
