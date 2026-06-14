import React from 'react';
import { SxProps } from '@castlery/fortress';
import { Castlery } from '@castlery/fortress/Icons';

const Logo = ({ sx }: { sx?: SxProps }) => (
  <Castlery
    sx={[
      {
        fill: '#844025',
        width: '100%',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

export default Logo;
