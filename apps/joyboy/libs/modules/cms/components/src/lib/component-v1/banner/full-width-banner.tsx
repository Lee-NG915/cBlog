'use client';

import { EcEnv } from '@castlery/config';
import { Grid, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { selectDYCampaignData } from '@castlery/modules-dy-domain';
import { DtStack } from '@castlery/modules-tracking-components';
import { FortressImage } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { useRef } from 'react';
import { hasRichText } from '../../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../components';
import { ButtonProps } from './../button';
import { selectFontFamily, selectHeaderLevel, selectSubHeaderLevel } from './../config/cursive-material-config';
import { useAnchorScroll } from './../hook/anchor';
import { ImageProps } from './../image';
import { VideoProps } from './../video';
import { VideoWrapper } from './../video/video';

export type BannerProps = {
  blok: {
    component: 'full-width-banner';
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    klaviyo_signup_form?: any[];
    header?: string;
    header_level?: 'h1' | 'h2';
    enlarge_header?: boolean;
    header_color?: string;
    sub_header?: string;
    sub_header_level?: 'h2' | 'h3';
    sub_header_color?: string;
    description?: string;
    size?: 'large' | 'medium' | 'small';
    bg_color?: string;
    text_align?: 'left' | 'center' | 'right';
    anchor_link?: string;
    banner_selector_name?: string;
    banner_link?: {
      url: string;
    };
  };
};

/**
 * 固定高度配置（无 DY 数据时使用）
 * 保持与原逻辑一致的固定高度值
 */
const HEIGHT_CONFIG = {
  large: 900,
  medium: 675,
  small: 450,
} as const;

// 移动端固定高度
const MOBILE_HEIGHT = 600;

/**
 * DY Banner 的默认 aspect ratio
 * 当有 banner_selector_name 但 DY 数据还未加载时使用
 * 这些值基于常见的 DY campaign 配置
 */
const DY_DEFAULT_ASPECT_RATIO = {
  desktop: 0.52, // height/width ratio
  mobile: 1.25, // height/width ratio
};

function FullWidthBanner({ blok }: BannerProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    size = 'large',
    header,
    header_level,
    enlarge_header,
    header_color,
    sub_header,
    sub_header_level,
    sub_header_color,
    description,
    bg_color,
    text_align = 'center',
    image = [],
    video = [],
    button = [],
    anchor_link,
    klaviyo_signup_form = [],
    banner_selector_name,
    banner_link,
  } = blok || {};

  const dyCampaignData = useAppSelector(selectDYCampaignData);
  const bannerData = dyCampaignData[banner_selector_name || ''];
  const blokRef = useRef<HTMLDivElement>(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const pxConfig = {
    large: 36,
    medium: 12,
    small: 7,
  };
  const alignConfig = {
    left: 'start',
    center: 'center',
    right: 'end',
  };
  const aspectRatioConfig = {
    large: 0.5283,
    medium: 0.2881,
    small: 0.1921,
  };

  const handleImgSrc = (src: string) => {
    if (src.indexOf('https://') > -1) {
      return src;
    }
    return `https://res.cloudinary.com/castlery/image/upload${src}`;
  };

  /**
   * 获取 banner 的高度样式
   *
   * 修复 CLS 的关键：使用响应式 CSS 值，避免 JS 动态计算
   *
   * 场景分析：
   * 1. 无 banner_selector_name：使用固定高度（原逻辑）
   * 2. 有 banner_selector_name 但 DY 数据未加载：使用默认 aspect-ratio 预留空间
   * 3. 有 bannerData：使用 DY 提供的 ratio
   */
  const getHeightSx = () => {
    // 场景 1：无 DY banner，使用固定高度（保持原逻辑）
    if (!banner_selector_name) {
      return {
        height: {
          xs: MOBILE_HEIGHT,
          md: HEIGHT_CONFIG[size],
        },
      };
    }

    // 场景 2 & 3：有 DY banner（无论数据是否加载）
    // 使用 aspect-ratio 让高度随宽度自适应
    // 这样 SSR 和 CSR 的高度计算方式一致，避免 CLS
    const ratio = bannerData
      ? { desktop: bannerData.desktop.ratio, mobile: bannerData.mobile.ratio }
      : DY_DEFAULT_ASPECT_RATIO;

    // CSS aspect-ratio 是 width/height，DY ratio 是 height/width，需要转换
    return {
      aspectRatio: {
        xs: 1 / ratio.mobile,
        md: 1 / ratio.desktop,
      },
      maxWidth: 1728,
    };
  };

  const bannerTextContent = (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems={alignConfig[text_align]}
      sx={(theme) => ({
        flexWrap: 'nowrap',
        gap: '24px',
        px: desktop ? '60px' : '24px',
        py: desktop ? `${pxConfig[size] * 4}px` : '149px',
        height: '100%',
        ...(video.length > 0 || image.length > 0
          ? {
              zIndex: 1,
            }
          : {
              backgroundColor: bg_color || theme.palette.brand.maroonVelvet[500],
            }),
      })}
    >
      {sub_header && (
        <Typography
          textAlign={text_align}
          level={selectSubHeaderLevel(sub_header_level || 'subh2')}
          sx={(theme) => ({
            color: sub_header_color || theme.palette.brand.warmLinen[500],
            fontFamily: theme.fontFamily.body,
            [theme.breakpoints.up('sm')]: {
              maxWidth: '828px',
            },
          })}
        >
          {sub_header}
        </Typography>
      )}

      {header && (
        <Typography
          textAlign={text_align}
          level={selectHeaderLevel(header_level || 'h1')}
          sx={(theme) => ({
            color: header_color || theme.palette.brand.warmLinen[500],
            ...(enlarge_header && {
              fontSize: {
                xs: '36px',
                md: '72px',
              },
            }),
            [theme.breakpoints.up('sm')]: {
              maxWidth: '828px',
            },
            fontFamily: selectFontFamily('h1'),
          })}
        >
          {header}
        </Typography>
      )}

      {hasRichText(description) && (
        <RichTextTypography
          textAlign={text_align}
          level="body1"
          sx={(theme) => ({
            color: theme.palette.brand.warmLinen[500],
            [theme.breakpoints.up('sm')]: {
              maxWidth: '828px',
            },
          })}
          description={description}
        />
      )}

      {button?.length > 0 && (
        <Stack>
          {button.map((nestedBlok) => (
            <StoryblokServerComponent
              blok={nestedBlok}
              key={nestedBlok._uid}
              color={nestedBlok.color}
              textColor={nestedBlok.text_color}
            />
          ))}
        </Stack>
      )}
      {klaviyo_signup_form?.length > 0 && (
        <Stack
          sx={{
            width: desktop ? '520px' : '342px',
          }}
        >
          {klaviyo_signup_form.map((nestedBlok) => {
            return <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />;
          })}
        </Stack>
      )}
    </Grid>
  );

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      componentName="full-width-banner"
      uid={_uid}
      key={_uid}
      sx={() => ({
        position: 'relative',
        width: '100%',
        // 使用响应式高度/aspect-ratio，避免 JS 动态计算导致的 CLS
        ...getHeightSx(),
      })}
      id={anchor_link?.slice(1)}
    >
      <Stack sx={{ height: '100%' }} ref={blokRef}>
        {(video.length > 0 || image.length > 0) && !bannerData && (
          <Stack
            sx={() => ({
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              div: {
                height: '100%',
                paddingTop: '0 !important',
              },
            })}
          >
            <ImageOrVideo
              video={video}
              image={image}
              loader={{
                ratio: !desktop ? 0.65 : aspectRatioConfig[size],
              }}
              sizes={['1-xs', '1-md', '1-lg', '0.8-xl']}
            />
          </Stack>
        )}

        {bannerData && (
          <Link
            href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${
              bannerData.link
            }`}
            sx={() => ({
              display: 'block',
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 2,
            })}
          >
            <Stack
              sx={() => ({
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
              })}
            >
              {bannerData.type === 'image' && (
                <FortressImage
                  src={handleImgSrc(desktop ? bannerData.desktop.src : bannerData.mobile.src)}
                  ratio={1 / (desktop ? bannerData.desktop.ratio : bannerData.mobile.ratio)}
                  alt={'HP Banner Image'}
                  objectFit="cover"
                  needPreload={true}
                  sizes={['1-xs', '1-md', '1-lg', '0.8-xl']}
                  lazy={false}
                />
              )}
              {bannerData.type === 'video' && (
                <VideoWrapper
                  blok={{
                    desktop_url: bannerData.desktop.video,
                    mobile_url: bannerData.mobile.video,
                    tablet_url: bannerData.tablet?.video || bannerData.mobile.video,
                    autoplay: true,
                    controls: false,
                    isPreload: true,
                  }}
                  loader={{
                    ratio: desktop ? bannerData.desktop.ratio : bannerData.mobile.ratio,
                  }}
                />
              )}
            </Stack>
          </Link>
        )}
        {!bannerData &&
          (banner_link?.url ? (
            <Link
              href={banner_link.url}
              sx={{
                display: 'block',
                height: '100%',
                textDecoration: 'none',
              }}
            >
              {bannerTextContent}
            </Link>
          ) : (
            bannerTextContent
          ))}
      </Stack>
    </DtStack>
  );
}

export { FullWidthBanner };
