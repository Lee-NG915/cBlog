'use client';
import { List, ListItem, Stack, useBreakpoints, typographyClasses, listItemClasses } from '@castlery/fortress';
import type { UspVariantAV2 } from '../../../types';
import { CmsText } from '../../cms-text/cms-text';
import { Media, mediaClasses } from '../media';
import { storyblokEditable } from '@storyblok/react/rsc';
import { USPVariantAModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';

interface UspVariantAProps {
  blok: UspVariantAV2;
}
export function UspVariantA({ blok }: UspVariantAProps) {
  const { title_style, description_style, data_source } = blok || {};
  const { desktop, mobile, tablet } = useBreakpoints();

  const isTowColumnsLayout = Array.isArray(data_source?.list) && data_source?.list?.length === 2;

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={USPVariantAModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        maxWidth: 1728,
      }}
    >
      <List
        sx={{
          width: '100%',
          alignItems: 'flex-start',
          ...(mobile && {
            display: 'grid',
            gridTemplateColumns: '1fr',
            px: 3,
            py: 4,
            gap: 4,
          }),
          ...(desktop && {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            px: 4,
            py: '60px',
            gap: isTowColumnsLayout ? 7 : '31px',
            [`.${listItemClasses.root}`]: {
              flex: 1,
              width: '100%',
              maxWidth: isTowColumnsLayout ? 720 : 534,
            },
          }),
          ...(tablet && {
            px: 3,
            py: 6,
            display: 'flex',
            flexFlow: isTowColumnsLayout ? 'column wrap' : 'row wrap',
            justifyContent: 'center',
            rowGap: 4,
            columnGap: isTowColumnsLayout ? 4 : '36px',
            [`.${listItemClasses.root}`]: {
              flex: isTowColumnsLayout ? 1 : '1 1 40%',
              maxWidth: isTowColumnsLayout ? 'auto' : 342,
            },
          }),
        }}
      >
        {Array.isArray(data_source?.list) &&
          data_source.list.map((item, index) => {
            const { title, description, media } = item || {};
            const titleBlok = { ...title_style[0], text: title };
            const descriptionBlok = { ...description_style[0], text: description };
            return (
              <ListItem
                key={index}
                sx={{
                  p: 0,
                }}
              >
                <Stack
                  sx={{
                    width: '100%',
                    gap: desktop || (tablet && isTowColumnsLayout) ? 3 : 2,
                    [`.${typographyClasses.root}`]: {
                      textAlign: 'center',
                    },
                    [`& .${mediaClasses.root}`]: {
                      width: '100%',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      '& video': {
                        borderRadius: '10px',
                      },
                    },
                  }}
                >
                  <Media
                    outerModuleName={USPVariantAModuleName}
                    media_url={media?.filename}
                    ratio={isTowColumnsLayout ? (desktop || tablet ? 720 / 540 : 1) : 1}
                  />
                  <Stack
                    gap={desktop ? 2 : tablet ? (isTowColumnsLayout ? 2 : 1) : 1}
                    sx={{
                      px: desktop ? (isTowColumnsLayout ? 3 : 2) : 0,
                    }}
                  >
                    <CmsText blok={titleBlok} />
                    <CmsText blok={descriptionBlok} />
                  </Stack>
                </Stack>
              </ListItem>
            );
          })}
      </List>
    </DtStack>
  );
}

export default UspVariantA;
