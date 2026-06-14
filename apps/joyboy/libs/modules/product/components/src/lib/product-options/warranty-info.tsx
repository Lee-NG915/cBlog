/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Variant,
  resetSelectedOfferId,
  selectWarrantyIsFetching,
  selectWarrantyList,
  selectedOfferId,
  setSelectedOfferId,
} from '@castlery/modules-product-domain';
import { Box, ListItem, Radio, RadioGroup, Sheet, Stack, Typography } from '@castlery/fortress';
import { ProductOptionLabel } from './product-option-label';
import React from 'react';
import { FortressImage } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { Loading } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';

/* eslint-disable-next-line */
export interface WarrantyInfoProps {
  variant: Variant;
}

export function WarrantyInfo({ variant }: WarrantyInfoProps) {
  // https://docs.getmulberry.com/docs/introduction
  const [initFinished, setInitFinished] = React.useState(false);
  const [warrantyList, setWarrantList] = React.useState<
    {
      customerCost: string;
      durationMonths: string;
      warrantyOfferId: string;
      sku: string;
    }[]
  >([]);
  const [warrantyHidden, setWarrantyHidden] = React.useState(false);
  const dispatch = useAppDispatch();
  const currentOfferId = useAppSelector(selectedOfferId);
  const currentWarrantyList = useAppSelector(selectWarrantyList);
  const currentWarrantyIsFetching = useAppSelector(selectWarrantyIsFetching);
  const initInlineModal = async (offers: any[]) => {
    const { settings } = window.mulberry.core;
    await window?.mulberry?.inline?.init?.({
      offers,
      settings,
      selector: '.mulberry-inline-picker',
    });
    setInitFinished(true);
  };
  React.useEffect(() => {
    if (currentWarrantyList.length > 0) {
      const temp: {
        customerCost: string;
        durationMonths: string;
        warrantyOfferId: string;
        sku: string;
      }[] = [];
      if (Array.isArray(currentWarrantyList)) {
        if (currentWarrantyList.length === 0) {
          setWarrantyHidden(true);
        }
        currentWarrantyList.forEach((item) => {
          temp.push({
            customerCost: item.customer_cost,
            durationMonths: item.duration_months,
            warrantyOfferId: item.warranty_offer_id,
            sku: item.product.external_product_id,
          });
        });
        setWarrantList(temp);
      }
      initInlineModal(currentWarrantyList);
    }
  }, [currentWarrantyList]);
  if (warrantyHidden) {
    return null;
  }
  return (
    <>
      <div
        className="mulberry-inline-picker"
        style={{
          display: 'none',
        }}
      />
      <ListItem
        sx={{
          minHeight: 72,
          py: 4,
        }}
      >
        <Stack>
          <ProductOptionLabel text="Warranty" />
          {initFinished && (
            <Typography
              sx={{
                color: (theme) => theme.palette.brand.charcoal[500],
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() => {
                window?.mulberry?.inline?.instances?.[0]?.postMessageClient?.listeners
                  ?.find((x) => x.key === 'mulberry:inline-to-faq')
                  ?.fn(window?.mulberry?.core?.settings);
              }}
            >
              What's Covered
            </Typography>
          )}
          <Box
            sx={{
              width: '94px',
              height: '48px',
            }}
          >
            <FortressImage
              src="https://res.cloudinary.com/castlery/image/upload/v1715677718/l60hztsxz3nw7g5l3fgg.png"
              alt="mulberry"
              lazy={false}
              ratio={94 / 48}
            />
          </Box>
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
            value={currentOfferId}
            // defaultValue={warrantyList[0].warrantyOfferId}
          >
            {warrantyList.map((item) => {
              const yearsNum = Number(item.durationMonths) / 12;
              const presentation = `${yearsNum} Year${yearsNum > 1 ? 's' : ''} - ${
                EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
              }${item.customerCost}`;
              return (
                <Sheet
                  key={item.warrantyOfferId}
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
                    value={item.warrantyOfferId}
                    label={presentation}
                    color="primary"
                    onClick={() => {
                      if (currentOfferId === item.warrantyOfferId) {
                        dispatch(resetSelectedOfferId());
                        return;
                      } else {
                        dispatch(setSelectedOfferId(item.warrantyOfferId));
                      }
                    }}
                    slotProps={{
                      label: ({ checked, disabled }) => ({
                        sx: {
                          // fontWeight: 'lg',
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
                              // && to increase the specificity to win the base :hover styles
                              borderColor: (theme) => `${theme.palette.brand.terracotta[700]} !important`,
                              color: theme.palette.brand.terracotta[700],
                            },
                          }),
                          '&:hover': {
                            bgcolor: 'transparent',
                            '--variant-borderWidth': '1px',
                            '&&': {
                              // && to increase the specificity to win the base :hover styles
                              borderColor: (theme) => `${theme.palette.brand.terracotta[600]} !important`,
                              color: theme.palette.brand.terracotta[600],
                            },
                          },
                        }),
                      }),
                    }}
                  />
                </Sheet>

                // <OptionsValue
                //   // key={item.warrantyOfferId}
                //   value={{
                //     id: item.warrantyOfferId,
                //     name: presentation,
                //     presentation: presentation,
                //   }}
                //   option={presentation as ProductOptionTypeName}
                //   disabled={false}
                // />
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

export default WarrantyInfo;
