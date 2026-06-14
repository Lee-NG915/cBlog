import Spinner from 'components/Spinner';
import * as React from 'react';
import { Box } from '@castlery/fortress';

const GlobalLoading = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '100%',
        height: '300px',
      }}
    >
      <Spinner />
    </Box>
  );
};

export default GlobalLoading;
