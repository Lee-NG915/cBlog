'use client';

import { useMemo, useState } from 'react';
import useZip from '../../../../hooks/use-zip';
import { Box, Link, Stack, Typography } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';
import { FortressImage } from '@castlery/shared-components';
import { AfterpayModal } from '@castlery/shared-components';
import { toPrice } from '@castlery/utils';

interface ProductPaymentMethodProps {
  price: number;
}

export const ProductPaymentMethod = (props: ProductPaymentMethodProps) => {
  const { price } = props;
  const showAfterpay = useMemo(() => price <= 4000, [price]);
  const showZip = useMemo(() => price <= 5000, [price]);
  const [zipBtnRef, handleZipLabelClick] = useZip();
  const [afterpayModalOpen, setAfterpayModalOpen] = useState(false);

  const openAfterpayModal = () => {
    setAfterpayModalOpen(true);
  };

  const closeAfterpayModal = () => {
    setAfterpayModalOpen(false);
  };

  const zipModal = (
    <>
      <Box data-zm-merchant={EcEnv.NEXT_PUBLIC_ZIP_PUBLIC_KEY} data-env="production" />
      <Box
        sx={{
          display: 'none',
        }}
        ref={zipBtnRef}
        data-zm-asset="productwidget"
        data-zm-widget="popup"
        data-zm-popup-asset="termsdialog"
        data-zm-price={price}
        aria-hidden="true"
      />
    </>
  );

  if (!showAfterpay && !showZip) {
    return null;
  }
  if (!showAfterpay && EcEnv.NEXT_PUBLIC_ZIP_ENABLED && showZip) {
    return (
      <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={2} mt={2}>
        <Box
          onClick={handleZipLabelClick}
          role="button"
          data-selenium="installment_expand"
          sx={{
            width: '50px',
            ':hover': {
              cursor: 'pointer',
            },
          }}
        >
          <FortressImage
            src={'https://res.cloudinary.com/castlery/image/upload/v1750044017/payments-wallet/zip_pay_icon.png'}
            ratio={2.7}
            alt="zip"
          />
        </Box>
        <Link
          component={'button'}
          variant="secondary"
          level="caption1"
          onClick={handleZipLabelClick}
          data-selenium="installment_expand"
        >
          {price <= 1000 ? 'from $10 per week' : `$${(price / 12 / 4.33).toFixed(2)} weekly for 12 months`}
        </Link>
        {zipModal}
      </Stack>
    );
  }
  return (
    <>
      <Stack>
        <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={2} mt={2}>
          {showAfterpay && (
            <Box
              role="button"
              sx={{
                width: '70px',
                ':hover': {
                  cursor: 'pointer',
                },
              }}
              onClick={openAfterpayModal}
            >
              <FortressImage
                src={'https://res.cloudinary.com/castlery/image/upload/v1750044009/payments-wallet/after_pay_icon.png'}
                ratio={2.9}
                alt="afterpay"
              />
            </Box>
          )}
          {EcEnv.NEXT_PUBLIC_ZIP_ENABLED && showZip && (
            <>
              <Box
                onClick={handleZipLabelClick}
                role="button"
                data-selenium="installment_expand"
                sx={{
                  width: '50px',
                  ':hover': {
                    cursor: 'pointer',
                  },
                }}
              >
                <FortressImage
                  src={'https://res.cloudinary.com/castlery/image/upload/v1750044017/payments-wallet/zip_pay_icon.png'}
                  ratio={2.7}
                  alt="zip"
                />
              </Box>
              {zipModal}
            </>
          )}
        </Stack>
        {showAfterpay && (
          <Stack mt={2}>
            <Link component="button" variant="secondary" level="caption1" onClick={openAfterpayModal}>
              {`4 interest-free payments of ${toPrice(price / 4)}`}
            </Link>
          </Stack>
        )}
      </Stack>

      {/* Afterpay Modal */}
      <AfterpayModal open={afterpayModalOpen} onClose={closeAfterpayModal} />
    </>
  );
};
