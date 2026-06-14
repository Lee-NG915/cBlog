import { BREAKPOINTS, RESPONSIVE_BREAKPOINTS, CONTAINER_WIDTH } from '@castlery/utils';
import { logger } from '@castlery/observability/client';

export const cloudinary = 'https://res.cloudinary.com/';
export const castleryCDN = 'https://img.castlery';
export const castleryTestCDN = 'https://img-test.castlery';
export const deviceWidths = [280, 420, 560, 750, 840, 1000, 1500, 1995];

export const generateSizes = (sizeDescriptor: Array<string | number> | string | undefined) => {
  // const defaultSizes = '(min-width: 1500px) 1440px, 100vw';
  // (max-width: 400px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, (min-width: 1025px) and (max-width: 1200px) 60vw, 100vw
  const defaultSizes =
    '(max-width: 400px) 200px, (max-width: 768px) 390px, (max-width: 1024px) 800px, (min-width: 1025px) and (max-width: 1200px) 1036px, 1728px';
  if (!sizeDescriptor) return defaultSizes;
  let hasEnd = false;
  if (Array.isArray(sizeDescriptor)) {
    const segments = sizeDescriptor.map((desc, i) => {
      const keyString = getBreakpointKeys().join('|');
      const reg = new RegExp(`^(0\\.\\d+|1|\\d+px)-(${keyString})$`);
      const matcher = reg.exec(desc as string);
      if (matcher) {
        const breakpoint = getBreakpoint(matcher[2], 'min');
        const width = matcher[1];
        return `(min-width: ${breakpoint}px) ${width.endsWith('px') ? width : `${Math.floor(+width * 100)}vw`}`;
      }

      const targetDesc = desc || '1';
      if (/^(0\.\d+|1)$/.test(targetDesc as string) && i + 1 === sizeDescriptor.length && i >= 1) {
        hasEnd = true;
        return `${Math.floor(+targetDesc * 100)}vw`;
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
  } else if (sizeDescriptor && typeof sizeDescriptor === 'string') {
    return sizeDescriptor;
  }
  return defaultSizes;
};

export const generateWidths = (widthDescriptor: Array<string | number>) => {
  const responsiveWidth = {
    desktop: '100px',
  };
  widthDescriptor.forEach((desc: string | number) => {
    const keyString = getResponsiveBreakpointKeys().join('|');
    const reg = new RegExp(`^(0\\.\\d+|1|\\d+px)-(${keyString})$`);
    const matcher = reg.exec(desc as string);
    if (matcher) {
      const width = matcher[1];
      Object.assign(responsiveWidth, {
        [`${matcher[2]}`]: width.endsWith('px') ? width : `${Math.floor(+width * 100)}vw`,
      });
    }
  });
  return responsiveWidth;
};

export function getBreakpointKeys() {
  return Object.keys(BREAKPOINTS);
}

export function getBreakpoint(name: string, boundary: string) {
  if (BREAKPOINTS[name] === undefined) {
    logger.error('Invalid breakpoint provided to fortress-image util', { name, boundary });
    return;
  }

  if (boundary === 'min') {
    return BREAKPOINTS[name];
  }

  const keys = Object.keys(BREAKPOINTS);
  return BREAKPOINTS[keys[keys.indexOf(name) + 1]] - 1;
}

export function getResponsiveBreakpointKeys() {
  return Object.keys(RESPONSIVE_BREAKPOINTS);
}

export function defaultImage(size = 1000) {
  return `https://res.cloudinary.com/castlery/image/upload/w_${size}/v1760521309/static/default_image.png`;
}

export function getWidth(name: string) {
  if (CONTAINER_WIDTH[name] === undefined) {
    logger.error('Invalid container width breakpoint provided to fortress-image util', { name });
    return 0;
  }
  return CONTAINER_WIDTH[name];
}
