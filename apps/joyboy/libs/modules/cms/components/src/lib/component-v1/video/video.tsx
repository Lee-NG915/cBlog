'use client';

import { Stack } from '@castlery/fortress';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { AdvancedVideo } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { storyblokEditable } from '@storyblok/react/rsc';
import debounce from 'lodash.debounce';
import { useMemo, useState, useEffect } from 'react';
import { extractPublicIdFromUrl } from '../image/cloudinary-image';
import { useDevice } from '../image/image';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { FortressImage } from '@castlery/shared-components';

export type VideoProps = {
  blok: {
    _uid?: string;
    desktop_url?: string;
    tablet_url?: string;
    mobile_url?: string;
    desktopUrl?: string;
    tabletUrl?: string;
    mobileUrl?: string;
    autoplay?: boolean;
    controls?: boolean;
    isPreload?: boolean;
  };
  loader?: {
    [key: string]: any;
  };
  resize?: {
    [key: string]: any;
  };
  videoWidth?: string | number;
  videoHeight?: string | number;
  sizes?: Array<string | number> | string;
};

type VideoUrls = {
  [key: string]: string | undefined;
};

/**
 * 从视频 URL 生成 poster URL
 * 将任意视频格式（.webm, .mp4, .mov 等）及其后面的 query string 替换为 .jpg
 * 例如: https://example.com/video.webm?_a=ATAPpAA0 -> https://example.com/video.jpg
 *       https://example.com/video.mp4?_a=ATAPpAA0 -> https://example.com/video.jpg
 */
const generatePosterUrl = (videoUrl: string | undefined): string | undefined => {
  if (!videoUrl) return undefined;

  // 匹配常见视频格式扩展名及其后面的所有内容（包括 query string）
  // 支持: .webm, .mp4, .mov, .avi, .mkv, .flv, .wmv, .m4v, .ogv 等
  const posterUrl = videoUrl.replace(/\.(webm|mp4|mov|avi|mkv|flv|wmv|m4v|ogv)(\?.*)?$/i, '.jpg');

  // 如果替换后的 URL 和原 URL 一样，说明没有匹配到视频格式，返回 undefined
  if (posterUrl === videoUrl) return undefined;

  return posterUrl;
};

/**
 * 检测图片 URL 是否存在
 */
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * 根据当前窗口宽度找到合适的视频宽度（取大于等于当前宽度的第一个值）
 */
const getTargetWidth = (currentWidth: number, widthOptions: number[]): number => {
  const target = widthOptions.find((w) => w >= currentWidth);
  // 如果没找到，返回最大值
  return target || widthOptions[widthOptions.length - 1];
};

const VideoWrapper = ({ blok, loader = {}, resize, videoWidth, videoHeight, sizes }: VideoProps) => {
  const device = useDevice();
  const desktop = device === 'desktop';
  const mobile = device === 'mobile';
  const generalWidth = [450, 640, 960, 1280, 1440, 1728];
  const cld = useMemo(
    () =>
      new Cloudinary({
        cloud: {
          cloudName: 'castlery',
        },
      }),
    []
  );
  const { _uid, desktop_url, tablet_url, mobile_url, autoplay, controls, desktopUrl, mobileUrl, tabletUrl, isPreload } =
    blok || {};
  const { ratio } = loader;
  const dispatch = useAppDispatch();

  const videoUrl: VideoUrls = useMemo(
    () => ({
      mobile: mobile_url || mobileUrl,
      tablet: tablet_url || mobile_url || tabletUrl || mobileUrl,
      desktop: desktop_url || desktopUrl,
    }),
    [mobile_url, mobileUrl, tablet_url, tabletUrl, desktop_url, desktopUrl]
  );

  // 根据窗口宽度选择合适的视频宽度
  const [width, setWidth] = useState(() => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1728;
    return getTargetWidth(windowWidth, generalWidth);
  });

  const [watchCompleted, setWatchCompleted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // 当前设备的视频 URL
  const currentVideoUrl = videoUrl[device];

  // 同步计算 poster URL（只有在 preload 时才需要 poster）
  // 使用 useMemo 确保在首次渲染时就能生成 posterUrl，从而立即开始预加载
  const posterUrl = useMemo(() => {
    return generatePosterUrl(currentVideoUrl);
  }, [currentVideoUrl]);

  // 监听窗口 resize 事件，更新视频宽度
  useEffect(() => {
    const handleResize = debounce(() => {
      const windowWidth = window.innerWidth;
      const newWidth = getTargetWidth(windowWidth, generalWidth);
      if (newWidth !== width) {
        setWidth(newWidth);
      }
    }, 300);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [width]);

  const myVideo = useMemo(() => {
    const publicId = extractPublicIdFromUrl(currentVideoUrl);
    const v = cld.video(publicId);
    if (ratio > 0) {
      v.resize(
        fill()
          .aspectRatio(mobile ? ratio : 1 / ratio)
          .width(width)
      ).format('auto');
    } else {
      v.resize(fill().width(width)).format('auto');
    }
    return v;
  }, [cld, currentVideoUrl, ratio, desktop, mobile, width]);

  const debouncedTrack = debounce((percentage) => {
    if (watchCompleted) return;
    if (percentage === 100) {
      setWatchCompleted(true);
    }
    dispatch(
      EVENT_STORYBLOK({
        action: 'image_video view',
        label: videoUrl?.[device],
        position: `${percentage}% Completion`,
      })
    );
  }, 1000);

  const trackingTags = useTrackingTags({
    moduleName: 'general-video',
    elementName: 'video',
    content: {
      assetLink: currentVideoUrl,
    },
  });

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={() => ({
        width: videoWidth,
        height: videoHeight,
        position: 'relative',
        video: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      })}
    >
      {!playing && (
        <FortressImage
          key="video-poster"
          src={posterUrl || ''}
          alt="video poster"
          lazy={false}
          needPreload={true}
          ratio={1 / ratio}
          objectFit="cover"
          sizes={sizes || ['1-xs', '1-md', '1-lg', '0.8-xl']}
          sx={{
            position: 'absolute',
            width: '100%',
          }}
        />
      )}
      <AdvancedVideo
        key={currentVideoUrl} // 当 URL 变化时强制重新挂载组件
        onPlay={(event) => {
          // 视频开始播放
          if (event.target instanceof HTMLVideoElement) {
            setPlaying(true);
          }
        }}
        onTimeUpdate={(event) => {
          if (event.target instanceof HTMLVideoElement) {
            const percentage = Math.round((event.target.currentTime / event.target.duration) * 100);
            if ([25, 50, 75, 100].includes(percentage)) {
              debouncedTrack(percentage);
            }
          }
        }}
        cldVid={myVideo}
        controls={controls}
        muted
        loop
        autoPlay={autoplay}
        playsInline
        preload={isPreload ? 'auto' : 'metadata'}
      />
    </Stack>
  );
};

export { VideoWrapper };
