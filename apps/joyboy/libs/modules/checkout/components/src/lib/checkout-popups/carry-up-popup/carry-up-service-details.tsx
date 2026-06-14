'use client';

import { Stack, Typography, Divider, Box, Button, QuantitySelector } from '@castlery/fortress';
import { useState } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { toPrice } from '@castlery/utils';
import { useUpdateCheckoutShippingMethodMutation } from '@castlery/modules-checkout-domain';
import { DeliveryServiceTypeEnum, DeliveryServiceItemSchema } from '@castlery/types';

interface CarryUpServiceDetailsProps {
  shipmentId: string;
  carryUpService: DeliveryServiceItemSchema;
  onConfirm: (error?: string) => void;
}

export const CarryUpServiceDetails = ({ shipmentId, carryUpService, onConfirm }: CarryUpServiceDetailsProps) => {
  const [numberOfStoreys, setNumberOfStoreys] = useState(0);
  const [numberOfItems, setNumberOfItems] = useState(0);
  const maxStoreys = 3;
  const maxItems = 20;
  const [updateCheckoutShippingMethod, { isLoading }] = useUpdateCheckoutShippingMethodMutation();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'carryUpService',
  });

  const handleConfirm = async () => {
    // TODO: 提交逻辑
    const res = await updateCheckoutShippingMethod({
      shipment: {
        id: shipmentId,
        deliveryService: {
          active: true,
          serviceType: DeliveryServiceTypeEnum.CARRY_UP_SERVICE,
          id: carryUpService.id,
          name: carryUpService.name,
          carryUp: {
            numberOfItems,
            numberOfStories: numberOfStoreys,
          },
        },
      },
    });
    if (res.error) {
      onConfirm(JSON.stringify(res.error));
    } else {
      onConfirm();
    }
  };

  if (!carryUpService || carryUpService?.serviceType !== DeliveryServiceTypeEnum.CARRY_UP_SERVICE) {
    return null;
  }

  const conditions = t('notes.conditions', { returnObjects: true }) || [];

  const overage = (carryUpService?.carryUp?.carryUpCapability || 0) - numberOfItems - numberOfStoreys;
  const dynamicMax = overage > 0 ? overage + 1 : 0;

  return (
    <Stack
      spacing={6}
      sx={{
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ pt: 4 }}>
        <Typography level="h3">{t('title')}</Typography>
        <Typography level="body2" sx={{ textAlign: 'center' }}>
          {t('description')}
        </Typography>
      </Stack>
      <Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3 }}>
          <Typography level="subh2">{carryUpService.name}</Typography>
          <Typography level="body2">
            {t('priceTip', { price: toPrice(Number(carryUpService?.sellingUnitPrice) || 0) })}
          </Typography>
        </Stack>
        <Divider orientation="horizontal" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, pt: 4, gap: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3 }}>
            <Typography level="body2">{t('numberOfStoreys')}</Typography>
            {/*  Storeys 最大值为3 , hard-code*/}
            <QuantitySelector
              min={0}
              max={dynamicMax > maxStoreys ? maxStoreys : dynamicMax}
              value={numberOfStoreys}
              onChange={(v) => setNumberOfStoreys(v ?? 0)}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3 }}>
            <Typography level="body2">{t('numberOfItems')}</Typography>
            <QuantitySelector
              min={0}
              max={dynamicMax > maxItems ? maxItems : dynamicMax}
              value={numberOfItems}
              onChange={(v) => setNumberOfItems(v ?? 0)}
            />
          </Stack>
        </Box>
      </Stack>

      <Divider orientation="horizontal" />
      <Stack spacing={2}>
        <Typography level="caption2">{t('notes.title')}</Typography>
        {conditions.map((condition: string, index: number) => (
          <Typography key={index} level="caption2">
            {condition}
          </Typography>
        ))}
      </Stack>
      <Button variant="secondary" fullWidth loading={isLoading} onClick={handleConfirm} sx={{ mt: 2 }}>
        {t('confirm')}
      </Button>
    </Stack>
  );
};

export default CarryUpServiceDetails;
