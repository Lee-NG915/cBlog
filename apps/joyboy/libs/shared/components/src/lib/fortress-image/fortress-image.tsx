'use client';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { AspectRatio } from '@castlery/fortress';
import Image from 'next/image';
import { BREAKPOINTS_FINAL } from '@castlery/utils';
import {
  castleryCDN,
  castleryTestCDN,
  cloudinary,
  defaultImage,
  // deviceWidths,
  generateSizes,
} from './util';
import { logger } from '@castlery/observability/client';

export interface FortressImageProps extends Omit<typeof Image, 'src' | 'alt' | '$$typeof'> {
  src: string; // responsive image src
  alt: string;
  imageWidth?: string | number;
  imageHeight?: string | number;
  objectFit?: string;
  sx?: unknown;
  ratio?: number;
  sizes?: Array<string | number> | string;
  lazy?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  draggable?: boolean;
  needPreload?: boolean;
}

// export const FortressImage = React.memo<FortressImageProps>();
export const FortressImage = (props: FortressImageProps) => {
  const {
    ratio,
    objectFit = 'contain',
    src,
    alt,
    sx,
    sizes,
    imageWidth,
    imageHeight,
    lazy = true,
    needPreload,
    onLoad,
    ...rest
  } = props;
  // const [imageSize, setImageSize] = React.useState<any>(
  //   (sizes && generateSizes(sizes)) ||
  //     '(max-width: 400px) 200px, (max-width: 768px) 390px, (max-width: 1024px) 800px, (min-width: 1025px) and (max-width: 1200px) 1036px, 1728px'
  // );
  const imageSize = useMemo(() => {
    return (
      (sizes && generateSizes(sizes)) ||
      '(max-width: 400px) 200px, (max-width: 768px) 390px, (max-width: 1024px) 800px, (max-width: 1200px) 1036px, 1728px'
    );
  }, [sizes]);
  const [imageSrc, setImageSrc] = useState<string>(src || defaultImage());
  const getWidth = useMemo(() => {
    let displayWidth: string | number = '';
    if (imageWidth) {
      displayWidth = imageWidth as string | number;
    } else if ((sx as { width: number | string })?.width) {
      if (
        typeof (sx as any)?.width === 'string' &&
        ((sx as any)?.width?.includes('vw') || (sx as any)?.width?.includes('%'))
      ) {
        return undefined;
      }
      displayWidth = (sx as { width: string })?.width;
    }
    if (typeof displayWidth === 'string') {
      const match = displayWidth.match(/\d+/);
      if (match) {
        displayWidth = match[0];
      }
    }
    return displayWidth ? (displayWidth as number) : undefined;
  }, [imageWidth, sx]);
  const getHeight = useMemo(() => {
    let displayHeight: string | number = '';
    if (imageHeight) {
      displayHeight = imageHeight as string | number;
    } else if ((sx as { height: number | string })?.height) {
      if (
        typeof (sx as any)?.height === 'string' &&
        ((sx as any)?.height?.includes('vw') || (sx as any)?.height?.includes('%'))
      ) {
        return undefined;
      }
      displayHeight = (sx as { height: string })?.height;
    }
    if (typeof displayHeight === 'string') {
      const match = displayHeight.match(/\d+/);
      if (match) {
        displayHeight = match[0];
      }
    }
    return displayHeight ? (displayHeight as number) : undefined;
  }, [imageHeight, sx]);
  const [width, setWidth] = useState<number | undefined>(getWidth);
  const [height, setHeight] = useState<number | undefined>(getHeight);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  // const [imageblurDataURL, setImageBlurDataURL] = useState<string>('');
  const prevPropsRef = useRef<FortressImageProps>();

  const processImage = useCallback(() => {
    const displayWidth = getWidth;
    const displayHeight = getHeight;
    setWidth(getWidth);
    setHeight(getHeight);
    if (displayWidth) {
      // 有 width 就直接用来生成 sizes，不需要再计算
      // setImageSize(`${displayWidth}px`);
    } else if (displayHeight && ratio) {
      // setImageSize(`${+displayHeight * ratio}px`);
    } else {
      // setImageSize(generateSizes(sizes));
    }
  }, [getWidth, getHeight, ratio, sizes]);

  useEffect(() => {
    if (prevPropsRef.current) {
      const prevProps = prevPropsRef.current;
      const propsChanged =
        prevProps.src !== src ||
        (prevProps.sx as any)?.width !== (sx as any)?.width ||
        (prevProps.sx as any)?.height !== (sx as any)?.height ||
        prevProps.sizes !== sizes ||
        prevProps.imageWidth !== imageWidth ||
        prevProps.imageHeight !== imageHeight;
      if (propsChanged) {
        processImage();
      }
    } else {
      processImage();
    }
    prevPropsRef.current = props;
  }, [src, sx, sizes, imageWidth, imageHeight, processImage, props]);

  useEffect(() => {
    setImageSrc(src || defaultImage());
  }, [src]);

  const imageLoader = useCallback(({ src, ...rest }: { src: string; width: unknown; quality?: unknown }) => {
    if (src?.startsWith(cloudinary)) {
      const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;
      let cleanedParams = '';

      const simpleUrl = src.replace(reg, (match, ...args) => {
        // 检查 args[2] 是否包含 Cloudinary 变换参数
        // 变换参数通常包含下划线且符合 Cloudinary 参数格式
        const hasTransformParams = args[2].match(/[whfqcg]_|ar_|so_|co_|bo_|ro_|e_|dpr_|fl_/);

        if (hasTransformParams) {
          // 提取质量参数的值（如 q_auto:best 中的 best）
          let qualityValue = 'auto';
          const qualityMatch = args[2].match(/q_auto:([^,]+)/);
          if (qualityMatch) {
            const matchValue = qualityMatch[1];
            if (matchValue) {
              qualityValue = matchValue;
            }
          }

          cleanedParams = args[2]
            .replace(/,?w_\d*,?/g, '')
            .replace(/,?h_\d*,?/g, '')
            .replace(/,?f_auto,?/g, '')
            .replace(/,?q_auto(?::[^,]+)?,?/g, '') // 清理 q_auto 和 q_auto:xxx
            .replace(/^,+|,+$/g, '')
            .replace(/,+/g, ',');

          (rest as any).extractedQuality = qualityValue;

          args[2] = '';
          return args.splice(0, 4).filter(Boolean).join('/');
        } else {
          // 如果不包含变换参数（版本号、文件夹名等），不处理
          cleanedParams = '';
          return args.splice(0, 4).filter(Boolean).join('/');
        }
      });

      const qualityParam =
        (rest as any).extractedQuality && (rest as any).extractedQuality !== 'auto'
          ? `q_auto:${(rest as any).extractedQuality}`
          : 'q_auto';
      const newTransformParams = cleanedParams
        ? `w_${(rest as any).width},f_auto,${qualityParam},${cleanedParams}`
        : `w_${(rest as any).width},f_auto,${qualityParam}`;

      const finalUrl = simpleUrl.replace(/\/(private|upload)\//, `/$1/${newTransformParams}/`);
      return finalUrl.replace(/ /g, '%20');
    } else {
      if (src?.startsWith(castleryCDN) || src?.startsWith(castleryTestCDN)) {
        const regKey = Array.from(BREAKPOINTS_FINAL.values())
          .map((item) => item + '_overlay')
          .join('|');
        const reg = `/(${regKey})/`;
        const simpleUrl = src.replace('img-test', 'img').replace(new RegExp(reg), (match, ...args) => {
          return `/${(BREAKPOINTS_FINAL.get((rest as any).width) as string) || 'mini'}_overlay/`;
        });
        return simpleUrl.replace(/ /g, '%20');
      }
    }
    return src.replace(/ /g, '%20');
  }, []);

  const errorHandler = useCallback((e: any) => {
    logger.warn('Failed to load image', { imageId: e.target.id, src: e.target.src });
    setImageSrc(defaultImage());
  }, []);

  return (
    <AspectRatio
      ratio={ratio}
      objectFit={imageSrc !== defaultImage() ? (objectFit as any) : 'contain'}
      sx={Object.assign(
        {
          width: (width && `${width}px`) || '100%',
          height: height && `${height}px`,
          ...(!ratio && !height
            ? {
                '--AspectRatio-paddingBottom':
                  'clamp(var(--AspectRatio-minHeight), 100%, var(--AspectRatio-maxHeight))',
              }
            : {}),
        },
        {
          '& > .MuiAspectRatio-content': {
            height: '100%',
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
          },
        },
        sx
      )}
    >
      <Image
        style={{
          filter: imageLoading ? 'blur(5px)' : 'blur(0)',
          transition: 'filter 0.3s ease-in',
        }}
        // src={!realLazy ? src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}
        src={imageSrc}
        loader={imageLoader}
        alt={alt}
        fill
        sizes={imageSize}
        priority={!lazy}
        unoptimized={
          !(
            imageSrc?.startsWith(cloudinary) ||
            imageSrc?.startsWith(castleryCDN) ||
            imageSrc?.startsWith(castleryTestCDN)
          )
        }
        fetchPriority={needPreload ? 'high' : 'auto'}
        onLoad={() => {
          setImageLoading(false);
          onLoad?.();
        }}
        onError={errorHandler}
        {...rest}
      />
    </AspectRatio>
  );
};
