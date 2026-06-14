'use client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { Stack, useBreakpoints } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { AdvancedVideo } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import debounce from 'lodash.debounce';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { FortressImage } from '@castlery/shared-components';

export type ControlledVideoProps = {
  blok: {
    _uid?: string;
    desktop_url?: string;
    tablet_url?: string;
    mobile_url?: string;
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
  /** 控制视频的播放状态，true 为播放，false 为暂停 */
  isPlaying?: boolean;
  /** 播放状态变化时的回调函数 */
  onPlaybackStateChange?: (state: 'playing' | 'paused' | 'ended') => void;
  /** 当视频播放到3秒或视频时长小于3秒且播放结束时触发的回调函数 */
  onShouldSwitch?: () => void;
};

type VideoUrls = {
  [key: string]: string | undefined;
};

export const extractPublicIdFromUrl = (url = '') => {
  const formatUrl = decodeURIComponent(url);
  if (formatUrl?.startsWith('https://res.cloudinary.com/castlery')) {
    const regex = /^https:\/\/res\.cloudinary\.com\/castlery\/(?:image|video)\/upload\/(v\d+\/)?(.+)\.\w+$/;
    const match = formatUrl.match(regex);
    if (match && match.length >= 3) {
      return match[2];
    }
    return formatUrl;
  }
  return formatUrl;
};

export const useDevice = () => {
  const { mobile, tablet, desktop } = useBreakpoints();
  const device = useMemo(() => {
    if (mobile) return 'mobile';
    if (tablet) return 'tablet';
    if (desktop) return 'desktop';
    return 'desktop';
  }, [mobile, tablet, desktop]);
  return device;
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
 * 根据当前窗口宽度找到合适的视频宽度（取大于等于当前宽度的第一个值）
 */
const getTargetWidth = (currentWidth: number, widthOptions: number[]): number => {
  const target = widthOptions.find((w) => w >= currentWidth);
  // 如果没找到，返回最大值
  return target || widthOptions[widthOptions.length - 1];
};

const ControlledVideo = ({
  blok,
  loader = {},
  resize,
  videoWidth,
  videoHeight,
  sizes,
  isPlaying,
  onPlaybackStateChange,
  onShouldSwitch,
}: ControlledVideoProps) => {
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
  const { _uid, desktop_url, tablet_url, mobile_url, autoplay, controls } = blok || {};
  const { ratio } = loader;
  const dispatch = useAppDispatch();

  const videoUrl: VideoUrls = useMemo(
    () => ({
      mobile: mobile_url,
      tablet: tablet_url || mobile_url,
      desktop: desktop_url,
    }),
    [mobile_url, tablet_url, desktop_url]
  );

  // 根据窗口宽度选择合适的视频宽度
  const [width, setWidth] = useState(() => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1728;
    return getTargetWidth(windowWidth, generalWidth);
  });

  const [watchCompleted, setWatchCompleted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // 记录是否已经触发过切换，避免重复触发
  const hasTriggeredSwitchRef = useRef(false);

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

  // 监听 isPlaying prop 的变化，控制视频播放/暂停
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying === true) {
        // 如果视频已经播放结束，重置到开头
        if (videoRef.current.ended) {
          videoRef.current.currentTime = 0;
        }
        // 重置切换标志，允许新的视频触发切换
        hasTriggeredSwitchRef.current = false;
        videoRef.current.play().catch((error) => {
          console.error('播放视频失败:', error);
        });
      } else if (isPlaying === false) {
        videoRef.current.pause();
        // 重置视频到开头，防止循环播放
        videoRef.current.currentTime = 0;
        // 重置切换标志
        hasTriggeredSwitchRef.current = false;
      }
      // 如果 isPlaying 是 undefined，则使用原来的 autoplay 行为
    }
  }, [isPlaying]);

  const myVideo = useMemo(() => {
    const publicId = extractPublicIdFromUrl(currentVideoUrl);
    const v = cld.video(publicId);
    if (ratio > 0) {
      v.resize(
        fill()
          .aspectRatio(1 / ratio)
          .width(width)
      ).format('auto');
    } else {
      v.resize(fill().width(width)).format('auto');
    }
    return v;
  }, [cld, currentVideoUrl, ratio, desktop, width]);

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
      {posterUrl && !playing && (
        <FortressImage
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
        onLoadedData={(event) => {
          // 视频加载完成后保存引用并应用播放状态
          if (event.target instanceof HTMLVideoElement) {
            videoRef.current = event.target;
            // 如果 isPlaying 明确设置为 false，确保视频暂停
            if (isPlaying === false) {
              event.target.pause();
            } else if (isPlaying === true) {
              event.target.play().catch((error) => {
                console.error('播放视频失败:', error);
              });
            }
          }
        }}
        onPlay={(event) => {
          // 视频开始播放
          if (event.target instanceof HTMLVideoElement) {
            videoRef.current = event.target;
            setPlaying(true);
            onPlaybackStateChange?.('playing');
          }
        }}
        onPause={(event) => {
          // 视频暂停
          if (event.target instanceof HTMLVideoElement) {
            videoRef.current = event.target;
            setPlaying(false);
            onPlaybackStateChange?.('paused');
          }
        }}
        onEnded={(event) => {
          // 视频播放结束
          if (event.target instanceof HTMLVideoElement) {
            videoRef.current = event.target;
            setPlaying(false);
            // 重置视频到开头，防止自动循环播放
            event.target.currentTime = 0;
            onPlaybackStateChange?.('ended');
            // 如果视频时长小于3秒且还没有触发过切换，则触发切换
            if (event.target.duration && event.target.duration < 3 && !hasTriggeredSwitchRef.current) {
              hasTriggeredSwitchRef.current = true;
              onShouldSwitch?.();
            }
          }
        }}
        onTimeUpdate={(event) => {
          if (event.target instanceof HTMLVideoElement) {
            const percentage = Math.round((event.target.currentTime / event.target.duration) * 100);
            if ([25, 50, 75, 100].includes(percentage)) {
              debouncedTrack(percentage);
            }
            // 检查是否播放到3秒，如果是且还没有触发过切换，则触发切换
            if (event.target.currentTime >= 3 && !hasTriggeredSwitchRef.current) {
              hasTriggeredSwitchRef.current = true;
              onShouldSwitch?.();
            }
          }
        }}
        cldVid={myVideo}
        controls={controls}
        muted
        // loop
        autoPlay={isPlaying !== undefined ? isPlaying : autoplay}
        playsInline
        preload={'auto'}
      />
    </Stack>
  );
};

export { ControlledVideo };
