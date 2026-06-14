'use client';
import { Tag, Typography } from '@castlery/fortress';
import type { LineItem_V2 } from '@castlery/types';
import { useLineItemLink } from '../../hooks/use-line-item-name';
import { ProductTypeMapping } from '@castlery/config';
import { NextFortressLink } from '@castlery/shared-components';

// 需要收拢CartItemName
interface ProductItemNameProps {
  item: LineItem_V2;
}
export function ProductItemName({ item }: ProductItemNameProps) {
  const url = useLineItemLink(item);
  const name = item.variant.name;
  const isGift = item.isGift;
  const endDecorator = <>{isGift && <Tag>GIFT</Tag>}</>;
  const isLinkable = ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(item.productType);
  if (isLinkable) {
    return (
      <NextFortressLink
        level="body1"
        endDecorator={endDecorator}
        href={url}
        target="_blank"
        underline="hover"
        sx={{
          color: (theme) => theme.palette.brand.maroonVelvet[500],
        }}
      >
        {name}
      </NextFortressLink>
    );
  }
  return (
    <Typography level="body1" endDecorator={endDecorator}>
      {name}
    </Typography>
  );
}

export default ProductItemName;
