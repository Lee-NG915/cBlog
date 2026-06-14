'use client';

import { Box, Typography, useBreakpoints } from '@castlery/fortress';
import { Product, Variant } from '@castlery/modules-product-domain';

/* eslint-disable-next-line */
export interface WebHeadProps {
  variant: Variant | undefined;
  productData: Product | undefined;
  scrollToReview?: Function; // todo
  reviewsSummary?: Object; // todo
  discontinued?: boolean; // todo
}

export function WebHead(props: WebHeadProps) {
  const { variant, productData, discontinued } = props;
  const { mobile, desktop } = useBreakpoints();
  return (
    <Box
      sx={{
        ...(mobile && {
          padding: '0 15px',
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {productData?.name && (
          <Box>
            <Typography
              level="h1"
              sx={{
                fontSize: '28px',
                fontWeight: 'normal',
                lineHeight: '1.2',
                paddingRight: '20px',
                margin: 0,
                ...(desktop && {
                  fontSize: '32px',
                  lineHeight: 'var(--fortress-lineHeight-sm)',
                }),
              }}
            >
              {productData?.name}
              {/* TODO */}
              {variant ? variant?.badges : null}
            </Typography>
          </Box>
        )}
        {!discontinued && <Box>placeholder</Box>}
      </Box>
      <Box>review data</Box>
      <Box>price component</Box>
    </Box>
  );
}

export default WebHead;
