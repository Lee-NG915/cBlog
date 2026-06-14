'use client';
import { Stack, Typography, Card, Radio } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { selectCheckoutAddress } from '@castlery/modules-composite-services';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { changeDeliveryOptionCommand } from '@castlery/modules-checkout-services';

export interface ShippingPreferenceProps {
  deliveryOption: {
    can_merge: boolean;
    can_split: boolean;
  } | null;
}
export function ShippingPreference({ deliveryOption }: ShippingPreferenceProps) {
  const { shippingAddress } = useAppSelector(selectCheckoutAddress);
  const dispatch = useAppDispatch();
  const [selectedValue, setSelectedValue] = useState('split');

  const canShow = useMemo(
    () => !shippingAddress || deliveryOption?.can_split || deliveryOption?.can_merge,
    [shippingAddress, deliveryOption]
  );
  const radioChange = useCallback(
    async (value: string) => {
      setSelectedValue(value);
      const mode = value === 'split' ? 'lead_time' : 'all_together';
      await dispatch(changeDeliveryOptionCommand(mode));
    },
    [setSelectedValue, dispatch]
  );
  useEffect(() => {
    const str = deliveryOption?.can_split ? 'merge' : deliveryOption?.can_merge ? 'split' : '';
    setSelectedValue(str);
  }, [setSelectedValue, deliveryOption]);

  if (!canShow) return null;

  return (
    <Stack>
      <Typography level="subh2">Shipping Preference</Typography>
      {!shippingAddress && (
        <Card>
          <Typography textAlign={'center'} color="warning">
            Please Add Your Shipping Address First!
          </Typography>
        </Card>
      )}
      {(deliveryOption?.can_merge || deliveryOption?.can_split) && (
        <Stack sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' }, gap: 2, mt: 1 }}>
          <Typography
            sx={{
              p: 2,
              justifyContent: 'space-between',
              background: (theme) => (selectedValue === 'split' ? theme.palette.brand.terracotta[500] : 'transparent'),
              color: (theme) => (selectedValue === 'split' ? theme.palette.common.white : theme.palette.text.primary),
              border: (theme) =>
                selectedValue === 'split'
                  ? `1px solid ${theme.palette.brand.terracotta[500]}`
                  : `1px solid ${theme.palette.brand.wheat[500]}`,
              cursor: 'pointer',
            }}
            onClick={() => radioChange('split')}
            endDecorator={<Radio checked={selectedValue === 'split'} />}
          >
            Split shipment
          </Typography>

          <Typography
            sx={{
              p: 2,
              justifyContent: 'space-between',
              background: (theme) => (selectedValue === 'merge' ? theme.palette.brand.terracotta[500] : 'transparent'),
              color: (theme) => (selectedValue === 'merge' ? theme.palette.common.white : theme.palette.text.primary),
              border: (theme) =>
                selectedValue === 'merge'
                  ? `1px solid ${theme.palette.brand.terracotta[500]}`
                  : `1px solid ${theme.palette.brand.wheat[500]}`,
              cursor: 'pointer',
            }}
            onClick={() => radioChange('merge')}
            endDecorator={<Radio checked={selectedValue === 'merge'} />}
          >
            Combine shipment
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

export default ShippingPreference;
