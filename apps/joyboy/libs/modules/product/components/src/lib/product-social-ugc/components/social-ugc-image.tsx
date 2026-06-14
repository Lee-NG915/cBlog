import { Box, Icons, Tag, Typography, withBrandColor } from '@castlery/fortress';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { generateVideoThumbnail } from '@castlery/utils';
import { useMemo } from 'react';
import { SocialUgcAutoPlayVideo } from './social-ugc-auto-play-video';
interface SocialUgcImageProps {
  ugc: MappedSocialUgcItem;
  showOverladed?: boolean;
  ratio?: number;
  thumbnailAspectRatio?: string;
  onPlay?: () => void;
  isPlaying?: boolean;
  onShouldSwitch?: () => void;
  /** 仅对视频有效：为 true 时才挂载并加载视频，用于 Slider 内仅加载视窗内视频 */
  shouldLoadVideo?: boolean;
}

export function SocialUgcImage(props: SocialUgcImageProps) {
  const { ugc, showOverladed = true, ratio = 9 / 16, thumbnailAspectRatio = '9:16', ...rest } = props;

  const mediaUrl = useMemo(() => {
    if (!ugc?.media) return '';

    if (ugc?.fileType === 'video') {
      const result = generateVideoThumbnail(ugc.media, {
        thumbnailAspectRatio,
        thumbnailStartOffset: ugc?.startOffset || 0,
      });

      return result || ugc.media;
    }

    // 如果是图片类型，直接使用原始 URL
    return ugc.media;
  }, [thumbnailAspectRatio, ugc?.media, ugc?.fileType, ugc?.startOffset]);

  return (
    <Box
      key={ugc?._uid}
      sx={{
        position: 'relative',
        cursor: 'pointer',

        '&:hover': {
          '& img': {
            transform: 'scale(1.03)',
            transition: 'transform 0.3s ease',
          },
        },
      }}
      {...rest}
    >
      {['video']?.includes(ugc?.fileType) ? (
        <SocialUgcAutoPlayVideo
          ugcData={ugc}
          ratio={ratio}
          thumbnailAspectRatio={thumbnailAspectRatio}
          isPlaying={props.isPlaying}
          onShouldSwitch={props.onShouldSwitch}
          shouldLoadVideo={props.shouldLoadVideo}
        />
      ) : (
        <FortressImage
          src={mediaUrl}
          alt={`Instagram post by ${ugc?.ig_handle || 'Castlery'} - ${ugc?._uid || 'post'}`}
          objectFit="cover"
          ratio={ratio}
          draggable
          sizes={['0.25-md', '0.33-sm', '0.67-xs']}
        />
      )}
      {showOverladed && ['image']?.includes(ugc?.fileType) && (
        <Tag
          sx={(theme) => ({
            position: 'absolute',
            bottom: theme.spacing(3),
            left: theme.spacing(3),
            maxWidth: '80%',
            overflow: 'hidden',
            backgroundColor: theme.palette.brand.terracotta[500],
          })}
          variant="soft"
        >
          <Typography
            level="body2"
            sx={{
              fontFamily: 'var(--fortress-fontFamily-display)',
              display: 'block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#F6F3E7',
            }}
          >
            {ugc?.ig_handle}
          </Typography>
        </Tag>
      )}
    </Box>
  );
}
