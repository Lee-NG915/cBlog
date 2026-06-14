import React from 'react';
import { Box } from '@castlery/fortress';

export interface WrapClickProps {
  children: React.ReactNode;
  onClick: () => void;
  checkBeforeClick?: () => boolean;
}

const WrapClick = (props: WrapClickProps) => {
  const { children, onClick, checkBeforeClick = true } = props;
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {children}
      {!checkBeforeClick && (
        <Box
          onClick={onClick}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 2,
          }}
        />
      )}
    </Box>
  );
};
export default WrapClick;
