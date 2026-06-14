/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { EcEnv } from '@castlery/config';
import { Box, Link, Sheet, Stack, Typography } from '@castlery/fortress';
import { selectSortedSocialUgc, selectVariant } from '@castlery/modules-product-domain';
import { getProductSocialUgcByVariantCommand } from '@castlery/modules-product-services';
import { useAppDispatch, useSelector } from '@castlery/shared-redux-store';
import { useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';
import { useWidgetCollection } from '../../hooks/use-widget-collection';
import { SocialUgcCarousel } from './components/social-ugc-carousel';
import { DYRecommendationCarousel, TemplateDiversion } from '@castlery/shared-components';

interface ProductSocialUgcClientProps {
  pageType: 'pdp' | 'pla';
}

export function ProductSocialUgcClient({ pageType }: ProductSocialUgcClientProps) {
  // rtk query 调用 ugc 接口
  const dispatch = useAppDispatch();
  const variant = useSelector(selectVariant);
  const [ugcLoading, setUgcLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setUgcLoading(true);
    dispatch(getProductSocialUgcByVariantCommand()).finally(() => {
      if (!cancelled) setUgcLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch, variant?.id]); // variant?.id drives re-fetch when the selected variant changes
  const socialSortedUgc = useSelector(selectSortedSocialUgc);
  const { collection, product } = useWidgetCollection();

  // Only hide the section when we've confirmed there's no UGC data (after fetch completes).
  // Keeping ugcLoading=true during fetch prevents CLS caused by the Sheet collapsing
  // when navigating between products (new variant IDs not yet in Redux state).
  if (!ugcLoading && socialSortedUgc?.length === 0) {
    return null;
  }

  return (
    <>
      {pageType === 'pdp' && (
        <LazyLoad offset={300} once placeholder={<Box sx={{ height: { xs: '470px', sm: '486px', md: '592px' } }} />}>
          {/* <DYRecommendationCarousel
            selector_name="PDP Rec API - Top"
            pendingNode={<Box sx={{ height: { xs: '470px', sm: '486px', md: '592px' } }} />}
          /> */}
          <TemplateDiversion
            selector_name="PDP Rec API - Top"
            pendingNode={<Box sx={{ height: { xs: '470px', sm: '486px', md: '592px' } }} />}
          />
        </LazyLoad>
      )}
      <Sheet
        variant="solid"
        data-section="social-ugc"
        sx={(theme) => ({
          py: { xs: theme.spacing(7), md: theme.spacing(9) },
          px: { md: theme.spacing(7) },
        })}
      >
        <Stack justifyContent={'center'} alignItems={'center'}>
          <Stack
            justifyContent={'center'}
            alignItems={'flex-start'}
            sx={{
              width: '100%',
            }}
            px={{ xs: 6, md: 0 }}
          >
            <Typography level="h2" mb={2}>
              #AtHomewithCastlery
            </Typography>
            <Typography level="body1" variant="plain">
              Be inspired by real homes
              <Link
                href={`https://www.instagram.com/castlery${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/?hl=en`}
                level="body1"
                variant="primary"
                target="_blank"
                sx={{
                  display: 'inline',
                  textDecoration: 'none',
                }}
              >
                {/* feature flag */}
                @castlery{EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}
              </Link>
            </Typography>
          </Stack>
          <SocialUgcCarousel socialSortedUgc={socialSortedUgc} />
        </Stack>
      </Sheet>
    </>
  );
}
