'use client';
import { Tag, Typography } from '@castlery/fortress';
import { NextFortressLink } from '../../next-fortress-link/next-fortress-link';
import { OrderLineItemV1, TagV1 } from '@castlery/types';
// import { useOrderHistoryLineItemLink } from '../../../hook/useLineItemLink';
import { accessInPos } from '@castlery/config';

interface ProductTitleV1Props {
  item: OrderLineItemV1;
}

// 缺失字段：productType, variant
export function ProductTitleV1({ item }: ProductTitleV1Props) {
  const { isGift, productType, onepieceProductPageUrl, tags, productName, listName } = item;
  // const url = useOrderHistoryLineItemLink(item);
  const isClearance = Array.isArray(tags) && tags?.some((tag: TagV1) => tag.name === 'clearance');
  const isLinkable = !['swatch', 'service'].includes(productType);

  if (isLinkable) {
    if (accessInPos) {
      return (
        <Typography level="body1" endDecorator={isGift ? <Tag>GIFT</Tag> : isClearance ? <Tag>CLEARANCE</Tag> : null}>
          {productName}
        </Typography>
      );
    }
    return (
      <NextFortressLink
        level="body1"
        endDecorator={isGift ? <Tag>GIFT</Tag> : isClearance ? <Tag>CLEARANCE</Tag> : null}
        href={onepieceProductPageUrl}
        target="_blank"
        underline="hover"
        sx={{
          color: (theme) => theme.palette.brand.maroonVelvet[500],
          alignItems: 'self-start',
        }}
      >
        {productName}
      </NextFortressLink>
    );
  }
  return (
    <Typography level="body1" endDecorator={isGift ? <Tag>GIFT</Tag> : isClearance ? <Tag>CLEARANCE</Tag> : null}>
      {listName}
    </Typography>
  );
}

export default ProductTitleV1;
