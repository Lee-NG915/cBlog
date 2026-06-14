'use client';

import { Box, IconButton, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { StandardInfo } from '@castlery/fortress/Icons';
import { Product, Variant } from '@castlery/modules-product-domain';
import { useMemo } from 'react';

interface ComfortRatingProps {
  product?: Product;
  variant?: Variant;
  name: string;
  totalScore: number;
  minScorePresentation?: string;
  maxScorePresentation?: string;
  handleDrawerOpen?: (open: boolean) => void;
  handleInfoClick?: (explanation: string) => void;
}

export const ComfortRating = (props: ComfortRatingProps) => {
  const {
    product,
    variant,
    name,
    totalScore,
    minScorePresentation,
    maxScorePresentation,
    handleDrawerOpen,
    handleInfoClick,
  } = props;
  const { mobile } = useBreakpoints();
  const targetRating = useMemo(() => {
    return (
      variant?.variant_properties?.comfort_ratings?.find((it) => it.name === name) ||
      product?.product_properties?.comfort_ratings?.find((it) => it.name === name)
    );
  }, [name, product, variant]);

  if (!targetRating) {
    return null;
  }

  return (
    <Stack
      py={mobile ? 3 : 5}
      sx={{
        border: '0.5px solid var(--fortress-palette-brand-mono-200)',
      }}
    >
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <Typography
          level="subh3"
          endDecorator={
            targetRating?.explanation && (
              <IconButton
                type="button"
                onClick={() => {
                  handleInfoClick?.(targetRating?.explanation || '');
                  handleDrawerOpen?.(true);
                }}
                sx={{
                  width: '20px',
                  height: '20px',
                  svg: {
                    path: {
                      fill: 'var(--fortress-palette-brand-mono-900)',
                    },
                  },
                }}
              >
                <StandardInfo sx={{ width: '20px', height: '20px' }} />
              </IconButton>
            )
          }
          sx={{ textTransform: 'uppercase' }}
        >
          {targetRating?.presentation}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="center" alignItems="center" mt={3}>
        {minScorePresentation && (
          <Typography
            level="caption1"
            sx={{
              flex: '1 1 0',
              textAlign: 'right',
            }}
          >
            {minScorePresentation}
          </Typography>
        )}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          mx={4}
          spacing={2}
          sx={{
            flex: '0 0 auto',
          }}
        >
          {targetRating?.value && (
            <>
              {Array.from({ length: totalScore }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: mobile ? 24 : 32,
                    height: 12,
                    bgcolor:
                      Number(targetRating?.value) - 1 === index
                        ? 'var(--fortress-palette-primary-500)'
                        : 'var(--fortress-palette-primary-100)',
                  }}
                />
              ))}
            </>
          )}
        </Stack>
        {maxScorePresentation && (
          <Typography
            level="caption1"
            sx={{
              flex: '1 1 0',
              textAlign: 'left',
            }}
          >
            {maxScorePresentation}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
