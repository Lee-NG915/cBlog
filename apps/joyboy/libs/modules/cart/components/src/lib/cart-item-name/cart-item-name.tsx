'use client';
import { Tag, Typography, useBreakpoints } from '@castlery/fortress';
import type { LineItemSchema, GiftLineItemSchema } from '@castlery/types';
import { useLineItemLink } from '../hooks/useLineItemLink';
import { ProductTypeMapping, accessInWeb } from '@castlery/config';
import { NextFortressLink } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useMemo } from 'react';
import { useCloseMiniCartOnNavigate } from '../hooks/useCloseMiniCartOnNavigate';

interface CartItemNameProps {
  item: LineItemSchema | GiftLineItemSchema;
}
export function CartItemName({ item }: CartItemNameProps) {
  const { mobile } = useBreakpoints();
  const url = useLineItemLink(item as LineItemSchema);
  const isMiniCartMode = useAppSelector(selectMiniCartMode);
  const isCompactLayout = mobile || isMiniCartMode;
  const handleLinkClick = useCloseMiniCartOnNavigate();

  const name = item.variant.productName || item.variant.name;
  const skuName = item.variant.name;
  const isGift = item.isGift || item.giftPoolId;
  const endDecorator = useMemo(() => {
    let text;
    if (isGift) text = 'Gift';

    return text ? (
      <Tag>
        <Typography level="caption2" sx={{ color: 'inherit' }}>
          {text}
        </Typography>
      </Tag>
    ) : null;
  }, [isGift]);

  const isLinkable = ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(
    item.productType as ProductTypeMapping
  );

  const fontLevel = isCompactLayout ? 'body2' : 'h5';

  if (isLinkable) {
    if (accessInWeb) {
      return (
        <NextFortressLink
          level={fontLevel}
          variant="primary"
          endDecorator={endDecorator}
          href={url}
          onClick={handleLinkClick}
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
      <Typography level={fontLevel} endDecorator={endDecorator}>
        {name}
      </Typography>
    );
  }
  return (
    <Typography level={fontLevel} endDecorator={endDecorator}>
      {skuName}
    </Typography>
  );
}

export default CartItemName;
