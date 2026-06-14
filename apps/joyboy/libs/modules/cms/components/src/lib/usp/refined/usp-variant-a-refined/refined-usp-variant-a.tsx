// The original USP variant order was incorrect.
// The new USP Variant A corresponds to the original USP Variant C.
'use client';
import { Sheet, Stack, Theme, Typography, useBreakpoints } from '@castlery/fortress';
import { UspVariantDataStoryblok, UspVariantAStoryblok, DataBucketStoryblok } from '@castlery/types';
import { useMemo, useState } from 'react';
import { Media } from '../../media';
import BaseLink from '../../../atoms/base-link/base-link';
import { ISbStoryData } from '@storyblok/react/dist/types';
import { PinchZoomViewer } from '@castlery/shared-components';
import { useInViewDelayedCallback } from '@castlery/modules-tracking-components';
import { EVENT_USP_IMPRESSION, EVENT_USP_CLICK } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

export interface RefinedUspVariantAProps {
  blok: UspVariantAStoryblok;
  content: ISbStoryData<DataBucketStoryblok>['content'] | undefined;
}

export function RefinedUspVariantA(props: RefinedUspVariantAProps) {
  const { blok, content } = props;
  const { enableBuiltData, title, description, media, link } = blok;
  const [open, setOpen] = useState(false);
  const { desktop, mobile } = useBreakpoints();
  const uspData = useMemo(() => content?.uspData, [content?.uspData]);
  const uspVariantA = useMemo(() => content?.uspVariantA, [content?.uspVariantA]);
  const dispatch = useAppDispatch();

  const uspRef = useInViewDelayedCallback(
    async () => {
      console.log('uspRef EVENT_USP_IMPRESSION a');
      dispatch(EVENT_USP_IMPRESSION({ uspVariant: 'usp_variant_a' }));
    },
    3000,
    {
      threshold: 0.6,
    }
  );

  const variantAData: UspVariantDataStoryblok | undefined = useMemo(() => {
    if (!enableBuiltData) {
      return {
        title: title?.[0]?.value,
        description: description?.[0]?.value,
        media: media?.[0]?.data,
        link: link?.[0]?.link,
      } as UspVariantDataStoryblok;
    }
    if (!uspData || !uspVariantA?.[0]?.dataIndex) return undefined;
    return uspData[Number(uspVariantA[0].dataIndex) - 1];
  }, [description, enableBuiltData, link, media, title, uspData, uspVariantA]);

  if (!variantAData) {
    return null;
  }

  return (
    <>
      <Sheet variant="solid">
        <Stack
          direction={desktop ? 'row' : 'column'}
          gap={(theme) => {
            return desktop ? theme.spacing(9) : theme.spacing(6);
          }}
          sx={(theme) => ({
            padding: desktop
              ? `${theme.spacing(9)} 0 0 0`
              : mobile
              ? `${theme.spacing(7)} 0 0 0`
              : `${theme.spacing(6)} 0 0 0`,
          })}
          ref={uspRef}
        >
          <Stack
            flex={0.84}
            justifyContent={'center'}
            alignItems={'flex-start'}
            sx={(theme) => ({
              paddingLeft: desktop ? theme.spacing(10) : theme.spacing(6),
              paddingRight: !desktop ? theme.spacing(6) : undefined,
            })}
          >
            <Stack gap={(theme) => (desktop ? theme.spacing(4) : theme.spacing(2))}>
              <Typography
                level={blok?.title?.[0]?.level || 'h3'}
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }}
              >
                {variantAData?.title}
              </Typography>
              <Typography
                level={blok?.description?.[0]?.level || 'body1'}
                variant="plain"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  padding: 0,
                }}
              >
                {variantAData?.description}
              </Typography>
            </Stack>
            {link[0] && variantAData?.link?.url && variantAData?.ctaText && (
              <BaseLink
                blok={{
                  ...link[0],
                  link: variantAData?.link,
                  ctaText: variantAData?.ctaText,
                  ...(!link[0]?.textLevel && {
                    textLevel: 'body1',
                  }),
                }}
                mt={(theme: Theme) => (desktop ? theme.spacing(3) : theme.spacing(2))}
                variant="primary"
                onClick={async () => {
                  dispatch(EVENT_USP_CLICK({ uspVariant: 'usp_variant_a', ctaText: variantAData?.ctaText || '' }));
                }}
              />
            )}
          </Stack>
          <Stack
            sx={{
              // ...(desktop ? { width: '48.5vw', maxWidth: 838, maxHeight: 920 } : { width: '100vw', maxHeight: 'auto' }),
              overflow: 'hidden',
              flex: '1',
            }}
          >
            <Media
              // outerModuleName={USPVariantCModuleName}
              media_url={variantAData?.media?.filename || ''}
              ratio={1}
              {...{
                objectFit: 'contain',
                onClick: () => setOpen(true),
                controls: false,
                videoConfig: {
                  ac: true,
                },
              }}
            />
          </Stack>
        </Stack>
      </Sheet>
      {variantAData && (
        <PinchZoomViewer
          open={open}
          setOpen={setOpen}
          slideImages={[
            {
              src: variantAData?.media?.filename,
              alt: variantAData?.media?.alt || 'usp image',
              width: 100,
              height: 100,
              controls: false,
            },
          ]}
          index={0}
        />
      )}
    </>
  );
}

export default RefinedUspVariantA;
