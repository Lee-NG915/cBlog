'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import CmsText from '../../cms-text/cms-text';
import CmsLink from '../../cms-link/cms-link';
import type { UspVariantCV2 } from '../../../types';
import { Media } from '../media';
import { storyblokEditable } from '@storyblok/react/rsc';
import { USPVariantCModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';

export interface UspVariantCProps {
  blok: UspVariantCV2;
}
export function UspVariantC({ blok }: UspVariantCProps) {
  const { desktop, tablet } = useBreakpoints();
  const { link, title_style, description_style, media_position = 'right', data_source } = blok;
  const { title, description, media, cta_url, cta_text } = data_source;
  const titleBlok = { ...title_style[0], text: title };
  const descriptionBlok = { ...description_style[0], text: description };
  const ctaBlok = cta_url
    ? [{ ...(link?.[0] || {}), display_text: cta_text || link?.[0]?.display_text, url_external_internal: cta_url }]
    : null;

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={USPVariantCModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      direction={desktop ? (media_position === 'right' ? 'row' : 'row-reverse') : 'column'}
      sx={{
        maxWidth: 1728,
        background: (theme) => theme.palette.brand.flour[50],
        justifyContent: 'space-between',
        alignItems: 'center',
        py: desktop ? '60px' : tablet ? 6 : 4,
        gap: desktop ? '60px' : 2,
      }}
    >
      <Stack
        sx={{
          gap: desktop ? 3 : 1,
          flex: 1,
          alignItems: 'flex-start',
          ...(desktop ? { pl: media_position === 'right' ? '60px' : '0px' } : { px: 3 }),
        }}
      >
        <Stack gap={1}>
          <CmsText blok={titleBlok} />
          <CmsText blok={descriptionBlok} />
        </Stack>
        {ctaBlok && ctaBlok?.length > 0 && <CmsLink outerModuleName={USPVariantCModuleName} blok={ctaBlok[0]} />}
      </Stack>
      <Stack
        sx={{
          ...(desktop ? { width: '48.5vw', maxWidth: 838, maxHeight: 920 } : { width: '100vw', maxHeight: 'auto' }),
          overflow: 'hidden',
          flex: 'none',
        }}
      >
        <Media
          outerModuleName={USPVariantCModuleName}
          media_url={media?.filename}
          ratio={desktop ? 838 / 720 : 390 / 365}
          objectFit="contain"
        />
      </Stack>
    </DtStack>
  );
}

export default UspVariantC;
