'use client';

import * as React from 'react';
import JoyCard, { type CardProps as JoyCardProps } from '@mui/joy/Card';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type CardProps<T extends React.ElementType = 'div'> = Omit<JoyCardProps<T>, 'sx'> & {
  sx?: FortressSx;
};

const Card = React.forwardRef(function FortressCard<T extends React.ElementType = 'div'>(
  props: CardProps<T>,
  ref: React.ForwardedRef<Element>
) {
  const { sx, ...rest } = props;
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

  return <JoyCard ref={ref as any} {...(rest as JoyCardProps<T>)} sx={normalizedSx} />;
}) as typeof JoyCard;

export { default as CardActions } from '@mui/joy/CardActions';
export * from '@mui/joy/CardActions';

export { default as CardContent } from '@mui/joy/CardContent';
export * from '@mui/joy/CardContent';

export { default as CardCover } from '@mui/joy/CardCover';
export * from '@mui/joy/CardCover';

export { default as CardOverflow } from '@mui/joy/CardOverflow';
export * from '@mui/joy/CardOverflow';

export * from '@mui/joy/Card';
export default Card;
