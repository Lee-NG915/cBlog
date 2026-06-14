'use client';

import { Stack, Typography, Button, List, ListItem, QuantitySelector, Divider } from '@castlery/fortress';
import { useState, useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useUpdateCheckoutShippingMethodMutation } from '@castlery/modules-checkout-domain';
import { toPrice } from '@castlery/utils';
import { DisposalVariantItemSchema, DeliveryServiceTypeEnum, DeliveryServiceItemSchema } from '@castlery/types';

interface DisposalServiceDetailsProps {
  disposalService: DeliveryServiceItemSchema;
  shipmentId: string;
  onConfirm: (error?: string) => void;
}

export const DisposalServiceDetails = ({ shipmentId, disposalService, onConfirm }: DisposalServiceDetailsProps) => {
  const disposalProducts = useMemo(() => disposalService.disposalProducts || [], [disposalService]);

  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'disposalService',
  });
  const [updateCheckoutShippingMethod, { isLoading }] = useUpdateCheckoutShippingMethodMutation();
  const initialDisposals = () =>
    disposalProducts
      ?.map((disposal) => {
        return disposal.variants.map((variant) => ({ ...variant, dpCapability: 2 }));
      })
      .flat();

  const [selectedDisposals, setSelectedDisposals] = useState<DisposalVariantItemSchema[]>(initialDisposals);

  const capabilityDescription = useMemo(() => {
    return disposalProducts
      ?.map((disposal) => {
        return t('capabilityDescription', {
          capability: disposal.dpCapability,
          serviceProductName: disposal.productName,
        });
      })
      ?.join(' and ');
  }, [t, disposalProducts]);

  const handleVariantChange = (item: DisposalVariantItemSchema, quantity: number) => {
    setSelectedDisposals((disposals) => {
      const next = [...disposals];
      const idx = next.findIndex((disposal) => disposal.variantName === item.variantName);
      if (idx === -1) {
        next.push({ ...item, quantity });
      } else {
        next[idx] = { ...item, quantity };
      }
      return next;
    });
  };
  const handleConfirm = async () => {
    const selectedItems = disposalProducts?.map((disposal) => {
      const newVariants = disposal.variants.map((variant) => {
        const selected = selectedDisposals.find((item) => item.variantName === variant.variantName);
        return {
          ...variant,
          quantity: selected?.quantity || 0,
        };
      });
      return {
        ...disposal,
        variants: newVariants,
      };
    });
    const res = await updateCheckoutShippingMethod({
      shipment: {
        id: shipmentId,
        deliveryService: {
          active: true,
          serviceType: DeliveryServiceTypeEnum.DISPOSAL_SERVICE,
          id: disposalService.id,
          name: disposalService.name,
          disposalProducts: selectedItems,
        },
      },
    });
    if (res.error) {
      onConfirm(JSON.stringify(res.error));
    } else {
      onConfirm();
    }
  };

  const conditions = t('notes.conditions', { returnObjects: true }) || [];

  console.log('🚀 ~ selectedDisposals:', selectedDisposals, disposalProducts);

  return (
    <Stack spacing={6}>
      <Stack alignItems="center" spacing={2}>
        <Typography level="h3">{t('title')}</Typography>
        <Typography level="body2">
          {t('description', {
            capabilityDescription: capabilityDescription,
          })}
        </Typography>
      </Stack>

      {disposalProducts?.map((disposal) => (
        <Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 3 }}>
            <Typography level="subh2">
              {disposal.productName.toLocaleUpperCase()} X {disposal.dpCapability}
            </Typography>
            <Typography level="body2">
              {t('priceTip', { price: toPrice(Number(disposal.variants[0].sellingUnitPrice || 0)) })}
            </Typography>
          </Stack>
          <Divider orientation="horizontal" />
          <Stack sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', rowGap: 4, columnGap: 6 }}>
            {disposal.variants.map((variant) => {
              const idx = selectedDisposals.findIndex((item) => item.variantName === variant.variantName);
              return (
                <Stack key={variant.variantName} direction="row" alignItems="center" sx={{ py: 3, mt: 4 }}>
                  <Typography level="body2">{variant.variantName}</Typography>
                  <QuantitySelector
                    value={idx === -1 ? 0 : selectedDisposals[idx].quantity}
                    onChange={(value) => handleVariantChange(variant, value)}
                    min={0}
                    max={variant.dvCapability}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      ))}
      <Divider orientation="horizontal" />

      {/* Note */}
      <Stack sx={{ rowGap: 4 }}>
        <Stack>
          <Typography level="caption2">{t('notes.title')}</Typography>
          <List sx={{ gap: 0, py: 0 }}>
            {conditions.map((condition: string) => (
              <ListItem
                key={condition}
                sx={{
                  m: 0,
                  py: 0,
                  minHeight: 'auto',
                }}
              >
                <Typography level="caption2">{`•  ${condition}`}</Typography>
              </ListItem>
            ))}
          </List>
        </Stack>
        <Typography level="caption2">{t('notes.explanation')}</Typography>
        <Typography level="caption2">{t('notes.help')}</Typography>
      </Stack>
      {/* Confirm Button */}
      <Button variant="secondary" fullWidth loading={isLoading} onClick={handleConfirm}>
        {t('confirm')}
      </Button>
    </Stack>
  );
};

export default DisposalServiceDetails;
