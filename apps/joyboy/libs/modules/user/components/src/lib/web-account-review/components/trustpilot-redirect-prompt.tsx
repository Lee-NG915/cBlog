'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { trackGeneralLinkRedirectEvent, trackGeneralSubmitFormEvent } from '@castlery/modules-tracking-services';
import { getThirdPartyReviewConfig, ThirdPartyReviewVariant } from './third-party-review-config';

const COUNTDOWN_SECONDS = 10;

export { getThirdPartyReviewConfig };
export type { ThirdPartyReviewVariant };

export function TrustpilotRedirectPrompt({ mobile, active = false }: { mobile: boolean; active?: boolean }) {
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const hasRedirectedRef = useRef(false);
  // 客户端随机分流（仅影响 AU 市场）：50% 走 primary(Google Maps)，50% 走 secondary(ProductReview)。
  // 该组件只在用户提交五星好评后的纯客户端交互中渲染，不参与 SSR/hydration，故懒初始化随机数是安全的。
  const [reviewVariant] = useState<ThirdPartyReviewVariant>(() => (Math.random() < 0.5 ? 'primary' : 'secondary'));
  const thirdPartyReviewConfig = useMemo(
    () => getThirdPartyReviewConfig(EcEnv.NEXT_PUBLIC_COUNTRY, reviewVariant),
    [reviewVariant]
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    if (countdown <= 0) {
      if (hasRedirectedRef.current) {
        return;
      }

      hasRedirectedRef.current = true;
      dispatch(
        trackGeneralLinkRedirectEvent({
          label: thirdPartyReviewConfig.website,
          link: thirdPartyReviewConfig.redirectUrl,
        })
      );
      // 倒计时结束跳转第三方评价页时的表单提交埋点
      dispatch(
        trackGeneralSubmitFormEvent({
          action: 'product_review submit',
          label: thirdPartyReviewConfig.trackingLabel,
        })
      );
      window.location.href = thirdPartyReviewConfig.redirectUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [active, countdown, dispatch, thirdPartyReviewConfig]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: mobile ? 10 : 24,
        gap: 5,
        textAlign: 'center',
      }}
    >
      <Typography level="h4">
        {thirdPartyReviewConfig.promptText}
        <Box component="span" sx={{ color: 'var(--fortress-palette-brand-burntOrange-500)' }}>
          {countdown}
        </Box>{' '}
        seconds.
      </Typography>
      <Typography level="body1" sx={{ color: 'var(--fortress-palette-brand-maroonVelvet-300)' }}>
        Your review has been copied for easy pasting and sharing.
      </Typography>
    </Box>
  );
}
