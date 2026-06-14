'use client';

import { EcEnv } from '@castlery/config';
import { Box, Drawer, ModalClose, Stack, Table, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { IppResponse } from '@castlery/modules-product-domain';
import { FortressImage, NextFortressLink } from '@castlery/shared-components';
import { DynamicDialogContent, DynamicDialogTitle } from '@castlery/shared-fortress-client';
import { toPrice } from '@castlery/utils';
import React, { useEffect, useRef, useState } from 'react';

interface ProductInstalmentDrawerProps {
  open: boolean;
  onClose: () => void;
  instalment?: IppResponse;
  price?: number;
}

const logos: Record<string, string> = {
  OCBC: 'https://res.cloudinary.com/castlery/image/upload/v1750044012/payments-wallet/ocbc.png',
  UOB: 'https://res.cloudinary.com/castlery/image/upload/v1750044015/payments-wallet/uob.png',
  AMEX: 'https://res.cloudinary.com/castlery/image/upload/v1753262959/payments-wallet/amex_full.png',
  DBS: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/dbs.png',
  POSB: 'https://res.cloudinary.com/castlery/image/upload/v1750044014/payments-wallet/posb.png',
};

//TODO toPrice abby 会优化，现在临时处理
const formatPriceWithoutTrailingZeros = (price: number) => {
  return toPrice(price)?.toString()?.replace(/\.00$/, '');
};

export const ProductInstalmentDrawer = ({ open, onClose, instalment, price }: ProductInstalmentDrawerProps) => {
  const { desktop, mobile } = useBreakpoints();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (open && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [open, hasLoaded]);

  return (
    <Drawer
      anchor={desktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      size={'md'}
      sx={{
        ...(!desktop && {
          '--Drawer-verticalSize': '80vh',
        }),
      }}
    >
      <DynamicDialogTitle component={Box}>
        <Typography level="h3">Enjoy 0% instalment</Typography>
        <ModalClose onClick={onClose} />
      </DynamicDialogTitle>
      <DynamicDialogContent>
        {hasLoaded && (
          <Stack px={6}>
            <Typography level="body2">
              Applicable for <strong>online purchases</strong> only. Regarding instalment plans for in-store purchases,
              speak to our sales consultants.
            </Typography>

            <Typography sx={{ my: mobile ? 4 : 6 }} level="body2">
              Please note that a minimum spend of <strong>$500</strong> is required for instalment plans when using a
              DBS, OCBC, UOB, or AMEX Credit Card.*
            </Typography>

            <Table
              variant="outlined"
              role="presentation"
              sx={{
                '--variant-outlinedBorder': 'var(--fortress-palette-brand-mono-300)',
                '& thead th:nth-of-type(1)': { width: '50%' },
                '& thead th:nth-of-type(2)': { width: '50%' },
                borderCollapse: 'collapse',
                td: {
                  padding: 0,
                },
                'td:first-of-type': {
                  borderRight: '0.5px solid var(--fortress-palette-brand-mono-300)',
                },
                '& .MuiTable-root': {
                  border: 'none',
                },
              }}
            >
              <tbody>
                {instalment?.ipp_options?.map((option) => (
                  <React.Fragment key={option.bank_code}>
                    {option.options.map((o, index) => (
                      <tr key={o.period}>
                        {index === 0 && (
                          <td rowSpan={option.options.length} role="presentation">
                            <Stack alignItems="center" py={mobile ? 5 : 4} px={6}>
                              <FortressImage
                                src={logos[option.bank_code?.toUpperCase()] || ''}
                                ratio={4}
                                alt={option.bank}
                                sizes={['0.2-md', '0.4-sm', '0.4-xs']}
                              />
                              {option.bank_code?.toUpperCase() === 'DBS' && (
                                <FortressImage
                                  src={logos.POSB || ''}
                                  ratio={4}
                                  alt="POSB"
                                  sizes={['0.2-md', '0.4-sm', '0.4-xs']}
                                />
                              )}
                            </Stack>
                          </td>
                        )}
                        <td role="presentation">
                          {price && (
                            <Stack py={3} px={4}>
                              <Typography level="body2">
                                {formatPriceWithoutTrailingZeros(price / o.period)}&nbsp; x &nbsp;{o.period} months
                              </Typography>
                            </Stack>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
            <Stack direction="row" alignItems="center" mt={mobile ? 4 : 6}>
              *
              <NextFortressLink
                href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/sales-and-refunds`}
                target="_blank"
                level="body1"
                variant="primary"
                // isExternalFlag={true}
                endDecorator={<ArrowRight />}
              >
                View Terms & Conditions
              </NextFortressLink>
            </Stack>
          </Stack>
        )}
      </DynamicDialogContent>
    </Drawer>
  );
};
