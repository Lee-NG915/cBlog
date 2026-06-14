import React from 'react';
import { Box } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

export interface SpotProps {
  stopAnimation?: boolean;
  children: React.ReactNode;
  bgColor?: string;
  centerDotBgColor?: string;
}
function Spot(props: SpotProps) {
  const { children, stopAnimation, bgColor, centerDotBgColor, ...propArgs } = props;
  const { desktop } = useBreakpoints();

  return (
    <>
      <Box
        role="button"
        sx={{
          position: 'absolute',
          cursor: 'pointer',
          margin: '0 auto',
          padding: ' 18px',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: bgColor || 'none',
          '&::before': {
            zIndex: '1',
            content: '""',
            position: 'absolute',
            width: desktop ? '24px' : '16px',
            height: desktop ? '24px' : '16px',
            animation: !stopAnimation ? 'expand 2s ease infinite' : 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            '@keyframes expand': {
              from: {
                opacity: '1',
                transform: 'scale3d(1, 1, 1)',
              },
              to: {
                opacity: '0',
                transform: 'scale3d(1.7, 1.7, 1.7)',
              },
            },
          },
          '&::after': {
            zIndex: '1',
            content: '""',
            position: 'absolute',
            height: desktop ? '16px' : '10px',
            width: desktop ? '16px' : '10px',
            backgroundColor: centerDotBgColor ? centerDotBgColor : '#ffffff',
            borderRadius: '50%',
          },
          '&:hover': {
            '&::before': {
              animation: 'none',
            },
            '&::after': {
              width: '12px',
              height: '12px',
            },
          },
        }}
        {...propArgs}
      >
        {children}
      </Box>
    </>
  );
}
export default Spot;
