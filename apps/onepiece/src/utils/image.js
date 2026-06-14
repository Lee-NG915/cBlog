/**
 *
 * All local static images are recorded here for management
 *
 */
import React from 'react';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import { getBreakpoint, getWidth } from 'utils/breakpoints';

export function defaultImage(size = 720) {
  return `https://res.cloudinary.com/castlery/image/upload/w_${size}/v1477990685/static/default.png`;
}

// load any number of images and return a promise
export function loadImages(images) {
  const promises = [];

  images.forEach((s) => {
    promises.push(loadSingleImage(s));
  });

  return Promise.all(promises);
}

// load single image and return a promise
export function loadSingleImage(src) {
  const img = new Image();
  img.src = src;
  if (img.complete) {
    return Promise.resolve(img);
  }
  return new Promise((resolve) => {
    img.onload = () => resolve(img);
  });
}

export function loadSingleImageWithKey(image) {
  console.log(image, 'loadSingleImageWithKey');
  const img = new Image();
  img.src = image.url;
  if (img.complete) {
    return Promise.resolve(img, img.key);
  }
  return new Promise((resolve) => {
    img.onload = () => resolve(img, image.key);
  });
}

export function renderImage(link, ratio, widthPercent, otherProps = { lazy: true }) {
  const withRoot = !/^https{0,1}:\/\//.test(link);
  const image = (
    <ReactPicture
      srcset={`${withRoot ? `${cloudinaryRoot}/` : ''}${link}`}
      loader={{
        ratio: typeof ratio === 'object' ? ratio.ratio : ratio,
        sizes:
          !otherProps.lazy && typeof widthPercent === 'number' && widthPercent > 0
            ? `(min-width: ${getBreakpoint('xxl', 'min')}px) ${widthPercent * getWidth('xxl')}px, ` +
              `(min-width: ${getBreakpoint('xsl', 'min')}px) ${widthPercent * getWidth('xsl')}px, ` +
              `(min-width: ${getBreakpoint('xl', 'min')}px) ${widthPercent * getWidth('xl')}px, ` +
              `${widthPercent * getWidth('lg')}px`
            : null,
      }}
      {...otherProps}
    />
  );

  return image;
}
