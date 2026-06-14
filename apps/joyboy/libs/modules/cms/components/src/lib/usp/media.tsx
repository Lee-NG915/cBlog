'use client';
import { Box } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { FortressVideo } from '@castlery/shared-components';
import { useTrackingTags } from '@castlery/modules-tracking-components';
// const MediaVideo = dynamic(() => import('./usp-video'), { ssr: false });

export const mediaClasses = {
  root: 'media-wrapper',
};
export interface MediaProps {
  media_url: string;
  ratio: number;
  outerModuleName?: string;
  onClick?: () => void;
}

export function Media({ media_url, ratio, outerModuleName = '', onClick, ...rest }: MediaProps) {
  const videoRegex = /\.(mp4|mkv|webm|ogg|avi|mov|flv|wmv)$/i;
  const isVideo = videoRegex.test(media_url);

  const trackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: 'Media Video',
  });

  return (
    <Box className={mediaClasses.root}>
      {isVideo ? (
        // <MediaVideo {...trackingTags} src={media_url} {...(rest || {})} />
        <FortressVideo
          {...trackingTags}
          src={media_url}
          containerConfig={{
            aspectRatio: ratio,
            objectFit: 'cover',
          }}
          loop={true}
          muted
          lazyLoad={true}
          autoPlayOnVisible={true}
          autoPauseOnVisible={true}
          threshold={0}
          rootMargin="20px"
          outerBackground="transparent"
          {...(rest || {})}
        />
      ) : (
        <FortressImage
          src={media_url}
          alt={''}
          ratio={ratio}
          objectFit="cover"
          onClick={onClick}
          sizes={['0.4-md', '1-sm', '1-xs']}
          {...(rest || {})}
        />
      )}
    </Box>
  );
}
