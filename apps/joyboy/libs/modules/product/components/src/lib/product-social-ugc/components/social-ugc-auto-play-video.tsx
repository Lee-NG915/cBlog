'use client';

import { FortressImage, FortressVideo, FortressVideoHandle } from '@castlery/shared-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, withBrandColor, Typography, Tag } from '@castlery/fortress';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { generateVideoThumbnail } from '@castlery/utils';

interface SocialUgcAutoPlayVideoProps {
  ugcData: MappedSocialUgcItem;
  showOverladed?: boolean;
  ratio?: number;
  thumbnailAspectRatio?: string;
  onReady?: () => void;
  isPlaying?: boolean;
  onShouldSwitch?: () => void;
  /** 为 true 时才挂载并加载视频，否则仅展示封面；用于 Slider 内仅加载视窗内的视频 */
  shouldLoadVideo?: boolean;
}

const SocialUgcAutoPlayVideo = ({
  ugcData,
  showOverladed = true,
  ratio = 9 / 16,
  thumbnailAspectRatio = '9:16',
  onReady,
  isPlaying,
  onShouldSwitch,
  shouldLoadVideo = true,
}: SocialUgcAutoPlayVideoProps) => {
  const [paused, setPaused] = useState(true);
  const hasTriggeredSwitchRef = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<FortressVideoHandle>(null);

  const thumbnailUrl = useMemo(() => {
    if (!ugcData?.media) return '';

    if (ugcData?.fileType === 'video') {
      const result = generateVideoThumbnail(ugcData.media, {
        thumbnailAspectRatio,
        thumbnailStartOffset: ugcData?.startOffset || 0,
      });

      return result || ugcData.media;
    }

    return ugcData.media;
  }, [thumbnailAspectRatio, ugcData?.media, ugcData?.fileType, ugcData?.startOffset]);

  // 当 isPlaying 变为 true 时，重置视频到0秒并播放
  useEffect(() => {
    if (isPlaying === true && videoRef.current) {
      hasTriggeredSwitchRef.current = false;
      videoRef.current.replay();
      setPaused(false);
    } else if (isPlaying === false && videoRef.current) {
      videoRef.current.pause();
      setPaused(true);
    }
  }, [isPlaying]);

  // 定期检查视频播放时间，当播放到3秒时触发切换
  useEffect(() => {
    if (!isPlaying || !onShouldSwitch) {
      return;
    }

    const interval = setInterval(() => {
      if (videoContainerRef.current) {
        // 查找视频元素
        const videoElement = videoContainerRef.current.querySelector('video') as HTMLVideoElement;
        if (videoElement && videoElement.currentTime >= 3 && !hasTriggeredSwitchRef.current) {
          hasTriggeredSwitchRef.current = true;
          onShouldSwitch();
        }
      }
    }, 100); // 每100ms检查一次

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, onShouldSwitch]);

  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
      }}
    >
      {paused && (
        <Stack
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            cursor: 'pointer',
            div: {
              height: '100%',
            },
          })}
        >
          <FortressImage
            src={thumbnailUrl}
            alt={`Instagram post by ${ugcData?.ig_handle || 'Castlery'} - ${ugcData?._uid || 'post'}`}
            objectFit="cover"
            ratio={ratio}
            draggable
            sizes={['0.25-md', '0.33-sm', '0.67-xs']}
          />
        </Stack>
      )}
      {showOverladed && (
        <Tag
          sx={(theme) => ({
            position: 'absolute',
            bottom: theme.spacing(4),
            left: theme.spacing(4),
            zIndex: 3,
            backgroundColor: theme.palette.brand.terracotta[500],
          })}
          variant="soft"
        >
          <Typography
            level="body2"
            sx={{
              fontFamily: 'var(--fortress-fontFamily-display)',
              color: '#F6F3E7',
            }}
          >
            {ugcData?.ig_handle}
          </Typography>
        </Tag>
      )}
      <Stack
        ref={videoContainerRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          cursor: 'pointer',
        }}
      >
        {shouldLoadVideo && ugcData?.media ? (
          <FortressVideo
            ref={videoRef}
            src={ugcData.media}
            loop={true}
            muted={true}
            controls={false}
            containerConfig={{
              aspectRatio: ratio,
              objectFit: 'fill',
            }}
            onReady={onReady}
            outerBackground="transparent"
          />
        ) : null}
      </Stack>
    </Stack>
  );
};

export { SocialUgcAutoPlayVideo };
