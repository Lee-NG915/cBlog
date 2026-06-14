import React from 'react';
import MBadge, { BadgeProps as MBadgeProps } from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import { keyframes } from '@emotion/react';

export type BadgeProps = {} & MBadgeProps & { loading?: boolean };

const skBouncedelay = keyframes`
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const Loading = () => {
  return (
    <Box
      sx={{
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& > div': {
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          animation: `${skBouncedelay} 1.4s infinite ease-in-out both`,
          '&:first-of-type': {
            animationDelay: '-0.32s',
          },
          '&:nth-of-type(2)': {
            animationDelay: '-0.16s',
          },
        },
      }}
    >
      <div />
      <div />
      <div />
    </Box>
  );
};

export const Badge = React.forwardRef((props: BadgeProps, ref: React.Ref<HTMLElement>) => {
  let { loading, ...rest } = props;
  if (loading) {
    return <MBadge {...rest} ref={ref} badgeContent={<Loading />} sx={{ '--Badge-paddingX': '0' }} />;
  }
  return <MBadge {...rest} ref={ref} />;
});
