'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Button, ButtonProps } from '../component-v1/button';
import { ImageProps } from '../component-v1/image';
import { KlaviyoInputFormProps } from '../klaviyo_input_form';
import { VideoProps } from '../component-v1/video';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { hasRichText } from '../../utils/rich-text-utils';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { DtStack } from '@castlery/modules-tracking-components';

interface HalfBannerProps {
  blok: {
    size: 'large' | 'medium' | 'small';
    header: string;
    header_level: 'h1' | 'h2';
    enlarge_header?: boolean;
    header_color: string;
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
    // mobile_direction: 'top_image_bottom_text' | 'bottom_image_top_text';
    text_align: 'left' | 'center';
    _uid: string;
  };
}

const HalfBanner = ({ blok }: HalfBannerProps) => {
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
    header_level,
    header_color,
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
    enlarge_header,
    // mobile_direction,
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
      <DtStack useImpression {...storyblokEditable(blok)} componentName="half-banner" uid={_uid} key={_uid}>
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
                ratio: 0.87,
              }}
              sizes={['1-xs', '0.5-md', '0.5-lg', '0.3-xl']}
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
    <DtStack useImpression {...storyblokEditable(blok)} componentName="half-banner" uid={_uid} key={_uid}>
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
            width: '50%',
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
                color: theme.palette.brand.warmLinen[500],
                marginBottom: '32px',
                textAlign: text_align,
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
            <Stack
              sx={{
                width: '520px',
              }}
            >
              {klaviyo_signup_form.map((nestedBlok) => (
                <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
              ))}
            </Stack>
          )}
        </Stack>
        <Stack
          sx={{
            width: '50%',
            height: maxHeightConfig[size],
          }}
          ref={stackRef}
        >
          {(image.length > 0 || video.length > 0) && (
            <ImageOrVideo
              image={image}
              video={video}
              imageWidth={stackWidth}
              imageHeight={stackHeight}
              sizes={['1-xs', '0.5-md', '0.5-lg', '0.3-xl']}
            />
          )}
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { HalfBanner };
