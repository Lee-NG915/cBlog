/* eslint-disable react/jsx-no-undef */
// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import { generateSizes, processSrcset, processSrcsetNotLazy } from './../utils';
import { isDeepStrictEqual } from 'util';
import { ColorPalette } from './../utils';
import { ImageLinks } from '@castlery/modules-product-domain';
import { logger } from '@castlery/observability/client';

/* eslint-disable-next-line */
export interface ReactPictureProps {
  src: string;
  srcset: string | ImageLinks | string[];
  // loader : { ratio: number, widths: array, sizes: string|array, objectFit: string }, note: sizes only works when lazy equals true.
  loader: object;
  alt: string;
  className: string;
  bgColor: string;
  lazy: boolean;
  setImagePreloaderOnServer: boolean;
  onLoad: () => void;
  onError: () => void;
  type: string;
  bestQuality: boolean;
  sizes: string;
}

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
      ...otherProps
    }: ReactPictureProps,
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

    const imgSrc = useMemo(() => {
      const srcArr = [];
      if (src) {
        srcArr.push(src);
      } else if (Array.isArray(srcset)) {
        srcset.forEach((s) => {
          srcArr.push(processSrcset(s, null, bestQuality));
        });
      } else if (srcset) {
        const { widths } = loader;
        if (Array.isArray(widths)) {
          widths.forEach((w) => {
            srcArr.push(processSrcset(srcset, w, bestQuality));
          });
        } else {
          srcArr.push(processSrcset(srcset, 400, bestQuality));
        }
      }
      return srcArr;
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (notLazyParams) {
        const srcsetPromises = notLazyParams.map((srcItem) => isSrcsetLoaded(srcItem.srcSet));
        Promise.all(srcsetPromises)
          .then((imgStates) => {
            setImageStates(imgStates);
          })
          .catch((error) => {
            // eslint-disable-next-line no-undef
            if (error instanceof AggregateError) {
              error.errors.forEach((subError) => {
                logger.error('Failed to load image srcset', { error: subError, srcset: notLazyParams });
              });
            } else {
              logger.error('Failed to monitor images load', { error, srcset: notLazyParams });
            }
          });
      }
    }, [notLazyParams]);

    useEffect(() => {
      // means reload image in multiple images
      if (isMultiple && preSrcset && !isDeepStrictEqual(preSrcset, srcset)) {
        // find which one is different
        const newStates = srcset.map((s, i) => {
          if (isDeepStrictEqual(s, preSrcset[i])) {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMultiple, preSrcset, srcset]);

    const handleImageStates = useCallback(
      (index: number, status?: string) => {
        if (status === 'error') {
          setIsError({ [index]: true });
        } else if (isMultiple) {
          setImageStates(imageStates.map((state, i) => state || i === index));
        }
      },
      [isMultiple, imageStates]
    );
    const { ratio, height, widths, objectFit, customStyle = {} } = loader;
    const picture = (
      <div
        style={{
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
        {setImagePreloaderOnServer && imagePreloadLinks && <Head>{imagePreloadLinks}</Head>}
        {imgSrc.map((s, i) => {
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
            return <div />;
            // return <div className={`${style.wrapper}__fallback`} />;
          }

          return (
            <img
              ref={ref}
              src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
              key={i}
              {...params}
              alt={alt}
              style={{ ...(!!objectFit && { objectFit }) }}
              onLoad={() => {
                handleImageStates(i);
                if (onLoad) {
                  onLoad();
                }
              }}
              onError={() => {
                handleImageStates(i, 'error');
                if (onError) {
                  onError();
                }
              }}
              {...otherProps}
            />
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

export default React.memo(ReactPicture);
