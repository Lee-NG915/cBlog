'use client';
import { Stack, Typography, TypographyProps } from '@castlery/fortress';
import { LocalesNamespace, formatPriceClient, useTranslation } from '@castlery/monorepo-i18n';

/**
 * The classes for the `PriceDisplay` component.
 */
export const priceDisplayClasses = {
  root: 'price-display-root',
  price: 'price-display-price',
  strikeThroughPrice: 'price-display-strike-through-price',
};
export interface PriceDisplayProps {
  /**
   * The price to display
   */
  price: string;
  /**
   * The price to display with a strike-through.
   * If provided, there will be a strike-through price displayed beside the price.
   */
  strikeThroughPrice?: string;
  /**
   * If true, the price will be displayed as "Free" if the price is 0.
   */
  showFree?: boolean;
  /**
   * If true, the strike-through price will be displayed as "Free" if the amount is 0 and there is a strike-through price.
   */
  showStrikeThroughFree?: boolean;
  /**
   * The level of the `Typography` to display.
   */
  typographyLevel?: TypographyProps['level'];
}

export function PriceDisplay({
  price,
  strikeThroughPrice,
  showFree = false,
  showStrikeThroughFree = false,
  typographyLevel = 'body1',
}: PriceDisplayProps) {
  const { t } = useTranslation(LocalesNamespace.SHARED, {
    keyPrefix: 'priceDisplay',
  });

  const priceValue = Number(price);
  const strikeThroughPriceValue = Number(strikeThroughPrice);
  const showStrikeThrough = !!strikeThroughPrice && strikeThroughPriceValue !== priceValue;

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      justifyContent="center"
      gap={2}
      className={priceDisplayClasses.root}
    >
      <Typography level={typographyLevel} className={priceDisplayClasses.price}>
        {t('price', { value: formatPriceClient(priceValue), showFree: priceValue === 0 && showFree })}
      </Typography>
      {showStrikeThrough && (
        <Typography
          level={typographyLevel}
          sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.mono[500] }}
          className={priceDisplayClasses.strikeThroughPrice}
        >
          {t('price', {
            value: formatPriceClient(strikeThroughPriceValue),
            showFree: strikeThroughPriceValue === 0 && showStrikeThroughFree,
          })}
        </Typography>
      )}
    </Stack>
  );
}

export default PriceDisplay;
