'use client';

import React from 'react';
import { Stack, Typography } from '@castlery/fortress';

export const CartEmpty: React.FC = () => (
  <Stack
    sx={{
      minHeight: 200,
    }}
    justifyContent={'center'}
  >
    <Typography level="body2" sx={(theme) => ({ color: theme.palette.brand.charcoal[500], textAlign: 'center' })}>
      The cart is empty.
    </Typography>
  </Stack>
);

export default React.memo(CartEmpty);
