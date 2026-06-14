'use client';
import { Stack, Typography, RadioGroup, Radio, Box } from '@castlery/fortress';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectShippingPreference, useUpdateCheckoutShippingMethodMutation } from '@castlery/modules-checkout-domain';
import { accessInPos } from '@castlery/config';
import { ShippingPreferenceTypeEnum } from '@castlery/types';
import { selectPosOrderNumber } from '@castlery/modules-order-domain';

const radioGroupSx = {
  gap: { xs: 2, sm: 4 },
  flexDirection: { xs: 'column', sm: 'row' },
} as const;

const selectedBoxSx = {
  flex: 1,
  backgroundColor: (theme: any) => theme.palette.brand.warmLinen[500],
  border: (theme: any) => `1px solid ${theme.palette.neutral[500]}`,
  py: 3,
  pl: 2,
  pr: 8,
  borderRadius: '8px',
};

const unselectedBoxSx = {
  flex: 1,
  backgroundColor: (theme: any) => theme.palette.brand.warmLinen[200],
  border: (theme: any) => `1px solid ${theme.palette.brand.mono[300]}`,
  py: 3,
  pl: 2,
  pr: 8,
  borderRadius: '8px',
};

export const ShippingPreference = memo(function ShippingPreference() {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingPreference',
  });
  const shippingPreference = useAppSelector(selectShippingPreference);
  const hasBeenGeneratedOrder = useAppSelector(selectPosOrderNumber);
  // Memoize initial value to avoid recalculation on every render
  const selectedValue = useMemo(() => {
    return shippingPreference?.find((item) => item.active)?.shippingType;
  }, [shippingPreference]);

  // Optimistic value: set immediately on click.
  // Cleared when GET data comes back and aligns (success), or immediately on failure.
  const [optimisticValue, setOptimisticValue] = useState<ShippingPreferenceTypeEnum | undefined>(undefined);
  const displayValue = optimisticValue ?? selectedValue;

  // Once the GET data refreshes and selectedValue matches the optimistic value,
  // it's safe to clear — avoids the flicker caused by read/write separation.
  useEffect(() => {
    if (optimisticValue && selectedValue === optimisticValue) {
      setOptimisticValue(undefined);
    }
  }, [selectedValue, optimisticValue]);

  const [updateCheckoutShippingMethod] = useUpdateCheckoutShippingMethodMutation();

  // Memoize change handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value as ShippingPreferenceTypeEnum;
      setOptimisticValue(newValue);

      const result = await updateCheckoutShippingMethod({
        shippingType: {
          active: true,
          shippingType: newValue,
        },
      });

      // On failure: clear immediately so UI reverts to the original selectedValue.
      // On success: let the useEffect above handle cleanup once GET data arrives.
      if ('error' in result) {
        setOptimisticValue(undefined);
      }
    },
    [updateCheckoutShippingMethod]
  );

  // Helper function to get label text based on shipping type
  const getOptionLabel = useCallback(
    (shippingType: ShippingPreferenceTypeEnum, labelType: 'title' | 'description'): string => {
      const isFasterShipping = shippingType === ShippingPreferenceTypeEnum.SHIPPING_FASTER;
      const prefix = isFasterShipping ? 'options.asap' : 'options.together';
      // @ts-expect-error - Translation keys are dynamically constructed
      return String(t(`${prefix}.${labelType}`));
    },
    [t]
  );

  // Early return if no shipping preferences available
  if (!shippingPreference?.length || shippingPreference?.length <= 1 || hasBeenGeneratedOrder) {
    return null;
  }

  return (
    <Stack>
      {accessInPos ? (
        <Typography id="shipping-preference-title" level="h5" mb={2}>
          {t('posTitle')}
        </Typography>
      ) : (
        <>
          <Typography id="shipping-preference-title" level="h3" mb={2}>
            {t('title')}
          </Typography>
          <Typography
            id="shipping-preference-desc"
            level="body2"
            mb={4}
            sx={{ color: (theme) => theme.palette.brand.mono[700] }}
          >
            {t('description')}
          </Typography>
        </>
      )}
      <RadioGroup
        orientation="horizontal"
        defaultValue={displayValue}
        value={displayValue}
        onChange={handleChange}
        sx={radioGroupSx}
        name="shipping-preference"
        aria-labelledby="shipping-preference-title"
        aria-describedby="shipping-preference-desc"
      >
        {shippingPreference.map((item) => (
          <Box key={item.shippingType} sx={displayValue === item.shippingType ? selectedBoxSx : unselectedBoxSx}>
            <Radio
              value={item.shippingType}
              label={
                <Stack>
                  <Typography id={`shipping-preference-${item.shippingType}-title`} level="body1">
                    {getOptionLabel(item.shippingType, 'title')}
                  </Typography>
                  <Typography
                    id={`shipping-preference-${item.shippingType}-desc`}
                    level="caption2"
                    sx={{ color: (theme) => theme.palette.brand.mono[700] }}
                  >
                    {getOptionLabel(item.shippingType, 'description')}
                  </Typography>
                </Stack>
              }
              color="primary"
              checked={displayValue === item.shippingType}
              aria-describedby={`shipping-preference-${item.shippingType}-desc`}
              aria-labelledby={`shipping-preference-${item.shippingType}-title`}
            />
          </Box>
        ))}
      </RadioGroup>
    </Stack>
  );
});

export default ShippingPreference;
