/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageLinks } from '@castlery/modules-product-domain';
import * as easing from 'easing-utils';
import { logger } from '@castlery/observability/client';

const BREAKPOINTS = {
  xs: 0,
  sm: 544,
  md: 768,
  lg: 992,
  xl: 1200,
  xsl: 1340,
  xxl: 1500,
};

const CONTAINER_WIDTH = {
  sm: 576,
  md: 720,
  lg: 962,
  xl: 1170,
  xsl: 1310,
  xxl: 1470,
};

type Breakpoint = keyof typeof BREAKPOINTS | keyof typeof CONTAINER_WIDTH;

export function getBreakpoint(name: Breakpoint, boundary: string) {
  if (BREAKPOINTS[name] === undefined) {
    logger.error('Invalid breakpoint provided', { name, boundary });
    return;
  }

  if (boundary === 'min') {
    return BREAKPOINTS[name];
  }

  const keys = Object.keys(BREAKPOINTS);
  return BREAKPOINTS[keys[keys.indexOf(name) + 1]] - 1;
}

export function getWidth(name) {
  if (CONTAINER_WIDTH[name] === undefined) {
    logger.error('Invalid container width breakpoint provided', { name });
    return 0;
  }
  return CONTAINER_WIDTH[name];
}

export function getBreakpointKeys() {
  return Object.keys(BREAKPOINTS);
}

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  const clonedObj = Array.isArray(obj) ? [] : {};
  Object.keys(obj as any).forEach((key) => {
    (clonedObj as any)[key] = deepClone((obj as any)[key]);
  });

  return clonedObj as T;
};

export const convertBundleOptionsToQueryString = (
  bundleOptions: {
    bundle_option_id: number;
    bundle_option_variant_id: number;
  }[]
) => {
  return bundleOptions
    .map((option) => {
      return `bundle_option[${option.bundle_option_id}]=${option.bundle_option_variant_id}`;
    })
    .join('&');
};

// Defining the type for the options parameter of the animate function
interface AnimateOptions {
  from?: number;
  to?: number;
  duration?: number;
  func?: keyof typeof easing;
  callback?: (currentValue: number) => void;
  done?: () => void;
}

// Improved requestAnimationFrame declaration using TypeScript
const requestAnimFrame: (callback: FrameRequestCallback) => void = (() => {
  if (typeof window !== 'undefined') {
    // Checking for the client environment more robustly
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      ((callback) => window.setTimeout(callback, 1000 / 60))
    );
  }
  return () => {}; // Providing a fallback function for environments without window
})();

export function animate(options: AnimateOptions): void {
  const _from = options.from || 0;
  const _to = options.to || 0;
  const _duration = options.duration || 200;
  const _func = options.func || 'easeOutQuad';
  const _callback = options.callback;
  const _done = options.done;

  const _start = Date.now();
  const _distance = _to - _from;

  const _animate = (): void => {
    const _now = Date.now();
    let t = _duration > 0 ? (_now - _start) / _duration : 1;

    // Deal with overrun case
    if (t > 1) {
      t = 1;
    }

    const _current = easing[_func](t) * _distance + _from;

    if (_callback) {
      _callback(_current);
    }

    if (t === 1 && _done) {
      _done();
    }

    if (t < 1) {
      requestAnimFrame(_animate);
    }
  };

  _animate();
}

const cloudinary = 'https://res.cloudinary.com/';

export const processUrl = (url: string, width: number | null, bestQuality: boolean) => {
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

type SrcsetType = string | ImageLinks;

export const processSrcset = (srcset: SrcsetType, width: number | null, bestQuality: boolean) => {
  if (typeof srcset === 'string') {
    return processUrl(srcset, width, bestQuality);
  }
  if (typeof srcset === 'object' && srcset) {
    return processUrl(srcset.large, width, bestQuality);
  }
  return '';
};

type ImageSizesType = { [key: string]: string };

const imageSizes: ImageSizesType = {
  280: 'mini',
  420: 'small',
  560: 'mini_x2',
  750: 'medium',
  840: 'small_x2',
  1000: 'large',
  1500: 'medium_x2',
  1995: 'large_x2',
};

export const processSrcsetNotLazy = (srcset: SrcsetType, widths: number[], bestQuality = false): string => {
  if (typeof srcset === 'string') {
    return widths.map((w) => `${processSrcset(srcset, w, bestQuality)} ${w}w`).join(', ');
  }
  if (typeof srcset === 'object' && srcset !== null) {
    // Adjusted check for object
    if (srcset.large?.startsWith(cloudinary)) {
      return widths.map((w) => `${processSrcset(srcset, w, bestQuality)} ${w}w`).join(', ');
    }
    const sizeArr = Object.keys(imageSizes);
    return widths
      .map((w) => {
        const targetSize = sizeArr.find((size) => parseInt(size) >= w); // Ensuring numeric comparison
        const val = imageSizes[targetSize];
        return `${srcset[val]} ${w}w`;
      })
      .join(', ');
  }
  return '';
};

export const generateSizes = (sizeDescriptor: string | string[]): string => {
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
        return `(min-width: ${breakpoint}px) ${width.endsWith('px') ? width : `${Math.floor(Number(width) * 100)}vw`}`;
      }

      const targetDesc = desc || '1';
      if (/^(0\.\d+|1)$/.test(targetDesc) && i + 1 === sizeDescriptor.length && i >= 1) {
        hasEnd = true;
        return `${Math.floor(Number(targetDesc) * 100)}vw`;
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

export const ColorPalette = {
  primary: '#a45b37',
  complimentary: '#778379',
  'light-accent': '#dbcfb5',
  'dark-accent': '#c1af86',
  'light-neutral': '#fffdf9',
  'dark-neutral': '#323433',
  'black-font': '#000',
  white: '#fff',
  transparent: 'transparent',
};
