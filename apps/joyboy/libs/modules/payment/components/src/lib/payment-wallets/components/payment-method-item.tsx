import { ReactNode } from 'react';
import { Box, Typography, Radio, Sheet, Stack } from '@castlery/fortress';
import { PaymentIcon } from '../../payment-Icon/payment-icon';
import { PaymentIconConfig } from '../types';

export interface PaymentMethodItemProps {
  methodKey: string;
  label: string;
  icons?: PaymentIconConfig[];
  isSelected: boolean;
  /**
   * When true, the row uses flex-start alignment to accommodate expanded form content.
   * Pass true when the Stripe card form is visible (selected) in any row of the list.
   */
  isExpandedLayout?: boolean;
  instructionText?: string;
  onClick?: () => void;
  /**
   * Slot for expanded content rendered below the label when this item is selected.
   * Injected by the container layer (e.g. StripePaymentElement).
   */
  children?: ReactNode;
}

export function PaymentMethodItem({
  methodKey,
  label,
  icons,
  isSelected,
  isExpandedLayout = false,
  instructionText,
  onClick,
  children,
}: PaymentMethodItemProps) {
  return (
    <Sheet
      component="label"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: isExpandedLayout ? 'flex-start' : 'center',
        color: (theme) => theme.palette.text.primary,
        gap: 1,
        p: 3,
        cursor: 'pointer',
        borderWidth: 1,
        borderStyle: 'solid',
        ...(isSelected
          ? {
              borderColor: (theme) => theme.palette.brand.mono[600],
              background: (theme) => theme.palette.brand.warmLinen[500],
            }
          : {
              borderColor: (theme) => theme.palette.brand.mono[300],
              background: (theme) => theme.palette.brand.warmLinen[200],
            }),
        transition: 'background-color 0.2s ease-in-out',
        '&:hover': {
          background: (theme) => theme.palette.brand.warmLinen[500],
          borderColor: (theme) => theme.palette.brand.mono[600],
        },
      }}
    >
      <Radio
        value={methodKey}
        onClick={onClick}
        sx={{
          p: 1,
          mt: isExpandedLayout ? 1 : 0,
        }}
      />

      <Stack sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="body1">{label}</Typography>
          {icons && icons.length > 0 && <PaymentIcon icons={icons} />}
        </Stack>

        {isSelected && instructionText && (
          <Typography level="caption2" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
            {instructionText}
          </Typography>
        )}

        {children}
      </Stack>
    </Sheet>
  );
}
