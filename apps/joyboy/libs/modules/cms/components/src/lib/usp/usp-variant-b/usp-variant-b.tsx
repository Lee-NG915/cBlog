'use client';
import { Stack, useBreakpoints, typographyClasses } from '@castlery/fortress';
import { CmsText } from '../../cms-text/cms-text';
import { CmsLink } from '../../cms-link/cms-link';
import { Media, mediaClasses } from '../media';
import { storyblokEditable } from '@storyblok/react/rsc';
import { USPVariantBModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';

export function UspVariantB({ blok }: any) {
  const { desktop, tablet } = useBreakpoints();
  const { title_style, description_style, link, data_source } = blok;
  const { list } = data_source;

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={USPVariantBModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        py: desktop ? '60px' : tablet ? 6 : 4,
        px: 3,
        rowGap: 4,
        maxWidth: 1728,
      }}
    >
      {Array.isArray(list) &&
        list.map((item: any, index: number) => {
          const { title, description, cta_text, cta_url, media } = item || {};

          return (
            <Stack
              key={item._uid}
              direction={desktop ? (index === 0 ? 'row' : 'row-reverse') : 'column'}
              sx={{
                alignItems: 'center',
                gap: desktop ? 7 : 2,
                width: 'inherit',

                [`& .${mediaClasses.root}`]: {
                  borderRadius: 15,
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: desktop ? 800 : 'auto',
                  [`& video`]: {
                    borderRadius: 15,
                  },
                },
              }}
            >
              <Media
                media_url={media?.filename}
                ratio={desktop ? 800 / 600 : tablet ? 720 / 540 : 1}
                outerModuleName={USPVariantBModuleName}
              />
              <Stack
                gap={desktop ? 2 : 1}
                sx={{
                  maxWidth: 'auto',
                  alignItems: desktop ? 'flex-start' : 'center',
                  [`& .${typographyClasses.root}`]: {
                    textAlign: desktop ? 'left' : 'center',
                  },
                }}
              >
                <CmsText blok={{ ...title_style[0], text: title }} />
                <CmsText blok={{ ...description_style[0], text: description }} />
                {!!cta_text && (
                  <CmsLink
                    outerModuleName={USPVariantBModuleName}
                    blok={{
                      ...link[0],
                      display_text: cta_text,
                      url_external_internal: cta_url,
                    }}
                  />
                )}
              </Stack>
            </Stack>
          );
        })}
    </DtStack>
  );
}

export default UspVariantB;
