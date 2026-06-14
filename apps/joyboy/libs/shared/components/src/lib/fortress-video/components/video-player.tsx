'use client';
import ReactPlayer, { ReactPlayerProps } from 'react-player';

export type VideoPlayerProps = ReactPlayerProps & {
  playRef?: React.RefObject<ReactPlayer> | React.RefCallback<ReactPlayer>;
};
export const VideoPlayer = (props: VideoPlayerProps) => {
  const { playRef, ...rest } = props;
  return <ReactPlayer ref={playRef} {...rest} />;
};

export default VideoPlayer;
