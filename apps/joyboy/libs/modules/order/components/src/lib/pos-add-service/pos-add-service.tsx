'use client';
import React, { useState } from 'react';
import { Box, Button, Drawer, Stack, Backdrop } from '@castlery/fortress';
import ServiceListItem from './service-item';
import { useGetAddonServicesQuery, type AddonServiceType } from '@castlery/modules-order-domain';
import { useAsyncFn } from 'react-use';
import { addServiceCommand } from '@castlery/modules-order-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useForm, Controller } from 'react-hook-form';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { logout } from '@castlery/modules-user-domain';
import { logger } from '@castlery/observability/client';

interface IFormInputs {
  [key: string]: boolean;
}

interface PosAddServiceContentProps {
  services: AddonServiceType[];
  cancel: () => void;
  confirm: (payload: number[]) => Promise<void>;
}
export const PosAddServiceContent = ({ services, cancel, confirm }: PosAddServiceContentProps) => {
  const dispatch = useAppDispatch();
  const { handleSubmit, control, reset } = useForm<IFormInputs>({
    defaultValues: {},
  });

  const [serviceState, confirmFn] = useAsyncFn(
    async (value: IFormInputs) => {
      const retailId = makePersistenceHandles().retailId.getItem();
      if (Boolean(retailId) === false) {
        logger.error('Retail ID not set when adding service', { retailId });
        return await dispatch(logout({}));
      }
      const selectServices = Object.keys(value)
        .filter((key) => value[key])
        .map((key) => Number(key));
      return confirm(selectServices).then(() => {
        cancel && cancel();
      });
    },
    [confirm, cancel, dispatch]
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <Backdrop open={serviceState.loading} />
      <form>
        <Stack spacing={2} sx={{ pb: 10 }}>
          {services.map((item) => (
            <Controller
              key={item.id}
              name={item.id + ''}
              control={control}
              render={({ field }) => {
                return <ServiceListItem item={item} field={field} />;
              }}
            />
          ))}
        </Stack>
      </form>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
          pb: {
            xs: 3,
            sm: 2,
          },
          pt: 1,
          paddingX: {
            xs: 4,
            sm: 7,
          },
          position: 'fixed',
          left: 0,
          bottom: 0,
          zIndex: 2,
          background: (theme) => theme.palette.background.body,
        }}
      >
        <Button fullWidth variant="tertiary" onClick={cancel} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button
          fullWidth
          loading={serviceState.loading}
          onClick={handleSubmit((value) => {
            confirmFn(value);
          })}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export const PosAddService = () => {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const dispatch = useAppDispatch();
  const { currentData: services, isLoading } = useGetAddonServicesQuery(undefined);
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
      {services && open && (
        <Drawer
          title="Add Service"
          showCloseButton
          open={open}
          onClose={() => {
            !isAdding && setOpen(false);
          }}
        >
          <PosAddServiceContent
            cancel={() => {
              setOpen(false);
            }}
            // TODO 让后端提供批量接口
            confirm={async (payload) => {
              const serviceItems = payload.map((id) => {
                return {
                  variant_id: id,
                  quantity: 1,
                };
              });
              setIsAdding(true);
              for (const item of serviceItems) {
                await dispatch(addServiceCommand(item));
              }
              setIsAdding(false);
            }}
            services={services}
          />
        </Drawer>
      )}
    </>
  );
};

export default React.memo(PosAddService);
