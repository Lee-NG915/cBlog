import React from 'react';
import { Box } from '@castlery/fortress';
import PropTypes from 'prop-types';
import modalState from 'containers/Frame/modalState';

const Stepper = ({ children }) => {
  const isMiniCart = modalState?.states && modalState?.states.includes('cart');

  return (
    <Box
      sx={{ width: '100%', mb: isMiniCart ? 5 : 6 }}
      display="grid"
      gridTemplateColumns={`repeat(${children?.length || 1}, 1fr)`}
      gap={1 / 4}
    >
      {children}
    </Box>
  );
};
Stepper.propTypes = {
  children: PropTypes.node,
};

export default React.memo(Stepper);
