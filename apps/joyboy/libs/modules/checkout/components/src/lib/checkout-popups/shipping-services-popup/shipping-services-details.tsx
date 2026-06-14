'use client';

import {
  Stack,
  Box,
  Typography,
  Divider,
  Button,
  useBreakpoints,
  Checkbox,
  RadioGroup,
  RadioButton,
} from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useUpdateCheckoutShippingMethodMutation } from '@castlery/modules-checkout-domain';
import { useState } from 'react';
import { ShippingServiceInformation } from '@castlery/modules-checkout-components';
import { DeliveryServiceTypeEnum, DeliveryServiceItemSchema } from '@castlery/types';
import { toPrice } from '@castlery/utils';
import { accessInPos } from '@castlery/config';
// https://castlery.atlassian.net/wiki/spaces/PM/pages/3419111449/Shipping+Services?focusedCommentId=3448373475

export const ShippingServicesDetails = ({
  shippingServices,
  shipmentId,
  onSelected,
  waiveServiceFee,
  onCancel,
}: {
  shippingServices: Record<DeliveryServiceTypeEnum, DeliveryServiceItemSchema>;
  shipmentId: string;
  onSelected: () => void;
  waiveServiceFee: boolean;
  onCancel: () => void;
}) => {
  const { mobile, desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingServices',
  });

  const activeKey = () => {
    return list.find((key) => shippingServices[key]?.active);
  };

  const [updateCheckoutShippingMethod, { isLoading }] = useUpdateCheckoutShippingMethodMutation();
  const [waiveServiceFeeStatus, setWaiveServiceFeeStatus] = useState(waiveServiceFee); // 本地状态
  const list = (Object.keys(shippingServices) as DeliveryServiceTypeEnum[]) || [];
  const [actionService, setActionService] = useState<DeliveryServiceTypeEnum | null>(null);
  const [selectedRadioService, setSelectedRadioService] = useState<string | null>(activeKey() || null);
  const handleSelectService = async (serviceType: DeliveryServiceTypeEnum) => {
    const service = shippingServices[serviceType];
    if (service) {
      setActionService(serviceType);
      const res = await updateCheckoutShippingMethod({
        shipment: {
          id: shipmentId,
          waiveServiceFee: waiveServiceFeeStatus,
          deliveryService: {
            active: true,
            id: service.id,
            name: service.name,
            serviceType: serviceType,
          },
        },
      });
      if (!res.error) {
        onSelected();
      }
    }
  };

  return (
    <Stack sx={{ gap: mobile ? 4 : 6 }}>
      <Typography level="h3" textAlign="center">
        {t('title')}
      </Typography>
      <RadioGroup
        name="service-options"
        defaultValue={activeKey}
        onClick={(event) => {
          setSelectedRadioService((event.target as HTMLInputElement).value);
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: desktop ? 'row' : 'column',
            flexShrink: 0,
            gap: mobile ? 5 : 6,
            alignItems: 'stretch',
          }}
        >
          {list.map((key: DeliveryServiceTypeEnum, index: number) => {
            const serviceItem = shippingServices[key];
            const isSelected = serviceItem?.active;
            const originalUnitPrice = Number(serviceItem?.originalUnitPrice);
            const sellingUnitPrice = Number(serviceItem?.sellingUnitPrice);
            return (
              <>
                <Stack
                  direction={'column'}
                  sx={{ flex: 1, justifyContent: 'space-between', alignItems: 'space-between' }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography level="body1">{serviceItem?.name}</Typography>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Typography level="body1">{toPrice(sellingUnitPrice, true)}</Typography>
                      {sellingUnitPrice < originalUnitPrice && (
                        <Typography
                          level="body1"
                          sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.mono[500] }}
                        >
                          {toPrice(originalUnitPrice)}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <ShippingServiceInformation type={key} showServiceTag />
                  {!accessInPos ? (
                    <>
                      <Button
                        variant={isSelected ? 'solid' : 'outlined'}
                        color="neutral"
                        onClick={() => handleSelectService(key)}
                        loading={isLoading && actionService === key}
                        sx={{ mt: mobile ? 7 : 10 }}
                      >
                        {isSelected ? t('buttons.selected') : t('buttons.select')}
                      </Button>
                    </>
                  ) : (
                    <RadioButton label={isSelected ? t('buttons.selected') : t('buttons.select')} value={key} />
                  )}
                </Stack>

                {index < list.length - 1 && <Divider orientation={mobile ? 'horizontal' : 'vertical'} />}
              </>
            );
          })}
        </Box>
      </RadioGroup>

      {accessInPos && (
        <Box>
          <Box>
            <Checkbox
              label="Waive service fee"
              checked={waiveServiceFeeStatus}
              onChange={(e) => setWaiveServiceFeeStatus(e.target.checked)}
            />
          </Box>
          <Stack direction="row" gap={3} justifyContent="end">
            <Button sx={{ width: 210 }} variant="outlined" color="neutral" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              disabled={!selectedRadioService}
              sx={{ width: 210 }}
              loading={isLoading && actionService === selectedRadioService}
              onClick={() => {
                handleSelectService(selectedRadioService as DeliveryServiceTypeEnum);
              }}
            >
              Confirm
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default ShippingServicesDetails;
