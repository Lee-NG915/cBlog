import React from 'react';
import { Typography } from '@castlery/fortress';
import { addressFeatureInAU } from 'config';

interface ToastContentProps {}
const ToastContent: React.FC<ToastContentProps> = () => (
  <Typography level="body2" sx={{ color: 'white' }}>
    {addressFeatureInAU ? 'Postcode' : 'Zip code'} has been updated!
  </Typography>
);

export default React.memo(ToastContent);
