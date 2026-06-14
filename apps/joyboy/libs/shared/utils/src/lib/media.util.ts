// interface VideoInfo {
//   id: string;
//   type: string;
//   thumbnail: string;
//   transformId: string;
//   videoRoot: string;
// }

// export const privateCloudinaryBasePath = 'castlery';
// export const videoCloudinaryRoot = `https://res.cloudinary.com/${privateCloudinaryBasePath}/video/upload`;
// export const privateCloudinaryRoot = `https://res.cloudinary.com/${privateCloudinaryBasePath}/image/private`;
// export const privateVideoCloudinaryRoot = `https://res.cloudinary.com/${privateCloudinaryBasePath}/video/private`;

// /**
//  * Generates video information for Cloudinary video paths.
//  *
//  * @param path - The video path, potentially a Cloudinary URL. Defaults to ''.
//  * @param startOffset - The start offset for the thumbnail, as a string. Defaults to '0'.
//  * @returns An object containing video information if the path is a valid Cloudinary path, otherwise undefined.
//  */
// export const genVideoInfo = (path = '', startOffset = '0'): VideoInfo | undefined => {
//   const isPrivateCloudinaryVideo = path.startsWith(privateVideoCloudinaryRoot);
//   const isCloudinaryVideo = path.startsWith(videoCloudinaryRoot);

//   if (isPrivateCloudinaryVideo || isCloudinaryVideo) {
//     const videoRoot = isPrivateCloudinaryVideo ? privateVideoCloudinaryRoot : videoCloudinaryRoot;
//     // Using optional chaining and nullish coalescing for safety, though default '' makes path non-null
//     const [, url] = path?.split(videoRoot) ?? [];

//     // Handle cases where split might not produce the expected structure
//     if (!url) {
//       return undefined;
//     }

//     const i = url.lastIndexOf('.');
//     let id = url.slice(0, i);
//     id = id.startsWith('/') ? id.slice(1) : id;

//     // Construct thumbnail URL
//     const thumbnail = `${videoRoot}/w_120,ar_1,c_fill,g_center,so_${startOffset},q_auto,f_auto/${id}.jpg`;
//     const transformId = `so_0,q_auto,f_auto/${id}`;

//     const res: VideoInfo = {
//       id,
//       // Use optional chaining and nullish coalescing for the file extension
//       type: path?.split('.').pop() || 'mp4',
//       thumbnail,
//       transformId,
//       videoRoot,
//     };
//     return res;
//   }

//   // Return undefined if the path is not a recognized Cloudinary video path
//   return undefined;
// };

/** 缩略图生成选项 */
export interface ThumbnailOptions {
  /** 缩略图时间偏移（秒），例如：5.5 表示第 5.5 秒的帧 */
  thumbnailStartOffset?: number;
  /** 缩略图百分比位置（0-100），例如：50 表示视频中间位置的帧 */
  thumbnailPercentage?: number;
  /** 缩略图宽度，默认 200 */
  thumbnailWidth?: number;
  /** 缩略图高度，自动计算或手动指定 */
  thumbnailHeight?: number;
  /** 缩略图宽高比，例如：'16:9', '4:3', '1:1' 或数字如 1.77, 2.5 */
  thumbnailAspectRatio?: string | number;
  /** 缩略图裁剪模式，例如：'fill', 'fit', 'crop', 'scale', 'pad' */
  thumbnailCrop?: string;
  /** 缩略图重心位置，例如：'center', 'face', 'auto' */
  thumbnailGravity?: string;
  /** 缩略图质量，例如：'auto', 'best', '80' */
  thumbnailQuality?: string;
  /** 缩略图格式，例如：'auto', 'jpg', 'png' */
  thumbnailFormat?: string;
  /** 备用海报图片 */
  poster?: string;
}

export const privateCloudinaryBasePath = 'castlery';

// Cloudinary 根路径常量
const CLOUDINARY_ROOTS = [
  `https://res.cloudinary.com/${privateCloudinaryBasePath}/video/upload`,
  `https://res.cloudinary.com/${privateCloudinaryBasePath}/video/private`,
  `https://res.cloudinary.com/${privateCloudinaryBasePath}/image/upload`,
  `https://res.cloudinary.com/${privateCloudinaryBasePath}/image/private`,
];

/**
 * 提取 Cloudinary 公共 ID
 */
export const getCloudinaryPublicId = (url = ''): string => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const formatUrl = decodeURIComponent(url);

  // 检查是否匹配任何一个根路径
  for (const root of CLOUDINARY_ROOTS) {
    if (formatUrl.startsWith(root)) {
      // 使用 split 提取 URL 部分，参考 genVideoInfo 的逻辑
      const [, urlPart] = formatUrl.split(root);

      if (!urlPart) {
        return formatUrl;
      }

      // 去掉文件扩展名
      const i = urlPart.lastIndexOf('.');
      let id = urlPart.slice(0, i);

      // 去掉开头的斜杠
      id = id.startsWith('/') ? id.slice(1) : id;

      return id;
    }
  }

  // 如果不是 Cloudinary URL，直接返回
  return formatUrl;
};

/**
 * 获取 Cloudinary 视频根路径
 */
const getVideoRoot = (url: string): string => {
  const formatUrl = decodeURIComponent(url);

  for (const root of CLOUDINARY_ROOTS) {
    if (formatUrl.startsWith(root)) {
      return root;
    }
  }

  return '';
};

/**
 * 解析宽高比为数值
 */
const parseAspectRatio = (aspectRatio: string | number): number | null => {
  if (typeof aspectRatio === 'number') {
    return aspectRatio > 0 ? aspectRatio : null;
  }

  if (typeof aspectRatio === 'string') {
    const numericMatch = aspectRatio.match(/^\d*\.?\d+$/);
    if (numericMatch) {
      const value = parseFloat(aspectRatio);
      return value > 0 ? value : null;
    }

    const ratioMatch = aspectRatio.match(/^(\d+):(\d+)$/);
    if (ratioMatch) {
      const width = parseInt(ratioMatch[1], 10);
      const height = parseInt(ratioMatch[2], 10);
      return height > 0 ? width / height : null;
    }
  }

  return null;
};

/**
 * 从 Cloudinary URL 提取文件路径（包含扩展名）
 */
const extractCloudinaryFilePath = (url: string, videoRoot: string): string | null => {
  const formatUrl = decodeURIComponent(url);
  const [, urlPart] = formatUrl.split(videoRoot);

  if (!urlPart) {
    return null;
  }

  return urlPart.startsWith('/') ? urlPart.slice(1) : urlPart;
};

/**
 * 构建 Cloudinary 变换参数数组
 */
const buildTransformParams = (options: {
  width?: number;
  height?: number;
  aspectRatio?: string | number;
  quality?: string;
  format?: string;
  startOffset?: number;
  percentage?: number;
  crop?: string;
  gravity?: string;
  ac?: boolean;
}): string[] => {
  const transformParams: string[] = [];

  // 尺寸参数
  if (options.width && options.width > 0) {
    transformParams.push(`w_${Math.round(options.width)}`);
  }
  if (options.height && options.height > 0) {
    transformParams.push(`h_${Math.round(options.height)}`);
  }

  // 宽高比参数
  if (options.aspectRatio) {
    const aspectRatioValue = parseAspectRatio(options.aspectRatio);
    if (aspectRatioValue) {
      // const roundedRatio = Math.round(aspectRatioValue * 10) / 10;
      // transformParams.push(`ar_${roundedRatio}`);
      transformParams.push(`ar_${aspectRatioValue}`);
    }
  }

  // 时间偏移参数（视频缩略图专用）
  if (typeof options.startOffset === 'number' && options.startOffset >= 0) {
    const offsetValue = options.startOffset % 1 === 0 ? options.startOffset.toString() : options.startOffset.toFixed(1);
    transformParams.push(`so_${offsetValue}`);
  } else if (typeof options.percentage === 'number' && options.percentage >= 0 && options.percentage <= 100) {
    transformParams.push(`so_${options.percentage}p`);
  }

  // 裁剪参数（缩略图专用）
  if (options.crop) {
    transformParams.push(`c_${options.crop}`);
  }

  // 重心参数（缩略图专用）
  if (options.gravity) {
    transformParams.push(`g_${options.gravity}`);
  }

  // 质量参数
  if (options.quality) {
    if (options.quality !== 'auto') {
      transformParams.push(`q_auto:${options.quality}`);
    } else {
      transformParams.push('q_auto');
    }
  }

  // 格式参数
  if (options.format) {
    if (options.format !== 'auto') {
      transformParams.push(`f_${options.format}`);
    } else {
      transformParams.push('f_auto');
    }
  }

  // 音轨消除参数
  if (options.ac) {
    transformParams.push('ac_none');
  }

  return transformParams;
};

/**
 * 生成 Cloudinary 视频缩略图 URL
 */
export const generateVideoThumbnail = (videoSrc: string, options: ThumbnailOptions = {}): string | undefined => {
  const {
    thumbnailStartOffset,
    thumbnailPercentage,
    thumbnailWidth = 200,
    thumbnailHeight,
    thumbnailAspectRatio,
    thumbnailCrop = 'fill',
    thumbnailGravity = 'center',
    thumbnailQuality = 'auto',
    thumbnailFormat = 'auto',
    poster,
  } = options;

  // 输入验证
  if (!videoSrc || typeof videoSrc !== 'string') {
    console.warn('generateVideoThumbnail: Invalid video source for thumbnail generation');
    return poster;
  }

  // 获取视频根路径
  const videoRoot = getVideoRoot(videoSrc);
  if (!videoRoot) {
    console.warn('generateVideoThumbnail: Not a valid Cloudinary URL');
    return poster;
  }

  // 提取文件路径
  const filePath = extractCloudinaryFilePath(videoSrc, videoRoot);
  if (!filePath) {
    console.warn('generateVideoThumbnail: Could not extract file path for thumbnail generation');
    return poster;
  }

  // 获取不带扩展名的 publicId（缩略图需要改为 .jpg）
  const publicId = getCloudinaryPublicId(videoSrc);
  if (!publicId) {
    console.warn('generateVideoThumbnail: Could not extract public ID for thumbnail generation');
    return poster;
  }

  // 构建变换参数（g_auto 需单独作为 URL 段，不与其他参数逗号拼接）
  const transformParams = buildTransformParams({
    width: thumbnailWidth,
    height: thumbnailHeight,
    aspectRatio: thumbnailAspectRatio,
    startOffset: thumbnailStartOffset,
    percentage: thumbnailPercentage,
    quality: thumbnailQuality,
    format: thumbnailFormat,
    crop: thumbnailCrop,
    gravity: thumbnailGravity === 'auto' ? undefined : thumbnailGravity,
  });

  // 构建完整的缩略图 URL
  const transformString = transformParams.join(',');
  const thumbnailUrl = [videoRoot, transformString, thumbnailGravity === 'auto' ? 'g_auto' : '', `${publicId}.jpg`]
    .filter(Boolean)
    .join('/');

  return thumbnailUrl;
};

/** CSS objectFit → Cloudinary crop 映射 */
export const objectFitToCrop: Record<string, string> = {
  contain: 'fit',
  cover: 'fill',
  fill: 'scale',
  'scale-down': 'limit',
  none: 'none',
};

/** 解析 rootMargin 字符串为四个方向的 px 值（仅支持 px 单位） */
export function parseRootMargin(rootMargin: string): { top: number; right: number; bottom: number; left: number } {
  const parts = rootMargin
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v) || 0);
  const [top = 0, right = top, bottom = top, left = right] = parts;
  return { top, right, bottom, left };
}

/**
 * 主动检测元素是否满足 IntersectionObserver 的可见性条件。
 * 用于 observer 建立后的首屏确定性判定，替代 takeRecords() 方案。
 */
export function checkIsVisible(el: Element, root: Element | null, rootMargin: string, threshold: number): boolean {
  if (typeof window === 'undefined') return false;
  const rect = el.getBoundingClientRect();
  const margins = parseRootMargin(rootMargin);
  const rootBounds = root
    ? root.getBoundingClientRect()
    : { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth };
  const clippedTop = rootBounds.top - margins.top;
  const clippedLeft = rootBounds.left - margins.left;
  const clippedBottom = rootBounds.bottom + margins.bottom;
  const clippedRight = rootBounds.right + margins.right;
  const intersectTop = Math.max(rect.top, clippedTop);
  const intersectLeft = Math.max(rect.left, clippedLeft);
  const intersectBottom = Math.min(rect.bottom, clippedBottom);
  const intersectRight = Math.min(rect.right, clippedRight);
  if (intersectBottom <= intersectTop || intersectRight <= intersectLeft) return false;
  const intersectionArea = (intersectBottom - intersectTop) * (intersectRight - intersectLeft);
  const elementArea = rect.width * rect.height;
  if (elementArea === 0) return false;
  return intersectionArea / elementArea >= threshold;
}

/** 视频变换选项 */
export interface VideoOptions {
  /** 视频质量，例如：'auto', 'best', '80' */
  quality?: string;
  /** 视频格式，例如：'auto', 'mp4', 'webm' */
  format?: string;
  /** 视频宽度 */
  width?: number;
  /** 视频高度 */
  height?: number;
  /** 视频宽高比，例如：'16:9', '4:3', '1:1' 或数字如 1.77, 2.5 */
  aspectRatio?: string | number;
  /** 裁剪模式，例如：'fill', 'fit', 'crop', 'scale', 'pad' */
  crop?: string;
  /** 重心位置，例如：'center', 'face', 'auto' */
  gravity?: string;
  /** 是否启用音轨消除 */
  ac?: boolean;
}

/**
 * 生成 Cloudinary 视频播放 URL
 */
export const generateVideoUrl = (videoSrc: string, options: VideoOptions = {}): string => {
  const { quality = 'auto', format = 'auto', width, height, aspectRatio, crop, gravity, ac } = options;

  // 输入验证
  if (!videoSrc || typeof videoSrc !== 'string') {
    console.warn('generateVideoUrl: Invalid video source');
    return videoSrc;
  }

  // 如果不是完整 URL，直接返回
  if (!videoSrc.startsWith('http')) {
    return videoSrc;
  }

  // 获取视频根路径
  const videoRoot = getVideoRoot(videoSrc);
  if (!videoRoot) {
    // 不是 Cloudinary URL，原样返回
    return videoSrc;
  }

  // // 如果没有变换参数，原样返回
  // if (!width && !height && !aspectRatio && quality === 'auto' && format === 'auto') {
  //   return videoSrc;
  // }

  // 提取文件路径（包含扩展名）
  const filePath = extractCloudinaryFilePath(videoSrc, videoRoot);
  if (!filePath) {
    return videoSrc;
  }

  // 构建变换参数（g_auto 需单独作为 URL 段，不与其他参数逗号拼接）
  const transformParams = buildTransformParams({
    width,
    height,
    aspectRatio,
    quality,
    format,
    crop,
    gravity: gravity === 'auto' ? undefined : gravity,
    ac,
  });

  // 构建完整的视频 URL
  const transformString = transformParams.join(',');
  const videoUrl = [videoRoot, transformString, gravity === 'auto' ? 'g_auto' : '', filePath].filter(Boolean).join('/');

  return videoUrl;
};
