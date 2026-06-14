'use client';
import { Box, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { LinkBlokV2, TextBlokV2 } from '@castlery/modules-cms-domain';
import { FortressImage } from '@castlery/shared-components';
import CmsText from '../cms-text/cms-text';
import CmsLink from '../cms-link/cms-link';
import { DtStack } from '@castlery/modules-tracking-components';

export const moduleName = 'Blog Banner';

interface CmsBlogBannerProps {
  blok: {
    _uid: string;
    title: TextBlokV2[];
    cta_link: LinkBlokV2[];
    component: string;
    background_color: {
      value: string;
      plugin: string;
    };
    _editable: string;
    dyCampaignData: any;
  };
}

export function CmsBlogBanner(props: CmsBlogBannerProps) {
  const { blok } = props;
  const { desktop } = useBreakpoints();
  const { title, cta_link, background_color, dyCampaignData } = blok || {};
  const items = dyCampaignData?.hitVariation?.slots;
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasItems) {
    return null;
  }
  const { blog_description, image_url, name, url } = items[0]?.productData || {};
  return (
    <DtStack useImpression uid={blok?._uid} componentName={blok?.component} flexDirection={desktop ? 'row' : 'column'}>
      <Box
        sx={{
          flex: desktop ? 6 : 1,
        }}
      >
        <FortressImage src={image_url} alt={'blog-banner-image'} objectFit="cover" ratio={1.5} />
      </Box>
      <Stack
        sx={{
          flex: desktop ? 4 : 1,
          ...(background_color && {
            backgroundColor: background_color?.value,
          }),
          padding: desktop ? '0 48px' : '32px 24px',
        }}
        justifyContent={'center'}
        alignItems={'center'}
      >
        {title[0] && title[0]?.text ? (
          <CmsText
            blok={title[0]}
            sx={{
              textAlign: 'center',
            }}
          />
        ) : (
          <Typography
            level={title[0]?.text_level || 'h1'}
            sx={{
              ...(title[0] && {
                color: title[0]?.text_color?.value,
                fontWeight: title[0]?.font_weight,
                fontFamily: title[0]?.font_family,
                textAlign: 'center',
              }),
            }}
          >
            {name}
          </Typography>
        )}
        <Typography
          level={'body1'}
          sx={{
            color: 'var(--fortress-palette-brand-flour-10)',
            textAlign: 'center',
            margin: desktop ? '16px 0 24px 0' : '16px 0',
            fontSize: desktop ? '18px' : '14px',
          }}
        >
          {blog_description}
        </Typography>
        {cta_link[0] && (
          <CmsLink
            outerModuleName={moduleName}
            blok={Object.assign(cta_link[0], {
              url_external_internal: cta_link[0]?.url_external_internal || url,
            })}
          />
        )}
      </Stack>
    </DtStack>
  );
}

export default CmsBlogBanner;
