'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Button, ButtonProps } from '../component-v1/button';
import { ImageProps } from '../component-v1/image';
import { KlaviyoInputFormProps } from '../klaviyo_input_form';
import { VideoProps } from '../component-v1/video';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { hasRichText } from '../../utils/rich-text-utils';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';

interface OneThirdBannerProps {
  blok: {
    size: 'large' | 'medium' | 'small';
    header: string;
    header_color: string;
    header_level: 'h1' | 'h2';
    enlarge_header?: boolean;
    sub_header: string;
    sub_header_color: string;
    sub_header_level: 'subh1' | 'subh2';
    description: string;
    background_color: string;
    direction: 'left' | 'right';
    button: ButtonProps[];
    image: ImageProps[];
    video: VideoProps[];
    klaviyo_signup_form: KlaviyoInputFormProps[];
    text_align: 'left' | 'center';
    _uid: string;
  };
}

const OneThirdBanner = ({ blok }: OneThirdBannerProps) => {
  const { desktop } = useBreakpoints();
  const [stackWidth, setStackWidth] = useState<number>(0);
  const [stackHeight, setStackHeight] = useState<number>(0);

  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (stackRef.current) {
        const width = stackRef.current.offsetWidth;
        const height = stackRef.current.offsetHeight;
        setStackWidth(width);
        setStackHeight(height);
      }
    };

    // 使用 requestAnimationFrame 确保在下一帧渲染后获取尺寸
    requestAnimationFrame(() => {
      updateWidth();

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setStackWidth(entry.contentRect.width);
          setStackHeight(entry.contentRect.height);
        }
      });

      if (stackRef.current) {
        resizeObserver.observe(stackRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    });
  }, []);

  const {
    size,
    header,
    enlarge_header,
    header_color,
    header_level,
    sub_header,
    sub_header_color,
    sub_header_level,
    description,
    background_color,
    direction,
    button,
    image,
    video,
    klaviyo_signup_form,
    text_align,
    _uid,
  } = blok;

  const maxHeightConfig = {
    large: 900,
    medium: 675,
    small: 450,
  };

  if (!desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="one-third-banner" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            backgroundColor: background_color || theme.palette.brand.maroonVelvet[500],
            flexDirection: 'column',
          })}
        >
          {(image.length > 0 || video.length > 0) && (
            <ImageOrVideo
              image={image}
              video={video}
              loader={{
                ratio: 0.62,
              }}
              sizes={['1-xs', '1-md']}
            />
          )}
          <Stack
            sx={(theme) => ({
              px: '24px',
              py: '32px',
            })}
          >
            {sub_header && (
              <Typography
                level={sub_header_level}
                sx={(theme) => ({
                  color: sub_header_color || theme.palette.brand.warmLinen[500],
                  textAlign: text_align,
                  marginBottom: '16px',
                })}
              >
                {sub_header.toLocaleUpperCase()}
              </Typography>
            )}
            <Typography
              level={header_level || 'h1'}
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                marginBottom: '16px',
                textAlign: text_align,
                ...(enlarge_header && {
                  fontSize: {
                    xs: '36px',
                    md: '52px',
                  },
                }),
              })}
            >
              {header}
            </Typography>
            {hasRichText(description) && (
              <RichTextTypography
                description={description}
                sx={(theme) => ({
                  color: theme.palette.brand.warmLinen[500],
                  marginBottom: '24px',
                  textAlign: text_align,
                })}
              />
            )}
            {button.length > 0 && (
              <Stack
                sx={(theme) => ({
                  marginBottom: '24px',
                  alignItems: text_align === 'center' ? 'center' : 'flex-start',
                })}
              >
                {button.map((button) => (
                  <Button blok={button} color={button.color} textColor={button.text_color} />
                ))}
              </Stack>
            )}
            {klaviyo_signup_form?.length > 0 && (
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                {klaviyo_signup_form.map((nestedBlok) => (
                  <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </DtStack>
    );
  }

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="one-third-banner" uid={_uid} key={_uid}>
      <Stack
        sx={(theme) => ({
          width: '100%',
          flexDirection: direction === 'right' ? 'row' : 'row-reverse',
          backgroundColor: background_color || theme.palette.brand.maroonVelvet[500],
          alignItems: 'center',
          maxHeight: maxHeightConfig[size],
          minHeight: maxHeightConfig[size],
          overflow: 'hidden',
        })}
      >
        <Stack
          sx={(theme) => ({
            width: '33%',
            px: '60px',
          })}
        >
          <Typography
            level={sub_header_level}
            sx={(theme) => ({
              color: sub_header_color || theme.palette.brand.warmLinen[500],
              marginBottom: '24px',
              textAlign: text_align,
            })}
          >
            {sub_header}
          </Typography>
          {/* {hasRichText(header) && (
            <RichTextTypography
              description={header}
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                marginBottom: '24px',
              })}
            />
          )} */}
          <Typography
            level={header_level || 'h1'}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.warmLinen[500],
              marginBottom: '24px',
              textAlign: text_align,
              ...(enlarge_header && {
                fontSize: {
                  xs: '36px',
                  md: '52px',
                },
              }),
            })}
          >
            {header}
          </Typography>
          {hasRichText(description) && (
            <RichTextTypography
              description={description}
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                marginBottom: '24px',
              })}
            />
          )}
          {button.length > 0 && (
            <Stack
              sx={(theme) => ({
                alignItems: text_align === 'center' ? 'center' : 'flex-start',
                marginBottom: '24px',
              })}
            >
              {button.map((button) => (
                <Button blok={button} color={button.color} textColor={button.text_color} />
              ))}
            </Stack>
          )}
          {klaviyo_signup_form?.length > 0 && (
            <Stack>
              {klaviyo_signup_form.map((nestedBlok) => (
                <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
              ))}
            </Stack>
          )}
        </Stack>
        <Stack
          sx={{
            width: '67%',
            // height: maxHeightConfig[size],
          }}
          ref={stackRef}
        >
          {(image.length > 0 || video.length > 0) && (
            <ImageOrVideo
              image={image}
              video={video}
              imageWidth={stackWidth}
              imageHeight={stackHeight}
              sizes={['1-xs', '0.6-md', '0.6-lg', '0.4-xl']}
              // loader={{
              //   height: '100%',
              //   objectFit: 'cover',
              //   ratio: maxHeightConfig[size] / stackWidth,
              // }}
            />
          )}
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { OneThirdBanner };
