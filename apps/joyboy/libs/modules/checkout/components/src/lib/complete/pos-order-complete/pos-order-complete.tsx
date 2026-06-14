import React from 'react';
import { Box, Typography, Stack, Button, typographyClasses } from '@castlery/fortress';
import { CheckCircle } from '@castlery/fortress/Icons';
/* eslint-disable-next-line */
export interface PosOrderCompleteProps {}

export function PosOrderComplete(props: PosOrderCompleteProps) {
  return (
    <Box
      sx={{ width: '100%', height: 300, margin: 'auto', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}
      >
        <CheckCircle sx={{ width: 42, height: 42 }} />
        <Typography level="h1" sx={{ [`&.${typographyClasses.root}`]: { mt: 0 } }}>
          Order Complete
        </Typography>
      </Box>
      <Stack sx={{ mb: 1, textAlign: 'center' }}>
        <Typography level="body1">Order Number:</Typography>
        <Typography level="body1">R999999999</Typography>
      </Stack>
      <Stack sx={{ mb: 3, textAlign: 'center' }}>
        <Typography level="body1">Total Paid:</Typography>
        <Typography level="body1">$99,999</Typography>
      </Stack>
      <Button sx={{ margin: 'auto', display: 'block', width: 150 }}>Next Order</Button>
    </Box>
  );
}

export default PosOrderComplete;
