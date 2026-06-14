'use client';
import { useMemo, useCallback, useState } from 'react';
import { Box, IconButton, Typography } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { getServiceDesc } from './helper';
import { useAsyncFn } from 'react-use';
import type { AvailableServiceProduct, SelectedServiceProduct } from '@castlery/types';

export interface DeliveryServicesProps {
  deliveryServices: AvailableServiceProduct[]; //available_service_products
  selectedServices: SelectedServiceProduct[];
  removeHandler: (type: 'disposal' | 'carry_up') => Promise<void>;
}

export function DeliveryServices({ deliveryServices, selectedServices, removeHandler }: DeliveryServicesProps) {
  const [activeType, setActiveType] = useState<string>('');
  const selectedList = useMemo(
    () =>
      selectedServices?.map((service) => {
        if (service.type === 'disposal') {
          return {
            ...service,
            name: (service.custom_attributes as { disposal_item_type: string }).disposal_item_type,
            size: (service.custom_attributes as { disposal_item_size: string }).disposal_item_size,
          };
        }
        if (service.type === 'carry_up') {
          return service;
        }
        return service;
      }) || [],
    [selectedServices]
  );
  const selectedServiceDesc = useCallback(
    (service: AvailableServiceProduct) => getServiceDesc(service, selectedList),
    [selectedList]
  );
  const showRemoveButton = (type: string) => selectedList.some((service) => service.type === type);

  const [removeState, handleRemove] = useAsyncFn(
    async (type: any) => {
      setActiveType(type);
      await removeHandler(type);
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    },
    [removeHandler]
  );
  if (!Array.isArray(deliveryServices) || deliveryServices?.length === 0) return null;
  return (
    <Box>
      {deliveryServices.map((service, index) => (
        <Box
          key={index}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '80px auto 24px', sm: '200px auto 24px' }, //'200px auto 24px'
            alignItems: 'flex-start',
            paddingY: 0.5,
            paddingX: { xs: 1, sm: 2 },
            columnGap: 1,
          }}
        >
          <Typography>{service.name}</Typography>
          <Typography>{selectedServiceDesc(service) || service.hint}</Typography>
          {showRemoveButton(service.type) && (
            <IconButton
              sx={{ width: 24, minWidth: 24, height: 24, minHeight: 24, p: 0 }}
              loading={removeState.loading && activeType === service.type}
              onClick={() => handleRemove(service.type)}
            >
              <Close sx={{ width: 24, height: 24 }} color="neutral" />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default DeliveryServices;
