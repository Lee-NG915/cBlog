'use client';
import { Tag, Typography } from '@castlery/fortress';
import { useLineItemLink } from '../../../hooks/useLineItemLink';
import { NextFortressLink } from '../../next-fortress-link/next-fortress-link';
import { OrderHistoryItem } from '@castlery/modules-order-domain';

interface ProductTitleProps {
  item: OrderHistoryItem;
}
export function ProductTitle({ item }: ProductTitleProps) {
  const { isGift, productType, variant } = item;
  const url = useLineItemLink(item);
  const name = variant.name;
  const isLinkable = !['swatch', 'service'].includes(productType);
  if (isLinkable) {
    return (
      <NextFortressLink
        level="body1"
        endDecorator={isGift ? <Tag>GIFT</Tag> : null}
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
    <Typography level="body1" endDecorator={isGift ? <Tag>GIFT</Tag> : null}>
      {name}
    </Typography>
  );
}

export default ProductTitle;
