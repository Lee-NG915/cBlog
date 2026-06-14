'use client';

import { Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { DYRecommendationCarousel } from '@castlery/shared-components';
// import { DYRecommendationCarousel } from '@castlery/modules-product-components';

const PageNotFoundContainer = () => {
  const { desktop } = useBreakpoints();
  return (
    <Container
      sx={{
        ...(!desktop && {
          padding: '0 !important',
        }),
      }}
    >
      <Stack
        alignItems="center"
        sx={(theme) => ({
          padding: desktop ? `${theme.spacing(24)} ${theme.spacing(8)}` : `${theme.spacing(10)} ${theme.spacing(6)}`,
          backgroundColor: theme.palette.brand.warmLinen[300],
        })}
      >
        <Typography
          level="h1"
          sx={(theme) => ({ mb: desktop ? theme.spacing(10) : theme.spacing(6), textAlign: 'center' })}
        >
          This page can't be found!
        </Typography>
        <Typography level="body1" textAlign="center">
          It may have been moved, retired or updated.
        </Typography>
      </Stack>
      <DYRecommendationCarousel selector_name="LP 404 (API)" />
    </Container>
  );
};

export { PageNotFoundContainer };
