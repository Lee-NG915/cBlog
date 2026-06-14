import { Box } from '@castlery/fortress';
import { Loading } from '@castlery/fortress/Icons';
import { keyframes } from '@emotion/react';

// 定义动画
const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export function LoadingHolder({ sx = {} }: { sx: any }) {
  return (
    <Box sx={{ ...sx }}>
      <Loading
        color="neutral"
        sx={{
          width: 36,
          height: 36,
          animation: `${spinAnimation} 1s linear infinite`,
          '-webkit-animation': `${spinAnimation} 1s linear infinite`,
          margin: 'auto',
        }}
      />
    </Box>
  );
}

export default LoadingHolder;
