'use client';

import { Box, Stack, Typography } from '@castlery/fortress';
import { useCallback } from 'react';
import { SellFilled } from '@castlery/fortress/Icons';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { useFirstInView } from '@castlery/modules-tracking-components';

interface ProductDyPromotionItemProps {
  selector: string;
  // data tracking prop
  rank: string;
  promotionData?: any;
  onImpression: (selector: string, rank: string) => void;
}

export const ProductDyPromotionItem = (props: ProductDyPromotionItemProps) => {
  const { promotionData, rank, selector, onImpression } = props;
  const dispatch = useAppDispatch();

  const containerRef = useFirstInView(
    () => {
      if (!promotionData) return;
      onImpression(selector, rank);
    },
    {
      threshold: 0.8,
    }
  );

  // 处理点击事件
  const handlePromotionClick = useCallback(
    async (event: React.MouseEvent) => {
      let href = '';
      const aTagElement = (event.target as HTMLElement).closest('a');
      if (aTagElement && aTagElement.tagName === 'A') {
        href = aTagElement.getAttribute('href') || '';
      }

      const reportEvent = () => {
        dispatch(
          EVENT_PDP_DETAILS({
            action: `click_product_promotion${rank}`,
          })
        );
      };

      // 处理链接跳转
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        reportEvent();
        if (href) {
          window.location.href = href;
        }
      } else {
        reportEvent();
      }
    },
    [dispatch, rank]
  );

  // 处理模板内的链接点击
  const handleTemplateClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        const target = event.target;
        if (target.tagName === 'A' || target.tagName === 'B') {
          handlePromotionClick(event);
        }
      }
    },
    [handlePromotionClick]
  );

  return (
    <Stack ref={containerRef as any} direction="row" alignItems="flex-start" gap={1}>
      <>
        <SellFilled
          sx={{
            width: 20,
            height: 20,
            color: 'var(--fortress-palette-brand-burntOrange-500)',
          }}
        />
        {/* 渲染 DY 模板内容 */}
        <Typography
          variant="plain"
          level="caption1"
          sx={{
            width: '100%',
            '& a': {
              color: 'var(--fortress-palette-brand-burntOrange-500) !important',
            },
            py: 0,
            px: 0,
          }}
        >
          <Box
            sx={{
              a: {
                ml: 1,
              },
            }}
            dangerouslySetInnerHTML={{
              __html: promotionData?.templateCode,
            }}
            onClick={handleTemplateClick}
          />
        </Typography>
      </>
    </Stack>
  );
};
