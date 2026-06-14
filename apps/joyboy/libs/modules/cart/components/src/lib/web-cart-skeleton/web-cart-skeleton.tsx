'use client';
import { Stack, Skeleton, useBreakpoints, Typography, Divider } from '@castlery/fortress';
import { WebCartLayout } from '../web-cart-layout/web-cart-layout';

export function WebCartSkeleton() {
  const { desktop, mobile, tablet, md } = useBreakpoints();
  const usedWidth = mobile ? 142 : md ? 200 : 240;
  const usedHeight = mobile ? 95 : md ? 135 : 133;
  const list = [1, 2];

  return (
    <WebCartLayout>
      <Stack spacing={6} sx={{ flex: 1, width: '100%' }}>
        <Typography level="h1">Your cart </Typography>

        {list.map((item, index) => (
          <>
            <Stack direction="row" spacing={6} key={index}>
              <Skeleton variant="inline" sx={{ width: usedWidth, height: usedHeight }}></Skeleton>
              <Stack direction="column" spacing={4}>
                <Skeleton variant="text" level="body2" sx={{ width: desktop ? '25vw' : mobile ? '45vw' : '50vw' }} />
                <Skeleton variant="text" level="caption1" sx={{ width: desktop ? '20vw' : mobile ? '40vw' : '45vw' }} />
                <Skeleton variant="text" level="caption2" sx={{ width: desktop ? '15vw' : mobile ? '25vw' : '30vw' }} />
              </Stack>
            </Stack>
            {index !== list.length - 1 && <Divider />}
          </>
        ))}
      </Stack>
      {desktop && <Divider orientation="vertical" />}
      <Stack spacing={6} sx={{ flex: 'none', width: '100%' }}>
        <Typography level="h2">Cart summary</Typography>
        <Stack spacing={5}>
          <Skeleton variant="text" level="body2" sx={{ width: mobile || tablet ? '100%' : md ? '25vw' : '30vw' }} />
          <Skeleton variant="text" level="body2" sx={{ width: mobile || tablet ? '100%' : md ? '25vw' : '30vw' }} />
          <Skeleton variant="text" level="body2" sx={{ width: mobile || tablet ? '100%' : md ? '25vw' : '30vw' }} />
        </Stack>
      </Stack>
    </WebCartLayout>
  );
}
