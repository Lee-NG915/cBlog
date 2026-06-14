import React, { ForwardedRef, forwardRef } from 'react';
import { Input } from 'fortress';
import { CalendarMonth } from 'fortress/Icons';

type Props = {
  name?: string;
  variant?: string;
  color?: string;
  value?: string;
  forceType?: string;
  placeholder?: string;
};

const CustomInput = forwardRef(
  ({ color, variant, placeholder, forceType, ...rest }: Props, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      //@ts-ignore
      <Input
        ref={ref}
        variant={variant}
        color={color}
        type={forceType || 'button'}
        placeholder={placeholder}
        name={`${rest?.name}_input`}
        {...rest}
        sx={{
          input: {
            textAlign: 'left',
            cursor: 'pointer',
          },
          'input::placeholder': {
            color: '#767676 !important',
            opacity: 1,
          },
        }}
        endDecorator={
          <CalendarMonth sx={{ color: variant === 'solid' ? 'white' : 'var(--fortress-palette-brand-charcoal-800)' }} />
        }
      />
    );
  }
);

export default React.memo(CustomInput);
