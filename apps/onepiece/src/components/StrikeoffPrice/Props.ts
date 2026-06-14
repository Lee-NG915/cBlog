import type { TypographyProps } from '@castlery/fortress/Typography';
import type { StackProps } from '@castlery/fortress';

export interface StrikeoffPriceProps {
  price: number | string;
  strikeoffPrice: number | string;
  showStrikeoffPrice?: boolean;
  priceProps?: TypographyProps;
  strikeoffPriceProps?: TypographyProps;
  containerProps?: StackProps;
}
