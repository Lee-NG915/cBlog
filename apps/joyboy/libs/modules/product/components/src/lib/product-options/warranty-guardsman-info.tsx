'use client';

import {
  Variant,
  resetSelectedGuardsmanPlanId,
  selectGuardsmanWarrantyPlans,
  selectWarrantyIsFetching,
  selectedGuardsmanPlanId,
  setSelectedGuardsmanPlanId,
} from '@castlery/modules-product-domain';
import { ListItem, Radio, RadioGroup, Sheet, Stack } from '@castlery/fortress';
import { ProductOptionLabel } from './product-option-label';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { Loading } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';

export interface WarrantyGuardsmanInfoProps {
  variant: Variant;
}

export function WarrantyGuardsmanInfo() {
  const dispatch = useAppDispatch();
  const currentPlanId = useAppSelector(selectedGuardsmanPlanId);
  const currentWarrantyList = useAppSelector(selectGuardsmanWarrantyPlans);
  const currentWarrantyIsFetching = useAppSelector(selectWarrantyIsFetching);

  const warrantyList = React.useMemo(() => {
    return currentWarrantyList.map((item) => ({
      customerCost: `${item.price}`,
      durationMonths: `${item.term * 12}`,
      planId: item.id,
    }));
  }, [currentWarrantyList]);

  if (currentWarrantyList.length === 0) {
    return null;
  }

  return (
    <>
      <ListItem
        sx={{
          minHeight: 72,
          py: 4,
        }}
      >
        <Stack>
          <ProductOptionLabel text="Warranty" />
        </Stack>
        {!currentWarrantyIsFetching && (
          <RadioGroup
            orientation="horizontal"
            sx={{
              gap: 1,
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              paddingY: 1,
            }}
            value={currentPlanId}
          >
            {warrantyList.map((item) => {
              const yearsNum = Number(item.durationMonths) / 12;
              const presentation = `${yearsNum} Year${yearsNum > 1 ? 's' : ''} - ${
                EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
              }${item.customerCost}`;

              return (
                <Sheet
                  key={item.planId}
                  sx={{
                    height: 'auto',
                    paddingX: 2,
                    paddingY: 1,
                    borderRadius: 0,
                  }}
                >
                  <Radio
                    overlay
                    disableIcon
                    value={item.planId}
                    label={presentation}
                    color="primary"
                    onClick={() => {
                      if (currentPlanId === item.planId) {
                        dispatch(resetSelectedGuardsmanPlanId());
                        return;
                      }

                      dispatch(setSelectedGuardsmanPlanId(item.planId));
                    }}
                    slotProps={{
                      label: ({ checked }) => ({
                        sx: {
                          fontSize: 'md',
                          color: (theme) =>
                            checked
                              ? `${theme.palette.brand.terracotta[700]} !important`
                              : theme.palette.brand.charcoal[800],
                        },
                      }),
                      action: ({ checked }) => ({
                        sx: (theme) => ({
                          borderColor: theme.palette.brand.charcoal[300],
                          ...(checked && {
                            '--variant-borderWidth': '2px',
                            '&&': {
                              borderColor: (theme) => `${theme.palette.brand.terracotta[700]} !important`,
                              color: theme.palette.brand.terracotta[700],
                            },
                          }),
                          '&:hover': {
                            bgcolor: 'transparent',
                            '--variant-borderWidth': '1px',
                            '&&': {
                              borderColor: (theme) => `${theme.palette.brand.terracotta[600]} !important`,
                              color: theme.palette.brand.terracotta[600],
                            },
                          },
                        }),
                      }),
                    }}
                  />
                </Sheet>
              );
            })}
          </RadioGroup>
        )}
        {currentWarrantyIsFetching && (
          <Loading
            sx={{
              '@keyframes rotate': {
                from: {
                  transform: 'rotate(0deg)',
                },
                to: {
                  transform: 'rotate(360deg)',
                },
              },
              width: '28px',
              animation: 'rotate .5s linear infinite',
              opacity: 1,
            }}
          />
        )}
      </ListItem>
    </>
  );
}

export default WarrantyGuardsmanInfo;
