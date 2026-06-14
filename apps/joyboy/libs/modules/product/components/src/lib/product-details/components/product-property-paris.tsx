'use client';

import { EcEnv, enableGuarantee } from '@castlery/config';
import type { WarrantyProvider } from '@castlery/config';
import { Box, Grid, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { StandardInfo } from '@castlery/fortress/Icons';
import { Product, ProductProperty, Variant } from '@castlery/modules-product-domain';
import { combineProperties } from '@castlery/modules-product-services';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { CustomLink } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback, useMemo, useState } from 'react';
import { PropertyExplanationDrawer } from './property-explanation-drawer';

interface ProductPropertyParisProps {
  propertyName: keyof Product['product_properties'];
  product?: Product;
  variant?: Variant;
  hasWarrantyPlans?: boolean;
  warrantyProvider?: WarrantyProvider;
}

export const ProductPropertyParis = (props: ProductPropertyParisProps) => {
  const { product, variant, propertyName, hasWarrantyPlans, warrantyProvider, ...rest } = props;
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const { desktop } = useBreakpoints();

  const properties = useMemo(() => {
    return combineProperties(product?.product_properties[propertyName], variant?.variant_properties[propertyName]);
  }, [product, variant, propertyName]);

  const isSandGrey = useMemo(
    () =>
      variant?.variant_option_values &&
      variant?.variant_option_values?.find((optionValue) => optionValue?.name === 'sand_grey'),
    [variant]
  );

  const trackPdpDetails = useCallback(
    async (pname: string, value: string) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action: 'product_property',
          label: `${pname} - ${value}`,
        })
      );
    },
    [dispatch]
  );

  const renderValue = useCallback(
    (property: ProductProperty) => {
      switch (property?.name) {
        case 'returns': {
          return (
            <Typography level="body2">
              {property.value}
              <CustomLink
                href={`/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/sales-and-refunds`}
                role="button"
                target="_blank"
                onClick={() => {
                  trackPdpDetails(property?.name, property?.value);
                }}
                style={{
                  verticalAlign: 'top',
                  display: 'inline-flex',
                }}
                aria-label="View sales and refunds policy"
              >
                <StandardInfo
                  sx={{
                    width: '20px',
                    height: '20px',
                  }}
                  aria-hidden="true"
                />
              </CustomLink>
            </Typography>
          );
        }
        case 'warranty': {
          return (
            <Stack direction="column" gap={2} justifyContent="flex-start">
              <Box>
                <Typography level="body2">
                  {property.value}
                  <CustomLink
                    href={`/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/${enableGuarantee ? 'guarantee' : 'warranty'}`}
                    role="button"
                    target="_blank"
                    onClick={() => {
                      trackPdpDetails(property?.name, property?.value);
                    }}
                    style={{
                      verticalAlign: 'top',
                      display: 'inline-flex',
                    }}
                    aria-label={`View ${enableGuarantee ? 'guarantee' : 'warranty'} policy`}
                  >
                    <StandardInfo
                      sx={{
                        width: '20px',
                        height: '20px',
                      }}
                      aria-hidden="true"
                    />
                  </CustomLink>
                </Typography>
              </Box>
              {warrantyProvider === 'mulberry' && hasWarrantyPlans && (
                <Box>
                  <Typography level="body2">
                    Mulberry Extended Warranty (Add-On)
                    <StandardInfo
                      role="button"
                      onClick={() => {
                        trackPdpDetails('Warranty', 'Mulberry');
                        if (window?.mulberry?.inline?.instances?.[0]?.postMessageClient?.listeners) {
                          window.mulberry.inline.instances[0].postMessageClient.listeners
                            .find((x) => x.key === 'mulberry:inline-to-faq')
                            ?.fn(window.mulberry.core.settings);
                        }
                      }}
                      sx={{
                        verticalAlign: 'top',
                        display: 'inline-block',
                        ml: 2,
                        cursor: 'pointer',
                        width: '20px',
                        height: '20px',
                      }}
                    />
                  </Typography>
                </Box>
              )}
            </Stack>
          );
        }
        default: {
          return (
            <Typography level="body2">
              {property?.name === 'fabric_composition' && isSandGrey ? '90% Polyester, 10% Linen' : property.value}
              {property.explanation && (
                <StandardInfo
                  role="button"
                  onClick={() => {
                    trackPdpDetails(property?.name, property?.value);
                    if (property.explanation) {
                      setOpen(true);
                      setExplanation(property.explanation);
                    }
                  }}
                  sx={{
                    verticalAlign: 'top',
                    display: 'inline-block',
                    ml: 2,
                    cursor: 'pointer',
                    width: '20px',
                    height: '20px',
                  }}
                />
              )}
            </Typography>
          );
        }
      }
    },
    [hasWarrantyPlans, isSandGrey, trackPdpDetails, warrantyProvider]
  );

  return (
    <>
      <Grid container columnSpacing={6} rowSpacing={desktop ? 5 : 4} {...rest}>
        {properties?.map((property, index) => {
          const stripedRowStyles = {
            backgroundColor: index % 2 === 0 ? 'var(--fortress-palette-brand-warmLinen-500)' : 'transparent',
            px: {
              xs: 4,
              md: 5,
            },
            py: {
              xs: 3,
              md: 4,
            },
          };

          return (
            <Box
              key={`${property.name}-${index}`}
              sx={{
                display: 'contents',
              }}
            >
              <Grid
                lg={6}
                md={6}
                sm={6}
                xs={6}
                alignItems="flex-start"
                sx={{
                  display: 'flex',
                  ...stripedRowStyles,
                }}
              >
                <Typography level="body2">{property.presentation}:</Typography>
              </Grid>
              <Grid
                lg={6}
                md={6}
                sm={6}
                xs={6}
                alignItems="flex-start"
                sx={{
                  display: 'flex',
                  a: {
                    ml: 2,
                    color: 'var(--fortress-palette-neutral-plainColor)',
                    '&:hover': {
                      color: 'var(--fortress-palette-neutral-plainColor)',
                    },
                  },
                  ...stripedRowStyles,
                }}
              >
                {renderValue(property)}
              </Grid>
            </Box>
          );
        })}
      </Grid>
      <PropertyExplanationDrawer open={open} onClose={() => setOpen(false)} explanation={explanation} />
    </>
  );
};
