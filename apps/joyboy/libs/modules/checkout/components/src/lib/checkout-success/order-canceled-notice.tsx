'use client';
import { Box, Typography } from '@castlery/fortress';
import { basePageConfig, EcEnv } from '@castlery/config';

const contactUsPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase() + basePageConfig['contact-us'];

export const OrderCanceledNotice = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: { xs: 4, md: 15 },
      textAlign: 'center',
    }}
  >
    <Typography level="body1">
      Oops, your order was canceled during the payment process. Please <a href={contactUsPath}>contact us</a> for
      refund.
    </Typography>
  </Box>
);
