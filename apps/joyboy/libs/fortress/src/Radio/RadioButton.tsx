'use client';
import React, { useMemo } from 'react';
import Radio, { RadioProps as MuiRadioProps } from '@mui/joy/Radio';
import { styled, Theme, useThemeProps } from '@mui/joy/styles';
import { useBreakpoints } from '../hooks';

export type RadioButtonProps = MuiRadioProps;

const RadioButtonRoot = styled(Radio, {
  name: 'JoyRadioButton',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => prop !== 'sx',
})<{ ownerState: { size: string } }>(({ ownerState, theme }) => ({
  position: 'relative',
  transition: 'all 0.2s ease-in-out',

  // 隐藏默认的 radio 样式
  '& .MuiRadio-radio': {
    display: 'none',
  },
  '& .MuiRadio-icon': {
    display: 'none',
  },
}));

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'JoyRadioButton' });
  const { label, size: sizeProp, color: colorProp, variant: variantProp, overlay = true, ...other } = props;

  const { mobile } = useBreakpoints();

  const responsiveSize = mobile ? 'sm' : 'md';
  const size = inProps.size || responsiveSize;

  const color = inProps.color || colorProp;
  const variant = inProps.variant || variantProp;

  const ownerState = useMemo(
    () => ({ size, color, variant, label, overlay, ...other }),
    [size, color, variant, label, overlay, other]
  );

  return <RadioButtonRoot ref={ref} ownerState={ownerState} {...ownerState} {...other} />;
});
