import { getBreakpoint, getBreakpointKeys } from 'utils/breakpoints';

const imageSizes = {
  280: 'mini',
  420: 'small',
  560: 'mini_x2',
  750: 'medium',
  840: 'small_x2',
  1000: 'large',
  1500: 'medium_x2',
  1995: 'large_x2',
};
const cloudinary = 'https://res.cloudinary.com/';

export const processUrl = (url, width = '{width}', bestQuality = false) => {
  if (url?.startsWith(cloudinary)) {
    const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;

    const simpleUrl = url.replace(reg, (match, ...args) => {
      args[2] = args[2]
        .replace(/,?w_\d*,?/, '')
        .replace(/,?f_auto,?/, '')
        .replace(/,?q_auto,?/, '');
      return args.splice(0, 4).filter(Boolean).join('/');
    });
    if (bestQuality) {
      return simpleUrl.replace(/\/(private|upload)\//, `/$1/f_auto,q_auto:best/`);
    }
    return simpleUrl.replace(/\/(private|upload)\//, width ? `/$1/w_${width},f_auto,q_auto/` : '/$1/f_auto,q_auto/');
  }
  return url;
};

export const processSrcset = (srcset, width = '{width}', bestQuality = false) => {
  if (typeof srcset === 'string') {
    return processUrl(srcset, width, bestQuality);
  }
  if (typeof srcset === 'object' && srcset) {
    if (!srcset.large) {
      return '';
    }
    return processUrl(srcset.large, width, bestQuality);
  }
  return '';
};

export const processSrcsetNotLazy = (srcset, widths, bestQuality = false) => {
  if (typeof srcset === 'string') {
    return widths.map((w) => `${processSrcset(srcset, w, bestQuality)} ${w}w`).join(', ');
  }
  if (typeof srcset === 'object' && srcset) {
    if (srcset.large?.startsWith(cloudinary)) {
      return widths.map((w) => `${processSrcset(srcset, w, bestQuality)} ${w}w`).join(', ');
    }
    const sizeArr = Object.keys(imageSizes);
    return widths
      .map((w) => {
        const targetSize = sizeArr.find((size) => size >= +w);
        const val = imageSizes[targetSize];
        return `${srcset[val]} ${w}w`;
      })
      .join(', ');
  }
  return '';
};

// When sizeDescriptor = ['0.5-md', '1'], the function will returns '(min-width: 768px) 50vw, 100vw'
// When sizeDescriptor = ['100px-md', '1'], the function will returns '(min-width: 768px) 100px, 100vw'
// '0.5-md' means 'widthPercent-breakpoint' and '100px-md' means 'width-breakpoint'
export const generateSizes = (sizeDescriptor) => {
  const defaultSizes = '(min-width: 1500px) 1440px, 100vw';
  let hasEnd = false;
  if (Array.isArray(sizeDescriptor)) {
    const segments = sizeDescriptor.map((desc, i) => {
      const keyString = getBreakpointKeys().join('|');
      const reg = new RegExp(`^(0\\.\\d+|1|\\d+px)-(${keyString})$`);

      const matcher = reg.exec(desc);
      if (matcher) {
        const breakpoint = getBreakpoint(matcher[2], 'min');
        const width = matcher[1];
        return `(min-width: ${breakpoint}px) ${width.endsWith('px') ? width : `${Math.floor(width * 100)}vw`}`;
      }

      const targetDesc = desc || '1';
      if (/^(0\.\d+|1)$/.test(targetDesc) && i + 1 === sizeDescriptor.length && i >= 1) {
        hasEnd = true;
        return `${Math.floor(targetDesc * 100)}vw`;
      }
      return '';
    });
    const realSegments = segments.filter(Boolean);
    if (realSegments.length === 0) {
      return defaultSizes;
    }
    let sizes = realSegments.join(', ');
    if (!hasEnd) {
      sizes += ', 100vw';
    }
    return sizes;
  }
  if (sizeDescriptor && typeof sizeDescriptor === 'string') {
    return sizeDescriptor;
  }
  return defaultSizes;
};

/**
 * @description Determine whether the image has loaded successfully
 * @param {*} srcset img srcset
 * @returns
 */
export function isSrcsetLoaded(srcset) {
  const sources = srcset.split(', ');
  const imagePromises = sources.map(
    (source) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.srcset = source.trim().split(' ')[0];
        img.onload = () => {
          resolve(true);
        };
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${source}`));
        };
      })
  );
  return Promise.any(imagePromises);
}
