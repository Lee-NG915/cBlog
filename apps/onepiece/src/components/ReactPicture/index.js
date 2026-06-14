/*
  note: 
    1. When the source is multiple or 3D images which are not in cloudinary, you should make lazy=false
    2. If you wanna apply attr setImagePreloaderOnServer, you should make lazy=false
*/

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ColorPalette } from 'utils/color';
import usePrevious from 'react-use/lib/usePrevious';
import isEqual from 'lodash/isEqual';
import Head from 'components/Head';
import { isSrcsetLoaded, generateSizes, processSrcset, processSrcsetNotLazy } from './utils';
import style from './style.scss';

const maxRetryCount = 1;

const ReactPicture = React.forwardRef(
  (
    {
      src,
      srcset,
      loader: _loader,
      alt,
      className,
      bgColor = '',
      lazy = true,
      setImagePreloaderOnServer = false,
      onLoad,
      onError,
      sizes: _sizes, // FIXME: this is legacy, remove it
      type,
      bestQuality = false,
      showSkeleton = false,
      skeletonDuration = 150,
      ...otherProps
    },
    ref
  ) => {
    const loader = useMemo(
      () => ({
        size: '', // FIXME: this is legacy, remove it
        widths: [320, 480, 640, 960, 1280, 1440, 1920],
        objectFit: '',
        ..._loader,
      }),
      [_loader]
    );
    const preSrcset = usePrevious(srcset);
    const isMultiple = useMemo(() => Array.isArray(srcset) && srcset.length >= 2, [srcset]);
    const [imageStates, setImageStates] = useState(isMultiple ? srcset.map(() => false) : null);
    const isAllImagesLoaded = useMemo(() => imageStates && imageStates.every((state) => state), [imageStates]);
    const [opacity, setOpacity] = useState(0);
    const [isError, setIsError] = useState({});
    const imageRef = useRef(null);
    const [retryCount, setRetryCount] = useState(0);
    const imgSrc = useMemo(() => {
      const srcArr = [];
      if (src) {
        srcArr.push(src);
      } else if (Array.isArray(srcset)) {
        srcset.forEach((s) => {
          srcArr.push(processSrcset(s, undefined, bestQuality));
        });
      } else if (srcset) {
        const { widths } = loader;
        if (Array.isArray(widths)) {
          // widths.forEach((w) => {
          //   srcArr.push(processSrcset(srcset, w, bestQuality));
          // });
          srcArr.push(processSrcset(srcset, undefined, bestQuality));
        } else {
          srcArr.push(processSrcset(srcset, 400, bestQuality));
        }
      }
      return srcArr;
    }, [src, srcset]);
    const notLazyParams = useMemo(() => {
      if (!lazy) {
        const { widths, sizes } = loader;
        return imgSrc.map((s, i) => {
          if (src) {
            return {
              src,
            };
          }
          let imgSrcset;
          if (Array.isArray(srcset)) {
            imgSrcset = processSrcsetNotLazy(srcset[i], widths, bestQuality);
          } else if (srcset) {
            imgSrcset = processSrcsetNotLazy(srcset, widths, bestQuality);
          }
          return imgSrcset
            ? {
                srcSet: imgSrcset,
                sizes: generateSizes(sizes),
              }
            : null;
        });
      }
    }, [lazy, src, srcset, loader, imgSrc]);
    const imagePreloadLinks = useMemo(
      () =>
        notLazyParams?.map((param, i) => {
          const { src, srcSet, sizes } = param;
          if (src) {
            return <link rel="preload" as="image" href={src} />;
          }
          if (srcSet) {
            return (
              <link
                key={i}
                rel="preload"
                as="image"
                imageSrcSet={srcSet}
                imageSizes={sizes || '(min-width: 1500px) 1440px, 100vw'}
              />
            );
          }
          return null;
        }),
      [notLazyParams]
    );

    const monitorImagesLoad = useCallback(() => {
      // srcset causes img onload event not to execute, so it is necessary to judge whether it is loaded
      const srcsetPromises = notLazyParams?.map((srcItem) => isSrcsetLoaded(srcItem.srcSet));
      Promise.all(srcsetPromises)
        .then((imgStates) => {
          setImageStates(imgStates);
        })
        .catch((error) => {
          // eslint-disable-next-line no-undef
          if (error instanceof AggregateError) {
            error.errors.forEach((subError) => {
              console.error(JSON.stringify({ message: 'ReactPicture sub-error', error: subError }, null, 2));
            });
          } else {
            console.error(JSON.stringify({ message: 'ReactPicture main error', error }, null, 2));
          }
        });
    }, [notLazyParams]);

    useEffect(() => {
      // means reload image in multiple images
      if (isMultiple && preSrcset && !isEqual(preSrcset, srcset)) {
        // find which one is different
        const newStates = srcset.map((s, i) => {
          if (isEqual(s, preSrcset[i])) {
            return true;
          }
          setOpacity(0.4);
          return false;
        });
        setImageStates(newStates);
      } else if (isMultiple && srcset && !isAllImagesLoaded && preSrcset === undefined) {
        // preSrcset is undefined, means is initial load
        monitorImagesLoad();
      }
    }, [isMultiple, preSrcset, srcset]);

    const handleImageStates = useCallback(
      (index, status) => {
        if (status === 'error') {
          setIsError({ [index]: true });
        } else if (isMultiple) {
          setImageStates(imageStates.map((state, i) => state || i === index));
        }
      },
      [isMultiple, imageStates]
    );
    const { ratio, height, widths, objectFit, customStyle = {} } = loader;
    const [isLoading, setIsLoading] = useState(true);
    const [isImageVisible, setIsImageVisible] = useState(false);
    const skeletonRef = useRef(null);

    const handleImageLoad = useCallback(
      (index) => {
        if (!showSkeleton) {
          setIsImageVisible(true);
          if (onLoad) onLoad();
          return;
        }
        // 使用 requestAnimationFrame 处理骨架屏过渡
        requestAnimationFrame(() => {
          setIsImageVisible(true);
          requestAnimationFrame(() => {
            if (skeletonRef.current) {
              skeletonRef.current.classList.add(style['skeleton--fade']);
              // 等待过渡动画完成后移除骨架屏
              setTimeout(() => {
                setIsLoading(false);
                if (onLoad) onLoad();
              }, skeletonDuration);
            }
          });
        });
      },
      [onLoad, skeletonDuration, showSkeleton]
    );

    const skeletonMarkup = useMemo(
      () =>
        showSkeleton && isLoading ? (
          <div
            ref={skeletonRef}
            className={style.skeleton}
            data-ssr="true"
            style={{
              paddingTop: ratio ? `${ratio * 100}%` : undefined,
              backgroundColor: bgColor || '#f0f0f0',
              transitionDuration: `${skeletonDuration}ms`,
            }}
          />
        ) : null,
      [showSkeleton, isLoading, ratio, bgColor, skeletonDuration]
    );

    const picture = (
      <div
        style={{
          position: 'relative',
          height,
          paddingTop: ratio && `${ratio * 100}%`,
          ...customStyle,
          ...(!!bgColor && {
            backgroundColor: ColorPalette[bgColor] || bgColor,
          }),
          ...(isMultiple && { opacity: isAllImagesLoaded ? 1 : opacity }),
        }}
        className={classNames(style.wrapper, {
          [style.placeholder]: !!ratio,
        })}
      >
        {skeletonMarkup}
        {setImagePreloaderOnServer && imagePreloadLinks && <Head>{imagePreloadLinks}</Head>}
        {imgSrc.map((s, i) => {
          if (!s) {
            return null;
          }
          const params =
            notLazyParams && notLazyParams[i]
              ? notLazyParams[i]
              : {
                  className: 'img-lazyload',
                  'data-src': s, // rias plugin of lazysizes will generate src or srcset automatically by data-src
                  ...(!src && {
                    'data-sizes': 'auto',
                    'data-widths': `[${widths.join(',')}]`,
                  }),
                };

          // fall back to the background color when the image is corrupted for CategoryBanner
          if (isError?.[i] && type === 'category') {
            if (bgColor) {
              return null;
            }
            return <div className={`${style.wrapper}__fallback`} />;
          }
          return (
            <>
              <img
                ref={ref || imageRef}
                src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                key={i}
                {...params}
                alt={alt}
                style={{
                  ...(!!objectFit && { objectFit }),
                  opacity: !showSkeleton ? 1 : isImageVisible ? 1 : 0,
                  transition: `opacity ${skeletonDuration}ms ease-out`,
                }}
                onLoad={handleImageLoad}
                onError={(e) => {
                  handleImageStates(i, 'error');
                  if (onError) {
                    onError();
                  }
                  if (e.target?.getAttribute('src')?.includes('w_{width}') && retryCount < maxRetryCount) {
                    const currentRef = ref || imageRef;
                    let replaceSrc = '';
                    if (e.target?.attributes?.sizes?.value) {
                      replaceSrc = `w_${e.target?.getAttribute('sizes').replace('px', '')}`;
                    }
                    currentRef?.current?.setAttribute(
                      'src',
                      currentRef?.current?.getAttribute('src')?.replace('w_{width}', replaceSrc || 'w_auto')
                    );
                    setRetryCount((item) => item + 1);
                  }
                }}
                {...otherProps}
              />
            </>
          );
        })}
      </div>
    );
    if (className) {
      return <div className={className}>{picture}</div>;
    }
    return picture;
  }
);
ReactPicture.displayName = 'ReactPicture';
ReactPicture.propTypes = {
  // src means don't use responsive image
  src: PropTypes.string,
  // handle different image sources
  srcset: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  // loader : { ratio: number, widths: array, sizes: string|array, objectFit: string }, note: sizes only works when lazy equals true.
  loader: PropTypes.object,
  alt: PropTypes.string,
  className: PropTypes.string,
  bgColor: PropTypes.string,
  lazy: PropTypes.bool,
  setImagePreloaderOnServer: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  type: PropTypes.string,
  bestQuality: PropTypes.bool,
  showSkeleton: PropTypes.bool,
  skeletonDuration: PropTypes.number,
};

export default React.memo(ReactPicture);
