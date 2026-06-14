'use client';
import { Stack, Link } from '@castlery/fortress';
import type { GlobalReviewSummary } from '@castlery/modules-product-domain';
import { Rating } from '@castlery/shared-components';
import { useTrackingTags } from '@castlery/modules-tracking-components';

export interface GlobalReviewProps {
  reviews: GlobalReviewSummary;
  href?: string;
  outerModuleName?: string;
  isExternalFlag?: boolean;
  defaultClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function GlobalReview({
  outerModuleName = '',
  reviews,
  href,
  isExternalFlag = false,
  defaultClick,
}: GlobalReviewProps) {
  const { average_rating, total_count } = reviews || {};
  const trackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: `Reviews Link`,
  });

  return (
    <Stack direction={'row'} spacing={1} alignItems={'center'}>
      <Stack direction={'row'} sx={{ alignItems: 'center' }}>
        <Rating
          rating={Number(average_rating)}
          margin={2}
          size={18}
          innerType="outline"
          innerColor={'#A45B37'}
          outerColor={'#A45B37'}
        />
      </Stack>
      <Link
        {...trackingTags}
        href={href}
        underline="always"
        sx={{
          color: (theme) => theme.palette.brand.charcoal[800],
          textDecorationColor: (theme) => theme.palette.brand.charcoal[800],
        }}
        {...(!isExternalFlag ? { onClick: defaultClick } : {})}
      >
        {total_count} {Number(total_count) > 1 ? 'Reviews' : 'Review'}
      </Link>
    </Stack>
  );
}

export default GlobalReview;
