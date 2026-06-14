'use client';
// The original USP variant order was incorrect.
// The new USP Variant B corresponds to the original USP Variant A.
import { Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { UspVariantDataStoryblok, UspVariantBStoryblok, DataBucketStoryblok } from '@castlery/types';
import { useMemo, useState } from 'react';
import { Media } from '../../media';
import { ISbStoryData } from '@storyblok/react/dist/types';
import { PinchZoomViewer } from '@castlery/shared-components';
import { EVENT_USP_IMPRESSION } from '@castlery/modules-tracking-services';
import { useInViewDelayedCallback } from '@castlery/modules-tracking-components';
import { useAppDispatch } from '@castlery/shared-redux-store';

export interface RefinedUspVariantBProps {
  blok: UspVariantBStoryblok;
  content: ISbStoryData<DataBucketStoryblok>['content'] | undefined;
}

export function RefinedUspVariantB(props: RefinedUspVariantBProps) {
  const { blok, content } = props;
  const dispatch = useAppDispatch();
  const { enableBuiltData, title, description, media, link } = blok;
  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const { desktop, mobile, tablet } = useBreakpoints();
  const uspData = useMemo(() => content?.uspData, [content?.uspData]);
  const uspVariantB = useMemo(() => content?.uspVariantB, [content?.uspVariantB]);

  const uspRef = useInViewDelayedCallback(
    async () => {
      console.log('uspRef EVENT_USP_IMPRESSION b');
      dispatch(EVENT_USP_IMPRESSION({ uspVariant: 'usp_variant_b' }));
    },
    3000,
    {
      threshold: 0.6,
    }
  );

  const variantBData: UspVariantDataStoryblok[] | undefined = useMemo(() => {
    if (!enableBuiltData) {
      return [
        {
          title: title?.[0]?.value,
          description: description?.[0]?.value,
          media: media?.[0]?.data,
          link: link?.[0]?.link,
        },
      ] as UspVariantDataStoryblok[];
    }

    if (!uspData || !uspVariantB || uspVariantB.length < 1) return undefined;
    return uspVariantB
      ?.filter((item) => item?.dataIndex)
      ?.map((item) => uspData[Number(item.dataIndex) - 1])
      ?.filter((item) => item);
  }, [description, enableBuiltData, link, media, title, uspData, uspVariantB]);

  if (!variantBData) {
    return null;
  }
  return (
    <>
      <Sheet variant="solid">
        <Stack
          direction={desktop ? 'row' : 'column'}
          sx={(theme) => ({
            padding: desktop
              ? `${theme.spacing(9)} ${theme.spacing(7)} ${theme.spacing(9)} ${theme.spacing(7)}`
              : `${theme.spacing(7)} 0 0 0`,
            //  mobile
            // ? `${theme.spacing(7)} 0 0 0`
            // : `${theme.spacing(6)} 0 0 0`,
          })}
          justifyContent={'space-evenly'}
          gap={(theme) => theme.spacing(7)}
          ref={uspRef}
        >
          {variantBData?.map((item, index) => (
            <>
              <Stack
                key={item?._uid}
                flex={1}
                sx={{
                  gap: desktop ? 6 : 5,
                }}
              >
                <Media
                  media_url={item.media?.filename}
                  ratio={variantBData.length === 2 ? 1.31 : 1}
                  {...{
                    onClick: () => {
                      setOpenIndex(index);
                      setOpen(true);
                    },
                    controls: false,
                    videoConfig: {
                      ac: true,
                    },
                  }}
                />
                <Stack
                  sx={(theme) => ({
                    gap: desktop ? 5 : 4,
                    padding: tablet ? theme.spacing(6) : theme.spacing(4),
                    maxWidth: '100%',
                    // maxHeight: desktop ? 'auto' : theme.spacing(25),
                  })}
                  alignItems={'center'}
                >
                  <Typography
                    level={blok?.title?.[0]?.level || 'h3'}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item?.title}
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
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      padding: 0,
                    }}
                  >
                    {item?.description}
                  </Typography>
                </Stack>
              </Stack>
            </>
          ))}
        </Stack>
      </Sheet>
      {variantBData && variantBData.length > 0 && (
        <PinchZoomViewer
          open={open}
          setOpen={setOpen}
          slideImages={variantBData?.map((item, index) => {
            if (item?.media?.content_type?.includes('video')) {
              return {
                type: 'video',
                src: item?.media?.filename,
                alt: item?.media?.alt || 'usp video',
                width: 100,
                height: 100,
                controls: false,
                assetType: item?.media?.content_type,
                assetPosition: index + 1,
              };
            }
            return {
              type: 'image',
              src: item?.media?.filename,
              alt: item?.media?.alt || 'usp image',
              width: 100,
              height: 100,
              controls: false,
              assetType: item?.media?.content_type,
              assetPosition: index + 1,
            };
          })}
          index={openIndex}
        />
      )}
    </>
  );
}

export default RefinedUspVariantB;
