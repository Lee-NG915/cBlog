'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Drawer, Stack, Backdrop, ModalClose, Typography, Divider } from '@castlery/fortress';
import ServiceListItem from './service-item';
import { useGetAddonServicesQuery, type AddonServiceType } from '@castlery/modules-order-domain';
import { useAsyncFn } from 'react-use';
import { addServiceItemToPosCartCommand } from '@castlery/modules-cart-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useForm, Controller } from 'react-hook-form';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { logout } from '@castlery/modules-user-domain';
import { logger } from '@castlery/observability';

interface IFormInputs {
  [key: string]: boolean;
}

interface PosAddServiceContentProps {
  services: AddonServiceType[];
  cancel: () => void;
  confirm: (payload: { variantId: number; salePrice: string }[]) => Promise<void>;
}
export const PosAddServiceContent = ({ services, cancel, confirm }: PosAddServiceContentProps) => {
  const dispatch = useAppDispatch();

  const servicePriceMap = useMemo(
    () => new Map(services.map((service) => [String(service.id), service.price])),
    [services]
  );
  const { handleSubmit, control } = useForm<IFormInputs>({
    defaultValues: {},
  });

  const [serviceState, confirmFn] = useAsyncFn(
    async (value: IFormInputs) => {
      const retailId = makePersistenceHandles().retailId.getItem();
      if (Boolean(retailId) === false) {
        logger.error('Retail ID not set when adding service', { retailId });
        return await dispatch(logout({}));
      }
      const selectServices = Object.keys(value).filter((key) => value[key]);
      const payload = selectServices.map((key) => ({
        variantId: Number(key),
        salePrice: servicePriceMap.get(key) || '',
      }));
      return confirm(payload).then(() => {
        cancel?.();
      });
    },
    [confirm, cancel, dispatch]
  );

  return (
    <Box sx={{ position: 'relative', px: 6 }}>
      <Backdrop open={serviceState.loading} />
      <Typography level="caption1" sx={{ mb: 4 }}>
        For a regular order, please select a delivery service (e.g., White Glove, Room of Choice, etc.) on the checkout
        page.
      </Typography>
      <form>
        <Stack spacing={2} sx={{ pb: 10 }}>
          {services.map((item) => (
            <>
              <Controller
                key={item.id}
                name={item.id + ''}
                control={control}
                render={({ field }) => {
                  return <ServiceListItem item={item} field={field} />;
                }}
              />
              <Divider orientation="horizontal" />
            </>
          ))}
        </Stack>
      </form>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          width: '100%',
          p: 6,
          position: 'fixed',
          left: 0,
          bottom: 0,
          zIndex: 2,
          background: 'var(--fortress-palette-brand-warmLinen-200)',
        }}
      >
        <Button variant="outlined" color="neutral" fullWidth onClick={cancel} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth loading={serviceState.loading} onClick={handleSubmit(confirmFn)}>
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export const PosAddServiceItems = () => {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const dispatch = useAppDispatch();
  const { currentData: services, isLoading } = useGetAddonServicesQuery(undefined);

  const handleAddService = async (services: { variantId: number; salePrice: string }[]) => {
    if (!services || services.length === 0 || isAdding) return;
    setIsAdding(true);
    try {
      await dispatch(addServiceItemToPosCartCommand(services));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Button
        fullWidth
        loading={isLoading}
        variant="plain"
        color="warning"
        onClick={() => {
          if (!services) {
            logger.error('Services not loaded when adding service', { services });
            return;
          }
          setOpen(true);
        }}
      >
        Add Service
      </Button>
      {services && (
        <Drawer
          title="Add Service"
          open={open}
          onClose={() => {
            !isAdding && setOpen(false);
          }}
          sx={{
            desktop: {
              '& .MuiDrawer-content': {
                width: '558px',
              },
            },
            tablet: {
              '& .MuiDrawer-content': {
                width: '100%',
              },
            },
            mobile: {
              '& .MuiDrawer-content': {
                width: '100%',
              },
            },
          }}
        >
          <ModalClose />

          <PosAddServiceContent
            key={open ? 'open' : 'closed'}
            cancel={() => {
              setOpen(false);
            }}
            confirm={handleAddService}
            services={services}
          />
        </Drawer>
      )}
    </>
  );
};
