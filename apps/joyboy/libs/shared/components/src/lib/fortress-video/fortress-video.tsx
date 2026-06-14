/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Icons, Stack } from '@castlery/fortress';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import {
  checkIsVisible,
  generateVideoThumbnail,
  generateVideoUrl,
  objectFitToCrop,
  type ThumbnailOptions,
  type VideoOptions,
} from '@castlery/utils';
import dynamic from 'next/dynamic';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { default as ReactPlayerType } from 'react-player';
import { FortressImage } from '../fortress-image/fortress-image';
import { logger } from '@castlery/observability/client';

// 动态导入ReactPlayer
const VideoPlayer = dynamic(() => import('./components/video-player'), {
  ssr: false,
});

// 定义播放器事件类型
interface VideoPlayerEvent {
  type: string;
  target?: HTMLVideoElement;
  currentTime?: number;
  duration?: number;
  player?: any;
  [key: string]: any;
}

type TrackVideoPayload = Record<string, any>;
type TrackVideoConfig = TrackVideoPayload | ((percentage: number, event: VideoPlayerEvent) => TrackVideoPayload);

// 定义暴露给外部的方法接口
export interface FortressVideoHandle {
  /** 播放视频 */
  play: () => void;
  /** 暂停视频 */
  pause: () => void;
  /** 重新播放视频（从头开始） */
  replay: () => void;
}

export interface FortressVideoProps {
  /** 视频源 URL 或 Cloudinary 公共 ID */
  src: string;
  /** 视频播放器的唯一标识符 */
  id?: string;
  /** 视频宽度 */
  width?: string | number;
  /** 视频高度 */
  height?: string | number;
  /** 视频清晰度 */
  resolution?: 480 | 720 | 1080 | 1440;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否显示控制器 */
  controls?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否在 ios 设备上内联播放 */
  playsInline?: boolean;
  /** 海报图片 - 如果不传入，将自动为 Cloudinary 视频生成缩略图 */
  poster?: string;
  /** 缩略图生成配置 */
  thumbnailConfig?: ThumbnailOptions & {
    /** 是否禁用自动缩略图生成 */
    disabled?: boolean;
  };
  /** 视频变换配置 */
  videoConfig?: VideoOptions;
  /** 视频容器样式配置 */
  containerConfig?: {
    /** 容器的宽高比 */
    aspectRatio?: number;
    /** 视频在容器中的填充方式 */
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
    /** 是否隐藏溢出内容 */
    overflow?: 'hidden' | 'visible' | 'auto' | 'scroll';
  };
  /** 播放器事件回调 */
  onPlay?: (event: VideoPlayerEvent) => void;
  onPause?: (event: VideoPlayerEvent) => void;
  onEnded?: (event: VideoPlayerEvent) => void;
  onError?: (event: VideoPlayerEvent) => void;
  /** 视频加载完成时的回调 */
  onReady?: (event: VideoPlayerEvent) => void;
  /** 播放进度回调 - 在 25%、50%、75%、100% 时触发 */
  onProgress?: (percentage: number, event: VideoPlayerEvent) => void;
  /** 自定义样式 */
  sx?: any;
  /** 自定义类名 */
  className?: string;
  /** 是否响应式 */
  responsive?: boolean;
  /** 追踪标签 */
  trackingTags?: Record<string, any>;
  /** 模块名称 */
  moduleName?: string;
  /** 元素名称 */
  elementName?: string;
  /** 追踪内容 */
  trackingContent?: Record<string, any>;
  /** 是否启用播放进度数据上报 */
  enableProgressTracking?: boolean;
  /** 自定义进度上报点，默认为 [25, 50, 75, 100] */
  progressTrackingPoints?: number[];
  /** 自定义 video progress 上报参数，支持对象或回调函数，position 始终由组件内部计算 */
  trackVideo?: TrackVideoConfig;
  /** 是否启用懒加载：为 true 时仅在元素进入视口后才挂载 VideoPlayer（才请求视频），未进入视口只展示海报；进入视口后自动播放且不再根据离开视口暂停 */
  lazyLoad?: boolean;
  /** 自定义根容器，用于 IntersectionObserver 的 root 选项 */
  rootContainer?: Element | null;
  /** 自定义 IntersectionObserver 的阈值 */
  threshold?: number;
  /** 自定义 IntersectionObserver 的 rootMargin */
  rootMargin?: string;
  /** 是否基于可见性自动播放 */
  autoPlayOnVisible?: boolean;
  /** 是否基于可见性自动暂停 */
  autoPauseOnVisible?: boolean;
  /** 是否不需要海报 */
  noNeedPoster?: boolean;
  /** 外层背景颜色 */
  outerBackground?: string;
}

const playButton = (
  <Icons.PlayWhite
    sx={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '3.75rem', md: '7.5rem' },
      height: { xs: '3.75rem', md: '7.5rem' },
    }}
  />
);

export const FortressVideo = forwardRef<FortressVideoHandle, FortressVideoProps>(
  (
    {
      src,
      id,
      width = '100%',
      height = '100%',
      resolution = 1080,
      autoPlay = false,
      controls = true,
      muted = false,
      loop = false,
      playsInline = true,
      poster,
      thumbnailConfig = {},
      videoConfig,
      containerConfig,
      onPlay,
      onPause,
      onEnded,
      onError,
      onReady,
      onProgress,
      sx,
      className,
      responsive = true,
      trackingTags,
      moduleName,
      elementName,
      trackingContent,
      enableProgressTracking = false,
      progressTrackingPoints = [25, 50, 75, 100],
      trackVideo,
      lazyLoad = false,
      rootContainer = null,
      threshold = 0.8,
      rootMargin = '0px',
      autoPlayOnVisible = false,
      autoPauseOnVisible = false,
      noNeedPoster = false,
      outerBackground,
      ...rest
    },
    ref
  ) => {
    /** visibility 系统是否接管播放状态 */
    const visibilityControlled = lazyLoad || autoPlayOnVisible || autoPauseOnVisible;
    /**
     * 是否在首次进入视图后取消观测：
     * 仅当「纯 lazyLoad，无任何 visibility 控制」时取消，
     * 否则需持续观测以驱动 autoPlay/autoPause。
     */
    const canUnobserveAfterFirstVisible = lazyLoad && !autoPlayOnVisible && !autoPauseOnVisible;

    const [watchCompleted, setWatchCompleted] = useState(false);
    /**
     * shouldBePlaying：语义上"是否应该播放"的唯一来源。
     * - visibility 接管时初始为 false，由 observer 首屏判定后驱动
     * - 非接管时由 autoPlay 决定初始值
     */
    const [shouldBePlaying, setShouldBePlaying] = useState(() => (visibilityControlled ? false : autoPlay));
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    /** 仅当 lazyLoad 时使用：元素进入视口后才为 true，用于延迟挂载 VideoPlayer */
    const [isInView, setIsInView] = useState(false);
    const watchCompletedRef = useRef(watchCompleted);
    const onProgressRef = useRef(onProgress);
    const srcRef = useRef(src);
    const trackVideoRef = useRef(trackVideo);
    const trackedProgressPoints = useRef<Set<number>>(new Set());
    const playerRef = useRef<ReactPlayerType>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      watchCompletedRef.current = watchCompleted;
    }, [watchCompleted]);

    useEffect(() => {
      onProgressRef.current = onProgress;
    }, [onProgress]);

    useEffect(() => {
      srcRef.current = src;
    }, [src]);

    useEffect(() => {
      trackVideoRef.current = trackVideo;
    }, [trackVideo]);

    // 清理函数
    const clearProgressInterval = useCallback(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, []);

    // src 变更时重置全部状态
    useEffect(() => {
      setWatchCompleted(false);
      watchCompletedRef.current = false;
      setShouldBePlaying(visibilityControlled ? false : autoPlay);
      setIsVideoLoaded(false);
      if (lazyLoad) {
        setIsInView(false);
      }
      trackedProgressPoints.current.clear();
      clearProgressInterval();
    }, [src, autoPlay, lazyLoad, autoPlayOnVisible, autoPauseOnVisible, clearProgressInterval]);

    const handleIntersect = useCallback(
      (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (lazyLoad) {
              setIsInView(true);
            }
            if (lazyLoad || autoPlayOnVisible) {
              setShouldBePlaying(true);
            }
            if (canUnobserveAfterFirstVisible) {
              observer.unobserve(entry.target);
            }
          } else {
            if (autoPauseOnVisible) {
              setShouldBePlaying(false);
            }
          }
        });
      },
      [lazyLoad, autoPlayOnVisible, autoPauseOnVisible, canUnobserveAfterFirstVisible]
    );

    useEffect(() => {
      if (!visibilityControlled) return;
      if (typeof window === 'undefined' || !window.IntersectionObserver) return;
      if (!containerRef.current) return;

      // root 必须是 target 的 DOM 祖先（IntersectionObserver 规范要求），
      // 否则 IO 完全不 fire 回调。caller 在 modal/portal 场景下传过来的 rootContainer
      // 可能不在 target 的祖先链上 —— 此时退化到 viewport（root=null）。
      const effectiveRoot = rootContainer && rootContainer.contains(containerRef.current) ? rootContainer : null;

      const observer = new IntersectionObserver(handleIntersect, {
        root: effectiveRoot,
        rootMargin,
        threshold,
      });

      observer.observe(containerRef.current);

      // 主动首屏可见性判定：替代 takeRecords() / setTimeout(takeRecords) 方案，
      // 确保首屏已可见时确定性地触发播放，不依赖 observer 队列时序。
      if (checkIsVisible(containerRef.current, effectiveRoot, rootMargin, threshold)) {
        if (lazyLoad) {
          setIsInView(true);
        }
        if (lazyLoad || autoPlayOnVisible) {
          setShouldBePlaying(true);
        }
        if (canUnobserveAfterFirstVisible) {
          observer.unobserve(containerRef.current);
        }
      }

      return () => observer.disconnect();
    }, [
      handleIntersect,
      visibilityControlled,
      lazyLoad,
      autoPlayOnVisible,
      autoPauseOnVisible,
      canUnobserveAfterFirstVisible,
      rootContainer,
      rootMargin,
      threshold,
    ]);

    // 视频加载完成的处理函数
    const handleReady = useCallback(
      (player: ReactPlayerType) => {
        setIsVideoLoaded(true);
        const event: VideoPlayerEvent = {
          type: 'ready',
          player,
          currentTime: player?.getCurrentTime() || 0,
          duration: player?.getDuration() || 0,
        };
        onReady?.(event);
      },
      [onReady]
    );

    // 构建视频 URL
    const videoUrl = useMemo(() => {
      const finalVideoConfig = {
        width: resolution,
        quality: 'auto',
        format: 'auto',
        crop: objectFitToCrop[containerConfig?.objectFit ?? ''] ?? 'fit',
        gravity: 'center',
        aspectRatio: containerConfig?.aspectRatio || 1,
        ...videoConfig,
      };
      return generateVideoUrl(src, finalVideoConfig);
    }, [resolution, src, videoConfig]);

    /** 仅当为 true 时挂载 VideoPlayer，实现真正的懒加载 */
    const shouldLoadVideo = !lazyLoad || isInView;

    // 智能缩略图生成
    const generatedPoster = useMemo(() => {
      if (poster) {
        return poster;
      }
      if (thumbnailConfig.disabled) {
        return undefined;
      }
      const thumbnailOptions: ThumbnailOptions = {
        thumbnailAspectRatio: containerConfig?.aspectRatio || '1:1',
        thumbnailStartOffset: 0,
        thumbnailCrop: 'fill',
        thumbnailGravity: 'center',
        ...thumbnailConfig,
        ...(thumbnailConfig.thumbnailStartOffset === undefined &&
          thumbnailConfig.thumbnailPercentage === undefined && {
            thumbnailPercentage: 0,
          }),
      };
      try {
        return generateVideoThumbnail(src, thumbnailOptions);
      } catch (error) {
        console.warn('FortressVideo: 缩略图生成失败:', error);
        return undefined;
      }
    }, [src, poster, thumbnailConfig, containerConfig]);

    const containerOptions = useMemo(() => {
      return {
        aspectRatio: 1,
        objectFit: 'contain',
        overflow: 'hidden',
        ...containerConfig,
      };
    }, [containerConfig]);

    // 追踪标签
    const standardTrackingTags = useTrackingTags({
      moduleName: moduleName || 'fortress-video-player',
      elementName: elementName || 'video',
      content: {
        assetLink: src,
        ...(trackingContent || {}),
      },
    });

    const domTrackingAttrs = {
      ...(moduleName ? standardTrackingTags : {}),
      ...(trackingTags || {}),
    };

    // 创建标准事件对象的工具函数
    const createVideoEvent = useCallback((type: string, additionalData: any = {}): VideoPlayerEvent => {
      return {
        type,
        player: playerRef.current,
        currentTime: playerRef.current?.getCurrentTime() || 0,
        duration: playerRef.current?.getDuration() || 0,
        ...additionalData,
      };
    }, []);

    // 数据上报工具函数
    const trackVideoEvent = useCallback((eventType: string, additionalData: Record<string, any> = {}) => {
      if (typeof window !== 'undefined' && window?.dataLayer) {
        window.dataLayer.push({
          event: eventType,
          video_title: srcRef.current,
          ...additionalData,
        });
      }
    }, []);

    const normalizeTrackVideoPayload = useCallback((payload: TrackVideoPayload = {}): TrackVideoPayload => {
      const normalizedPayload = { ...payload };
      if (normalizedPayload.category !== undefined && normalizedPayload['eventDetails.category'] === undefined) {
        normalizedPayload['eventDetails.category'] = normalizedPayload.category;
      }
      if (normalizedPayload.action !== undefined && normalizedPayload['eventDetails.action'] === undefined) {
        normalizedPayload['eventDetails.action'] = normalizedPayload.action;
      }
      if (normalizedPayload.label !== undefined && normalizedPayload['eventDetails.label'] === undefined) {
        normalizedPayload['eventDetails.label'] = normalizedPayload.label;
      }
      if (normalizedPayload.tag !== undefined && normalizedPayload['eventDetails.tag'] === undefined) {
        normalizedPayload['eventDetails.tag'] = normalizedPayload.tag;
      }
      if (normalizedPayload.tagValue !== undefined && normalizedPayload['eventDetails.tag_value'] === undefined) {
        normalizedPayload['eventDetails.tag_value'] = normalizedPayload.tagValue;
      }
      delete normalizedPayload.category;
      delete normalizedPayload.action;
      delete normalizedPayload.label;
      delete normalizedPayload.tag;
      delete normalizedPayload.tagValue;
      return normalizedPayload;
    }, []);

    // 播放进度上报函数
    const trackProgress = useCallback(
      (percentage: number, event: VideoPlayerEvent) => {
        if (watchCompletedRef.current) return;
        if (trackedProgressPoints.current.has(percentage)) return;
        trackedProgressPoints.current.add(percentage);
        if (percentage === 100) {
          setWatchCompleted(true);
          watchCompletedRef.current = true;
        }
        onProgressRef.current?.(percentage, event);
        const defaultProgressTrackPayload = {
          'eventDetails.category': 'Video',
          'eventDetails.action': 'video progress',
          'eventDetails.label': srcRef.current,
        };
        const trackVideoPayload =
          typeof trackVideoRef.current === 'function'
            ? trackVideoRef.current(percentage, event)
            : trackVideoRef.current;
        const normalizedTrackVideoPayload = normalizeTrackVideoPayload(trackVideoPayload ?? {});
        trackVideoEvent('trackEvent', {
          ...defaultProgressTrackPayload,
          ...normalizedTrackVideoPayload,
          'eventDetails.position': `${percentage}% Completion`,
        });
      },
      [normalizeTrackVideoPayload, trackVideoEvent]
    );

    // 组件卸载时清理资源
    useEffect(() => {
      return () => {
        clearProgressInterval();
      };
    }, [clearProgressInterval]);

    // 事件处理
    const handlePlay = useCallback(() => {
      setShouldBePlaying(true);
      // 兜底：play 成功说明视频已能播，海报覆盖层使命完成 —
      // 防 onReady 在边界 case（dynamic chunk loading 中切 src、网络错误等）下未触发导致海报常驻。
      setIsVideoLoaded(true);
      const event = createVideoEvent('play');
      onPlay?.(event);
      if (enableProgressTracking && playerRef.current) {
        clearProgressInterval();
        progressIntervalRef.current = setInterval(() => {
          if (playerRef.current) {
            try {
              const currentTime = playerRef.current.getCurrentTime() || 0;
              const duration = playerRef.current.getDuration() || 0;
              if (duration > 0) {
                const percentage = Math.round((currentTime / duration) * 100);
                const normalizedPercentage = percentage >= 99 ? 100 : percentage;
                const progressEvent = createVideoEvent('progress', { currentTime, duration });
                progressTrackingPoints.forEach((trackingPoint) => {
                  if (normalizedPercentage >= trackingPoint) {
                    trackProgress(trackingPoint, progressEvent);
                  }
                });
              }
            } catch (error) {
              console.warn('FortressVideo: Error getting player time:', error);
            }
          }
        }, 1000);
      }
      trackVideoEvent('video_play');
    }, [
      onPlay,
      enableProgressTracking,
      progressTrackingPoints,
      trackProgress,
      clearProgressInterval,
      trackVideoEvent,
      createVideoEvent,
    ]);

    const handlePause = useCallback(() => {
      setShouldBePlaying(false);
      const event = createVideoEvent('pause');
      onPause?.(event);
      clearProgressInterval();
      trackVideoEvent('video_pause');
    }, [onPause, clearProgressInterval, trackVideoEvent, createVideoEvent]);

    const handleEnded = useCallback(() => {
      setShouldBePlaying(false);
      const event = createVideoEvent('ended');
      onEnded?.(event);
      clearProgressInterval();
      if (enableProgressTracking && progressTrackingPoints.includes(100)) {
        trackProgress(100, createVideoEvent('ended'));
      }
      trackVideoEvent('video_complete');
    }, [
      onEnded,
      enableProgressTracking,
      progressTrackingPoints,
      trackProgress,
      clearProgressInterval,
      trackVideoEvent,
      createVideoEvent,
    ]);

    const handleError = useCallback(
      (error: any) => {
        setShouldBePlaying(false);
        const event = createVideoEvent('error', { error });
        onError?.(event);
        clearProgressInterval();
        logger.error('FortressVideo playback error', {
          src,
          error,
          timestamp: new Date().toISOString(),
        });
      },
      [onError, src, clearProgressInterval, createVideoEvent]
    );

    const handleClickPreview = useCallback(() => {
      setShouldBePlaying(true);
    }, []);

    // 暴露给外部的方法
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          setShouldBePlaying(true);
          if (playerRef.current) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.play === 'function') {
              internalPlayer.play().catch((error: any) => {
                console.warn('FortressVideo: 播放失败', error);
              });
            }
          }
        },
        pause: () => {
          setShouldBePlaying(false);
          if (playerRef.current) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.pause === 'function') {
              internalPlayer.pause();
            }
          }
        },
        replay: () => {
          if (playerRef.current) {
            try {
              playerRef.current.seekTo(0);
              setShouldBePlaying(true);
              const internalPlayer = playerRef.current.getInternalPlayer();
              if (internalPlayer && typeof internalPlayer.play === 'function') {
                internalPlayer.play().catch((error: any) => {
                  console.warn('FortressVideo: 重新播放失败', error);
                });
              }
            } catch (error) {
              console.warn('FortressVideo: 重新播放失败', error);
            }
          }
        },
      }),
      []
    );

    return (
      <Stack
        ref={containerRef}
        className={className}
        sx={{
          width: responsive ? '100%' : width,
          height: responsive ? 0 : height || 0,
          paddingBottom: responsive ? `${(1 / containerOptions.aspectRatio) * 100}%` : 0,
          backgroundColor: outerBackground ? outerBackground : 'var(--fortress-palette-brand-charcoal-800)',
          position: 'relative',
          overflow: containerOptions.overflow,
          '& .media-controls': {
            width: '100%',
            height: '100%',
          },
          '& .react-player__preview': {
            justifyContent: 'initial !important',
            alignItems: 'initial !important',
          },
          '& video': {
            objectFit: containerOptions.objectFit as any,
          },
          ...sx,
        }}
      >
        {generatedPoster && !isVideoLoaded && !noNeedPoster ? (
          <FortressImage
            src={generatedPoster}
            alt={'Video thumbnail'}
            objectFit="cover"
            sx={{
              position: 'absolute',
              width: '100%',
              heigth: '100%',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 2,
              '--AspectRatio-paddingBottom': 0,
            }}
          />
        ) : undefined}
        <Stack
          sx={{
            backgroundColor: 'transparent',
          }}
        >
          {shouldLoadVideo ? (
            <VideoPlayer
              playRef={playerRef}
              key={id || src}
              url={videoUrl}
              width="100%"
              height="100%"
              playing={shouldBePlaying}
              controls={controls}
              muted={muted}
              loop={loop}
              playsinline={playsInline}
              style={{
                position: 'absolute',
                backgroundColor: 'transparent',
              }}
              stopOnUnmount={true}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleError}
              onReady={handleReady}
              onClickPreview={handleClickPreview}
              playIcon={playButton}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    'data-dt-id': domTrackingAttrs['data-dt-id'],
                  },
                },
              }}
              {...rest}
            />
          ) : null}
        </Stack>
      </Stack>
    );
  }
);

export default FortressVideo;
