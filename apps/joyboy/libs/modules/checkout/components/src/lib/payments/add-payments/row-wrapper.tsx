import React from 'react';
import { Box } from '@castlery/fortress';

interface RowWrapperProps {
  children: React.ReactNode;
}
export const RowWrapper = ({ children }: RowWrapperProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { _: '1fr', lg: '160px minmax(max-content,358px)' },
        padding: 2,
        columnGap: 3,
        rowGap: 1,
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  );
};
export default RowWrapper;
