'use client';
import React, { useMemo } from 'react';
import { ButtonProps as MButtonProps } from '@mui/joy/Button';
import { styled } from '@mui/joy/styles';
import { Button } from '../Button';
import { useBreakpoints } from '../hooks';

export interface FabProps extends MButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'round' | 'square' | 'extended';
}

const FabRoot = styled(Button, {
  name: 'JoyFab',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => prop !== 'sx',
})<{ ownerState: { variant: string; size: string; color: string; shape: string } }>(({ ownerState }) => ({
  ...(ownerState.shape === 'round' && {
    borderRadius: '50%',
  }),
  ...(ownerState.shape === 'square' && {
    aspectRatio: '1 / 1',
  }),
}));

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(function Fab(props, ref) {
  const { variant = 'solid', size, color = 'primary', shape = 'extended' } = props;
  const { desktop, tablet } = useBreakpoints();

  // 计算响应式大小
  const responsiveSize = useMemo(() => {
    if (desktop) return 'lg';
    if (tablet) return 'md';
    return 'sm';
  }, [desktop, tablet]);

  // 使用传入的 size 或响应式大小
  const finalSize = size || responsiveSize;

  const ownerState = useMemo(() => ({ variant, size: finalSize, color, shape }), [variant, finalSize, color, shape]);

  return <FabRoot ref={ref} ownerState={ownerState} {...props} />;
});
