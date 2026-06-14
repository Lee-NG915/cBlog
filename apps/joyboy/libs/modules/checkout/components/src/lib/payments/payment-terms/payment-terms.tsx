'use client';
import { EcEnv } from '@castlery/config';
import { Stack, Checkbox, Typography, Link, useDecNiceModal, useBreakpoints, cardClasses } from '@castlery/fortress';
import React from 'react';
import { checkoutFeatureService } from '@castlery/modules-checkout-services';

export interface PaymentTermsProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function PaymentTerms({ checked, onChange }: PaymentTermsProps) {
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const { mobile } = useBreakpoints();
  const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY;
  const termsAndConditionsUrl = checkoutFeatureService.termsAndConditionsUrl;
  const resetModalProps = {
    ...modalProps,
    showDefaultFooter: false,
    border: false,
    dialogSx: {
      p: 0,
      minWidth: mobile ? '95%' : '80%',
      height: 500,
      overflow: 'auto',
      [`&> .${cardClasses.root}`]: {
        gap: 0,
        paddingY: 0,
        paddingX: 0,
      },
    },
  };
  const handleChange = () => {
    onChange(!checked);
  };
  return (
    <>
      <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 0.5 }}>
        <Checkbox checked={checked} sx={{ width: 20, height: 20, m: 0.5 }} color="primary" onChange={handleChange} />
        <Typography level="caption1">
          By checking this box, I agree to the Castlery's &nbsp;
          <Link
            underline="always"
            component={'button'}
            sx={{
              color: (theme) => theme.palette.brand.charcoal[500],
              textDecorationColor: (theme) => theme.palette.brand.charcoal[500],
            }}
            onClick={toggleModal}
          >
            Terms and Conditions
          </Link>
          &nbsp;for my purchase.
        </Typography>
      </Stack>
      <NiceModal {...resetModalProps}>
        <iframe width="100%" height="500px" title="Terms and Conditions" src={termsAndConditionsUrl} />
      </NiceModal>
    </>
  );
}

export default PaymentTerms;
