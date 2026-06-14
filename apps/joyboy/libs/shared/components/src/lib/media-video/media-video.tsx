'use client';
import ReactPlayer, { type ReactPlayerProps } from 'react-player';
import { useState, useEffect, useRef } from 'react';
import { Stack } from '@castlery/fortress';
import { ArrowBack } from '@castlery/fortress/Icons';

export const mediaVideoClasses = {
  player: 'media-video',
};
/**
 * Video component for displaying videos
 * see the best practices for video optimization:
 * https://nextjs.org/docs/app/building-your-application/optimizing/videos#video-best-practices
 * react-player
 * @doc: https://github.com/cookpete/react-player
 */
interface MediaVideoProps extends ReactPlayerProps {
  src: string;
}
export function MediaVideo({ src, ...opts }: MediaVideoProps) {
  const playerWrapperRef = useRef(null);

  const [shortVideo, setShortVideo] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  const handleDuration = (duration: number) => {
    const isShortVideo = Math.round(duration) <= 10;
    setShortVideo(isShortVideo);
  };

  const isPlaying = canPlay && shortVideo;

  useEffect(() => {
    //监听 组件进入视窗内再自动播放
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCanPlay(true);
          } else {
            setCanPlay(false);
          }
        });
      },
      { threshold: 0.2 }
    ); // 0.2 表示当元素有 20% 在视窗内时触发回调函数
    playerWrapperRef.current && observer.observe(playerWrapperRef.current);
    return () => {
      setCanPlay(false);
      observer.disconnect(); // 组件卸载时取消监听
    };
  }, [playerWrapperRef]);

  return (
    <Stack ref={playerWrapperRef} sx={{ width: 'inherit', height: 'inherit' }}>
      <ReactPlayer
        className={mediaVideoClasses.player}
        url={src}
        muted={true}
        playing={isPlaying}
        loop={true}
        controls={!shortVideo}
        playsinline={true}
        stopOnUnmount={true}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              'data-dt-id': opts['data-dt-id'], // 禁止显示下载按钮
            },
          },
        }}
        onDuration={handleDuration}
        {...opts}
      />
    </Stack>
  );
}

export default MediaVideo;
