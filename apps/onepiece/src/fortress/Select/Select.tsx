import React, { useEffect, useRef } from 'react';
import MSelect, { SelectProps as MSelectProps, selectClasses } from '@mui/joy/Select';
import Option, { OptionProps as MOptionProps } from '@mui/joy/Option';
import { ExpandMore } from 'fortress/Icons';
import { SxProps } from '@mui/joy/styles/types';
import { FormControl, FormLabel } from '@mui/joy';

type SelectProps = MSelectProps<any, false>;
type OptionProps = MOptionProps;

const Select = React.forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const selectProps: SelectProps = {
    indicator: <ExpandMore />,
    ...props,
  };
  return <MSelect {...selectProps} ref={ref} />;
});

export { Select, SelectProps, Option, OptionProps };

export type DropdownProps = MSelectProps<any, false> & {
  sx?: SxProps;
  // variant?: '';
  // color?: '';
};

// TODO ref 和 use Select
// TODO outline blue
export const Dropdown = function Dropdown(props: DropdownProps) {
  const { sx, ...restProps } = props;
  const selectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      if (selectRef.current) {
        if (selectRef.current.children.length > 0) {
          Array.from(selectRef.current.children).forEach((child) => {
            if (child.tagName === 'INPUT') {
              child.setAttribute('aria-label', 'input');
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectRef]);
  return (
    <MSelect
      indicator={<ExpandMore />}
      variant="plain"
      color="neutral"
      ref={selectRef}
      {...restProps}
      sx={[
        {
          borderColor: (theme) => theme.palette.neutral[300],
          color: (theme) => theme.palette.neutral[500],
          bgcolor: 'transparent',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};

Dropdown.Option = Option;

export * from '@mui/joy/Select';
export * from '@mui/joy/Option';
