import { getPriceByVariant, selectVariant, Variant } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { Box, Typography } from '@castlery/fortress';
/* eslint-disable-next-line */
export interface VariantPriceProps {}

export const VariantPrice = ({
  variant,
  minSaleQty,
  textLevel = 'body2',
}: {
  variant?: Variant;
  minSaleQty: number;
  textLevel?: string;
}) => {
  const reduxVariant = useAppSelector(selectVariant);
  if (!variant && !reduxVariant) return null;
  const currentVariant = variant || reduxVariant;
  const currentVariantPrice = getPriceByVariant(currentVariant!.price, minSaleQty, true);
  const currentVariantListPrice = getPriceByVariant(currentVariant!.list_price, minSaleQty, true);

  if (!currentVariant) return null;
  if (currentVariant.price !== currentVariant.list_price) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Typography
          level={textLevel}
          sx={{
            color: (theme) => theme.palette.brand.maroonVelvet[400],
            marginRight: '10px',
          }}
        >
          {currentVariantPrice}
        </Typography>
        <Typography
          level={textLevel}
          sx={{
            color: (theme) => theme.palette.brand.mono[500],
            textDecoration: 'line-through',
          }}
        >
          {currentVariantListPrice}
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography
        level={textLevel}
        sx={{
          color: (theme) => theme.palette.brand.maroonVelvet[400],
        }}
      >
        {currentVariantPrice}
      </Typography>
    </Box>
  );
};
