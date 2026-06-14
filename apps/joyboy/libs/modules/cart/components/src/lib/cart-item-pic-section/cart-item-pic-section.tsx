'use client';
import { Stack, Tag, Link, useBreakpoints } from '@castlery/fortress';
import { ProductReviewSummary } from '@castlery/shared-components';
import { FortressImage } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { removeClPicBgColor } from '@castlery/utils';
import { useLineItemLink } from '../hooks/useLineItemLink';
import { LineItemSchema } from '@castlery/types';
import { Suspense } from 'react';

// Layout configuration constants
// const LAYOUT_CONFIG = {
//   IMAGE_SIZE: {
//     DEFAULT: { width: 240, height: 133 },
//     MOBILE: { width: 165, height: 100 },
//     TABLET: { width: 240, height: 133 },

//     COMPACT: { width: 216, height: 120 },
//   },
//   BUNDLE_IMAGE_SIZE: {
//     DEFAULT: { width: 220, height: 110 },
//     MOBILE: { width: 136, height: 68 },
//     TABLET: { width: 220, height: 110 },
//     COMPACT: { width: 180, height: 90 },
//   },
//   MARGIN_LEFT: {
//     MOBILE: 7,
//     TABLET: 5,
//     DEFAULT: 5,
//     COMPACT: 9,
//   },
// } as const;

interface CartItemPicSectionProps {
  item: LineItemSchema;
  showReviews: boolean;
  showO2OTag: boolean;
}
export function CartItemPicSection({ item, showReviews, showO2OTag }: CartItemPicSectionProps) {
  const { mobile, md } = useBreakpoints();
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const image = item.variant.images?.[0]?.links?.mini;
  const imageUrl = image ? removeClPicBgColor(image) : '';

  const isCompactLayout = mobile || md || miniCartMode;
  const usedWidth = mobile ? 165 : isCompactLayout ? 216 : 240;
  const usedHeight = mobile ? 100 : isCompactLayout ? 120 : 133;
  const url = useLineItemLink(item);

  return (
    <Stack
      sx={{
        flex: 'none',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: usedWidth,
      }}
    >
      {showO2OTag && item.visitedInOffline && <Tag variant="outlined">Showroom pick</Tag>}
      <Stack
        sx={{
          width: usedWidth,
          height: usedHeight,
        }}
      >
        <Link href={url} underline="none">
          <FortressImage src={imageUrl} ratio={usedWidth / usedHeight} alt="product image" />
        </Link>
      </Stack>
      {showReviews && (
        <Suspense>
          <ProductReviewSummary sku={item.variant.sku} href={url} />
        </Suspense>
      )}
    </Stack>
  );
}
