'use client';
import React, { useState } from 'react';
import {
  Button,
  Typography,
  useDecNiceModal,
  RadioGroup,
  Sheet,
  Radio,
  Stack,
  Divider,
} from '@castlery/fortress';
import { type AdditionalShippingService } from '@castlery/modules-checkout-domain';
import { toPrice } from '@castlery/utils';
import { changeServiceTypeCommand } from './helper';
import { useAsyncFn } from 'react-use';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { checkoutFeatureService } from '@castlery/modules-checkout-services';

export interface PosAddShipmentServiceProps {
  defaultType: string;
  data: AdditionalShippingService;
  basicShippingFee: string;
}

export function PosAddShipmentService({ data, defaultType, basicShippingFee }: PosAddShipmentServiceProps) {
  const dispatch = useAppDispatch();
  const { available_service_types, shipment_id } = data;
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const [selectedType, setSelectedType] = useState<string>(defaultType);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const onRadioChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    setSelectedType(target.value);
  };
  const [applyState, apply] = useAsyncFn(async () => {
    setErrorMessage('');
    return dispatch(
      changeServiceTypeCommand({ shipmentId: shipment_id, serviceType: selectedType, waiveFee: false })
    ).then((res) => {
      if (res?.error) {
        const { detail, title } = res?.payload?.data?.errors?.[0] || {};
        const errorStr = title ? title + ': ' + detail : detail;
        setErrorMessage(errorStr || 'Some thing wrong,please try again!');
        return;
      }
      toggleModal();
    });
  }, [selectedType, shipment_id, dispatch, toggleModal]);

  const amountCalculation = (type: string, amount: string, originalAmount: string) => {
    const standardFee = Number(basicShippingFee);
    const originalAddOnFee = originalAmount ? Number(originalAmount) : 0;
    let serviceFees = {
      addOnFee: 0,
      originalAddOnFee: 0,
    };
    if (checkoutFeatureService.enabledAccumulativeServiceFee) {
      serviceFees = {
        addOnFee: type === 'standard' ? Number(amount) + standardFee : Number(amount),
        originalAddOnFee: originalAddOnFee,
      };
    } else if (type !== 'standard_service') {
      serviceFees = {
        addOnFee: Number(amount) - standardFee,
        originalAddOnFee: standardFee === 0 || !originalAddOnFee ? 0 : originalAddOnFee,
      };
    }
    return serviceFees;
  };

  const isStandardService = (type: string) => {
    return ['standard_service', 'standard'].includes(type);
  };

  return (
    <React.Fragment>
      <Button variant="secondary" onClick={toggleModal} sx={{ width: 173 }} size="md">
        Change service
      </Button>
      <NiceModal
        {...modalProps}
        showCloseBtn={false}
        showDefaultFooter={false}
        dialogSx={{ p: 4, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Stack spacing={1}>
          <Typography level="subh1" sx={{ mb: 1 }}>
            Select service
          </Typography>
          <Divider />
          <RadioGroup overlay name="service" value={selectedType} sx={{ gap: 1 }} onChange={onRadioChange}>
            {available_service_types.map((item) => {
              const serviceFees = amountCalculation(item.type, item.amount, item.original_amount);
              return (
                <>
                  <Sheet component="label" key={item.type} sx={{ display: 'flex', flexDirection: 'row', gap: 2.5 }}>
                    <Radio name={item.type} value={item.type} />
                    <Stack>
                      <Typography level="subh2">{item.display_name}</Typography>
                      <Typography level="body2">
                        <Typography level="body2">
                          {isStandardService(item.type)
                            ? `${toPrice(Number(item.amount), true)}`
                            : `+ ${toPrice(Number(serviceFees.addOnFee))}`}
                        </Typography>
                        {serviceFees.originalAddOnFee && serviceFees.originalAddOnFee !== serviceFees.addOnFee ? (
                          <Typography level="body2" sx={{ textDecoration: 'line-through', ml: 1 }}>
                            {`${isStandardService(item.type) ? '' : '+ '} ${toPrice(serviceFees.originalAddOnFee)}`}
                          </Typography>
                        ) : null}
                      </Typography>
                      <Typography level="body2">{item.display_content}</Typography>
                    </Stack>
                  </Sheet>
                  <Divider />
                </>
              );
            })}
          </RadioGroup>

          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'auto 300px',
              },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Button variant="tertiary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button disabled={!selectedType} loading={applyState.loading} onClick={apply}>
              Apply
            </Button>
          </Stack>
          <Typography level="caption1" color="danger" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            {errorMessage}
          </Typography>
        </Stack>
      </NiceModal>
    </React.Fragment>
  );
}

export default PosAddShipmentService;
