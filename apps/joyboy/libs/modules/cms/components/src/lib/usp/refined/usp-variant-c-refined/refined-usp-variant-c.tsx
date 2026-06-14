// The original USP variant order was incorrect.
// The new USP Variant C corresponds to the original USP Variant B.
'use client';

import { Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { UspVariantDataStoryblok, UspVariantCStoryblok, DataBucketStoryblok } from '@castlery/types';
import { useMemo, useState } from 'react';
import { Media } from '../../media';
import BaseLink from '../../../atoms/base-link/base-link';
import { ISbStoryData } from '@storyblok/react/dist/types';
import { PinchZoomViewer } from '@castlery/shared-components';
import { useInViewDelayedCallback } from '@castlery/modules-tracking-components';
import { EVENT_USP_IMPRESSION, EVENT_USP_CLICK } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
export interface RefinedUspVariantCProps {
  blok: UspVariantCStoryblok;
  content: ISbStoryData<DataBucketStoryblok>['content'] | undefined;
}

export function RefinedUspVariantC(props: RefinedUspVariantCProps) {
  const { blok, content } = props;
  const dispatch = useAppDispatch();
  const { enableBuiltData, title, description, media, link } = blok;
  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const { desktop, tablet, mobile } = useBreakpoints();
  const uspData = useMemo(() => content?.uspData, [content?.uspData]);
  const uspVariantC = useMemo(() => content?.uspVariantC, [content?.uspVariantC]);

  const uspRef = useInViewDelayedCallback(
    async () => {
      console.log('uspRef EVENT_USP_IMPRESSION c');
      dispatch(EVENT_USP_IMPRESSION({ uspVariant: 'usp_variant_c' }));
    },
    3000,
    {
      threshold: 0.6,
    }
  );
  // const params = useParams();
  // const slug = params.slug as string;
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await sbApiClient.getPdpDataBucket(slug as string);
  //       if (response) {
  //         setUspData(response?.content?.uspData);
  //         setUspVariantC(response?.content?.uspVariantC);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch USP data:', error);
  //     } finally {
  //       // setLoading(false);
  //     }
  //   };
  //   if (enableBuiltData) {
  //     fetchData();
  //   }
  // }, [enableBuiltData, slug]);

  const variantCData: UspVariantDataStoryblok[] | undefined = useMemo(() => {
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
    if (!uspData || !uspVariantC || uspVariantC.length < 1) return undefined;
    return uspVariantC
      ?.filter((item) => item?.dataIndex)
      ?.map((item) => uspData[Number(item.dataIndex) - 1])
      ?.filter((item) => item);
  }, [description, enableBuiltData, link, media, title, uspData, uspVariantC]);

  if (!variantCData) {
    return null;
  }

  return (
    <>
      <Sheet variant="solid">
        <Stack
          sx={(theme) => ({
            padding: desktop ? `${theme.spacing(9)} 0 ${theme.spacing(15)} 0` : `${theme.spacing(7)} 0 0 0`,
          })}
          gap={(theme) => (desktop ? theme.spacing(9) : tablet ? theme.spacing(7) : undefined)}
          ref={uspRef}
        >
          {variantCData?.map((item, index) => (
            <Stack
              key={item?._uid}
              direction={desktop ? (index % 2 === 0 ? 'row' : 'row-reverse') : 'column-reverse'}
              gap={(theme) => (!desktop ? theme.spacing(5) : theme.spacing(14))}
              // pb={(theme) => (!desktop ? theme.spacing(7) : undefined)}
            >
              <Stack
                flex={0.84}
                justifyContent={'center'}
                alignItems={desktop ? 'flex-start' : 'center'}
                pl={(theme) =>
                  tablet ? theme.spacing(6) : mobile ? theme.spacing(4) : index % 2 === 0 ? theme.spacing(9) : undefined
                }
                pr={(theme) =>
                  tablet
                    ? theme.spacing(6)
                    : mobile
                    ? theme.spacing(4)
                    : index % 2 === 1
                    ? theme.spacing(15)
                    : undefined
                }
                pt={(theme) => (mobile ? theme.spacing(4) : tablet ? theme.spacing(6) : undefined)}
                pb={(theme) => (mobile ? theme.spacing(4) : tablet ? theme.spacing(6) : undefined)}
                gap={(theme) => theme.spacing(4)}
              >
                <Typography
                  level={title?.[0]?.level || 'h3'}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }}
                >
                  {item?.title}
                </Typography>
                <Typography
                  level={description?.[0]?.level || 'body1'}
                  variant="plain"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                    textAlign: desktop ? 'start' : 'center',
                    padding: 0,
                  }}
                >
                  {item?.description}
                </Typography>
                {link[0] && item?.link?.url && item?.ctaText && (
                  <BaseLink
                    blok={{
                      ...link[0],
                      link: item?.link,
                      ctaText: item?.ctaText,
                      ...(!link[0]?.textLevel && {
                        textLevel: 'body1',
                      }),
                    }}
                    variant="primary"
                    onClick={async () => {
                      dispatch(EVENT_USP_CLICK({ uspVariant: 'usp_variant_c', ctaText: item?.ctaText || '' }));
                    }}
                  />
                )}
              </Stack>
              <Stack flex={1}>
                <Media
                  media_url={item.media?.filename}
                  ratio={1}
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
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Sheet>
      {variantCData && variantCData.length > 0 && (
        <PinchZoomViewer
          open={open}
          setOpen={setOpen}
          slideImages={variantCData?.map((item) => ({
            src: item?.media?.filename,
            alt: item?.media?.alt || 'usp media',
            width: 100,
            height: 100,
            controls: false,
          }))}
          index={openIndex}
        />
      )}
    </>
  );
}

export default RefinedUspVariantC;
