'use client';

import { EcEnv, enableDisplayProductShipping, enableWarehouseFrom } from '@castlery/config';
import { Box, Grid, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import {
  ArrowForwardIos,
  FactCheck,
  LocationOn,
  Package,
  Returns,
  Shipping,
  UspPayNow,
  Warranty,
} from '@castlery/fortress/Icons';
import { productShippingZipcodeSelectorClickedEvent, selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { combineProperties } from '@castlery/modules-product-services';
import { selectedCurrentCityInfo } from '@castlery/modules-user-domain';
import { NextFortressLink, ShippingLocationModal } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';
import { useMemo, useState } from 'react';

const DeliveryLink = () => (
  <NextFortressLink
    variant="secondary"
    level="caption2"
    href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/delivery`}
    target="_blank"
    isExternalFlag={true}
    sx={{
      px: 0,
    }}
  >
    Delivery Policy
  </NextFortressLink>
);

const TermsLink = () => (
  <NextFortressLink
    variant="secondary"
    level="caption2"
    href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/sales-and-refunds`}
    target="_blank"
    isExternalFlag={true}
    sx={{
      px: 0,
    }}
  >
    Terms and Conditions
  </NextFortressLink>
);

const FactCheckIcon = () => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="center"
    sx={{
      width: '24px',
      height: '24px',
    }}
  >
    <FactCheck
      sx={{
        width: '20px',
        height: '20px',
      }}
    />
  </Stack>
);

interface USPItem {
  name: string | React.ReactNode;
  desc: React.ReactNode;
  icon?: React.ReactNode;
  id?: string;
}

const getUSPs = (clearance = false, variant: any, product: any, warrantyMaxYear = 0): Record<string, USPItem[]> => {
  let isHidden = false;
  if (product?.product_type !== 'bundle' && variant?.is_customized) {
    isHidden = true;
  }

  const warrantyUSP: USPItem | null =
    warrantyMaxYear > 0
      ? {
          name: `Up to ${warrantyMaxYear}-year${warrantyMaxYear > 1 ? 's' : ''} free warranty`,
          desc: '',
          icon: <Warranty />,
        }
      : null;

  return {
    US: [
      {
        name: 'Delivery calculated per shipment*',
        desc: (
          <>
            View full <DeliveryLink /> here
          </>
        ),
        icon: <Shipping />,
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Pay Later' : isHidden ? '' : '30-day returns',
        desc: clearance ? (
          'With monthly installments'
        ) : (
          <>
            <TermsLink />
            &nbsp;apply
          </>
        ),
        icon: clearance ? <UspPayNow /> : isHidden ? <FactCheckIcon /> : <Returns />,
      },
      ...(warrantyUSP ? [warrantyUSP] : []),
    ],
    SG: [
      {
        name: 'Free delivery over $500',
        desc: (
          <>
            View full <DeliveryLink /> here
          </>
        ),
        icon: <Shipping />,
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Instalment' : isHidden ? '' : '30-day returns',
        desc: clearance ? (
          'On orders over $500'
        ) : (
          <>
            <TermsLink />
            &nbsp;apply
          </>
        ),
        icon: clearance ? <UspPayNow /> : isHidden ? <FactCheckIcon /> : <Returns />,
      },
      ...(warrantyUSP ? [warrantyUSP] : []),
    ],
    AU: [
      {
        name: 'Delivery calculated per shipment*',
        desc: (
          <>
            View full <DeliveryLink /> here
          </>
        ),
        icon: <Shipping />,
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Instalment' : isHidden ? '' : '30-day returns',
        desc: clearance ? (
          'On orders up to $5000'
        ) : (
          <>
            <TermsLink />
            &nbsp;apply
          </>
        ),
        icon: clearance ? <UspPayNow /> : isHidden ? <FactCheckIcon /> : <Returns />,
      },
      ...(warrantyUSP ? [warrantyUSP] : []),
    ],
    CA: [
      {
        name: 'Delivery calculated per shipment*',
        desc: (
          <>
            View full <DeliveryLink /> here
          </>
        ),
        icon: <Shipping />,
        id: 'pdp-shipping-usp',
      },
      ...(clearance
        ? []
        : [
            {
              name: isHidden ? '' : '30-day returns',
              desc: (
                <>
                  <TermsLink />
                  &nbsp;apply
                </>
              ),
              icon: isHidden ? <FactCheckIcon /> : <Returns />,
            },
          ]),
      ...(warrantyUSP ? [warrantyUSP] : []),
    ],
    UK: [
      {
        name: 'Free delivery over £999',
        desc: (
          <>
            View full <DeliveryLink /> here
          </>
        ),
        icon: <Shipping />,
        id: 'pdp-shipping-usp',
      },
      ...(clearance
        ? []
        : [
            {
              name: isHidden ? '' : '30-day returns',
              desc: (
                <>
                  <TermsLink />
                  &nbsp;apply
                </>
              ),
              icon: isHidden ? <FactCheckIcon /> : <Returns />,
            },
          ]),
      ...(warrantyUSP ? [warrantyUSP] : []),
    ],
  };
};

interface ProductUSPProps {
  finalSlug: string;
  stockState?: string;
  warehouseName?: string;
}

export const ProductUSP = (props: ProductUSPProps) => {
  const dispatch = useAppDispatch();
  const { stockState, warehouseName, finalSlug } = props;
  const variant = useAppSelector(selectVariant);
  const product = useAppSelector(selectProduct);
  const currentCityInfo = useAppSelector(selectedCurrentCityInfo);
  const { mobile } = useBreakpoints();
  const [openShippingLocationModal, setOpenShippingLocationModal] = useState(false);
  const clearance = useMemo(
    () => variant?.tags?.some((tag: string) => tag.toLowerCase() === 'clearance'),
    [variant?.tags]
  );

  const warrantyMaxYear = useMemo(() => {
    const deliveryReturns = combineProperties(
      product?.product_properties?.delivery_returns ?? [],
      variant?.variant_properties?.delivery_returns ?? []
    );
    const warrantyProp = deliveryReturns?.find((p) => p.name === 'warranty');
    if (!warrantyProp?.value) return 0;
    const matches = [...(warrantyProp.value as string).matchAll(/(\d+)[\s-]*year/gi)];
    if (matches.length === 0) return 0;
    return Math.max(...matches.map((match) => parseInt(match[1], 10)));
  }, [product, variant]);

  const usps = useMemo(() => {
    const countryUSPs = [];
    if (enableDisplayProductShipping) {
      const DeliveryToInfoLink = () => (
        <>
          {currentCityInfo && (
            <Link
              component="button"
              variant="primary"
              level="caption1"
              onClick={() => {
                setOpenShippingLocationModal(true);
                dispatch(productShippingZipcodeSelectorClickedEvent());
              }}
              endDecorator={
                <ArrowForwardIos
                  sx={{
                    width: '20px',
                    height: '20px',
                  }}
                />
              }
            >
              {`${currentCityInfo?.city ? `${currentCityInfo.city}, ` : ''}${currentCityInfo?.zipcode}`}
            </Link>
          )}
        </>
      );

      countryUSPs.push({
        name: (
          <>
            Deliver to <DeliveryToInfoLink />
          </>
        ),
        desc: null,
        icon: <LocationOn />,
        id: 'delivery-to-info',
      });
    }
    if (stockState !== STOCK_STATE.OUT_OF_STOCK && warehouseName && enableWarehouseFrom) {
      countryUSPs.push({
        name: `Ship from ${warehouseName}`,
        desc: null,
        icon: (
          <Package
            sx={{
              '&.MuiSvgIcon-root': {
                fill: 'none',
              },
            }}
          />
        ),
        id: 'ship-from-warehouse',
      });
    }
    countryUSPs.push(...(getUSPs(clearance, variant, product, warrantyMaxYear)[EcEnv.NEXT_PUBLIC_COUNTRY] || []));

    return countryUSPs.filter(Boolean);
  }, [clearance, currentCityInfo, dispatch, product, stockState, variant, warehouseName, warrantyMaxYear]);

  return (
    <>
      <Grid container spacing={2} sx={{ mt: mobile ? 5 : 6 }}>
        {usps.map((usp, index) => (
          <Grid
            xs={12}
            md={6}
            lg={6}
            key={usp?.id || `usp-${index}`}
            sx={{
              ...(!mobile && {
                rowSpacing: 4,
                columnSpacing: 6,
              }),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start" id={usp?.id || `usp-${index}`}>
              {
                (usp.icon && (
                  <Box
                    sx={{
                      color: 'var(--fortress-palette-brand-mono-900)',
                    }}
                  >
                    {usp.icon as any}
                  </Box>
                )) as any
              }
              <Stack justifyContent="flex-start">
                {
                  (usp.name && (
                    <Typography level="caption1" variant="plain" sx={{ mb: 0.5 }}>
                      {usp.name as any}
                    </Typography>
                  )) as any
                }
                {
                  (usp.desc && (
                    <Typography level="caption2" variant="plain">
                      {usp.desc as any}
                    </Typography>
                  )) as any
                }
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>
      <ShippingLocationModal
        open={openShippingLocationModal}
        onClose={() => setOpenShippingLocationModal(false)}
        finalSlug={finalSlug}
        source="PDP"
      />
    </>
  );
};
