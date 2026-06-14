'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BundleOption, Image, Variant } from '@castlery/modules-product-domain';
import { AspectRatio, Box, Button, Typography, useBreakpoints } from '@castlery/fortress';
import useSlick from './hooks/use-slick';
import Slider from 'react-slick';
import { NextArrow, PrevArrow } from './components/arrow';
import useSlickAutoHover from './hooks/use-auto-hover';
import { useEffect, useRef, useState } from 'react';
import { useSlickAutoScrollDot } from './hooks/use-slick-auto-scroll-dot';
import NextImage from 'next/image';
import BaseImage from './components/base-image';
import { PlayOutline, Play, Close } from '@castlery/fortress/Icons';
import { FortressImage } from '@castlery/shared-components';
import { mergeAndSortArrays } from '@castlery/modules-product-services';

const convertMp4ToJpg = (url: string) => {
  const insertion = 'ar_1,c_fill,g_center,so_0/';
  return url.replace(/(\/private\/)/, '$1' + insertion);
};
const addFormatForMp4 = (url: string) => {
  const insertion = 'f_auto,q_auto,w_1280,c_fill/';
  return url.replace(/(\/private\/)/, '$1' + insertion);
};
const transferMp4toJpg = (url: string) => {
  return url.replace(/(mp4)/, 'jpg');
};

const customPagingFactory = (
  images: Image[],
  product: Variant,
  setCurrentIndex: (index: number) => void,
  dimensionGrayImage?: string,
  bundleOption: BundleOption[] = []
) =>
  function pagingInstance(i: number) {
    const { type, thumbnail, overlay = [], links } = images[i] || {};
    return (
      <Box onClick={() => setCurrentIndex(i)}>
        {type === 'base' && (
          <BaseImage mainSrc={links?.large || ''} mainAlt={`${product.name} ${i}`} bundleOptions={bundleOption} />
        )}
        {(type === 'base_old' || type === 'base' || type === 'lifestyle' || type === 'lifestyle_other') && (
          // <AspectRatio ratio={1} objectFit="contain">
          //   <NextImage src={links?.large || ''} alt={`${product.name} ${i}`} layout="fill" />
          // </AspectRatio>
          <FortressImage
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            src={links?.large || ''}
            alt={`${product.name} ${i}`}
            lazy={false}
            imageWidth={'78px'}
            objectFit={type === 'lifestyle' || type === 'lifestyle_other' ? 'cover' : undefined}
          />
          // <NextImage src={links?.large || ''} alt={`${product.name} ${i}`} layout="fill" objectFit="contain" />
        )}
        {['video', 'master_video', 'short_video'].includes(type) && (
          // <AspectRatio ratio={1} objectFit="contain">
          //   <NextImage
          //     src={images[i]?.path ? convertMp4ToJpg(images[i]?.path?.replace('mp4', 'jpg') || '') : ''}
          //     alt={`${product.name} ${i}`}
          //     layout="fill"
          //     objectFit="contain"
          //   />
          // </AspectRatio>
          <FortressImage
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            src={images[i]?.path ? convertMp4ToJpg(images[i]?.path?.replace('mp4', 'jpg') || '') : ''}
            alt={`${product.name} ${i}`}
            lazy={false}
            imageWidth={'78px'}
          />
        )}

        {['video', 'master_video', 'short_video'].includes(type) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'hsla(0, 0%, 98%, .8)',
            }}
          >
            <Play
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </Box>
          // <div className={`${style.gallery}__Dot-video-playBtn`} />
        )}
        {(type === 'base_old' || type === 'base') && dimensionGrayImage && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, .7)',
              }}
            >
              <div />
              {/* <Dimension fontSize="xl2" /> */}
            </Box>
          </Box>
        )}
        {type === '3d' ? (
          <div />
        ) : // <div className={`${style.gallery}__Dot-3d`}>
        //   <ReactSVG name="683_view_new" />
        //   <span>683º</span>
        // </div>
        null}
      </Box>
    );
  };

interface VideoDecoratedProps {
  url: string;
  activeStatus: boolean;
}

const VideoDecorated = ({ url, activeStatus }: VideoDecoratedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [overlayShow, setOverlayShow] = useState(true);
  const handleOverlayClick = () => {
    setOverlayShow(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  useEffect(() => {
    if (!activeStatus) {
      if (videoRef.current) {
        videoRef.current.pause();
        setOverlayShow(true);
      }
    }
  }, [activeStatus]);
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: overlayShow ? 'block' : 'none',
        }}
        onClick={handleOverlayClick}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: '80px !important',
            zIndex: 10,
            borderRadius: '50%',
            backgroundColor: 'hsla(0, 0%, 98%, .8)',
            cursor: 'pointer',
          }}
        >
          <Play
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
            }}
          />
        </Box>
      </Box>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        playsInline
        // autoPlay={true}
        muted={true}
        disablePictureInPicture
        controlsList="nodownload"
        src={addFormatForMp4(url)}
        controls={!overlayShow}
        onPause={() => setOverlayShow(true)}
        poster={transferMp4toJpg(addFormatForMp4(url))}
      />
    </Box>
  );
};
interface MasterVideoRenderedProps {
  image: Image;
  productName: string;
  masterVideo: Image;
  activeStatus: boolean;
}

const MasterVideoRendered = ({ image, productName, masterVideo, activeStatus }: MasterVideoRenderedProps) => {
  const { desktop } = useBreakpoints();
  const { type } = image;
  const [videoHasPlay, setVideoHasPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [overlayShow, setOverlayShow] = useState(false);
  useEffect(() => {
    if (!activeStatus) {
      if (videoRef.current) {
        videoRef.current.pause();
        setVideoHasPlay(false);
      }
    }
  }, [activeStatus]);
  const handleBtnClick = () => {
    setVideoHasPlay(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  const handleCloseVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setVideoHasPlay(false);
    setOverlayShow(false);
  };
  const handleContinueVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
    setOverlayShow(false);
  };
  return (
    <Box
      sx={{
        position: 'relative',
        'img &:focus': {
          outline: 'none',
        },
      }}
    >
      {videoHasPlay ? (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: overlayShow ? 'block' : 'none',
              backgroundColor: 'rgba(50, 52, 51, .8)',
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '40px !important',
              }}
            >
              <Button
                sx={{
                  backgroundColor: 'transparent',
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                  ':active': {
                    backgroundColor: '#transparent',
                    textDecoration: 'underline',
                  },
                }}
                onClick={handleCloseVideoClick}
              >
                <Close
                  sx={{
                    width: '20px',
                    height: '20px',
                    marginRight: '14px',
                  }}
                  stroke="#fff"
                />
                Close
              </Button>
              <Button
                sx={{
                  backgroundColor: 'transparent',
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                  ':active': {
                    backgroundColor: '#transparent',
                    textDecoration: 'underline',
                  },
                }}
                onClick={handleContinueVideoClick}
              >
                <Play
                  sx={{
                    width: '32px',
                    height: '32px',
                    marginRight: '8px',
                    fill: '#fff',
                  }}
                />
                Continue
              </Button>
            </Box>
          </Box>
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            src={addFormatForMp4(masterVideo.path || '')}
            controls={!overlayShow}
            onPause={() => setOverlayShow(true)}
            autoPlay
          />
        </>
      ) : (
        <>
          {type === 'base' && (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '33%',
                zIndex: 2,
                top: 0,
                left: 0,
                background: 'linear-gradient(rgba(50, 52, 51, .2), rgba(50, 52, 51, 0))',
              }}
            />
          )}
          <BaseImage mainSrc={image.links?.large || ''} mainAlt={`${productName} 0`} />
          <Button
            sx={[
              {
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '16px',
                lineHeight: '16px',
                fontWeight: 700,
                top: '32px',
                right: '32px',
                height: '56px',
                padding: '0 30px',
                position: 'absolute',
                background: (theme) => theme.palette.brand.flour[50],
                opacity: 0.85,
                border: '1px solid rgba(255, 253, 249, .5)',
                borderRadius: '100px',
                zIndex: 3,
                color: '#323433',
                '&:hover': {
                  backgroundColor: '#faf8f4',
                  textDecoration: 'underline',
                },
                ':active': {
                  backgroundColor: '#faf8f4',
                  textDecoration: 'underline',
                },
              },
              !desktop && {
                top: '10px',
                right: '10px',
                height: '32px',
                padding: '0 16px',
                fontSize: '12px',
              },
            ]}
            onClick={handleBtnClick}
          >
            <Play
              sx={{
                width: '28px',
                height: '28px',
                marginRight: !desktop ? '4px' : '8px',
              }}
            />
            View more features
          </Button>
        </>
      )}
    </Box>
  );
};

/* eslint-disable-next-line */
export interface ImageGalleryProps {
  images: Image[];
  product: Variant;
  assets: Image[];
  bundleOptions?: BundleOption[];
}

export function ImageGallery(props: ImageGalleryProps) {
  const { images, product, bundleOptions = [], assets } = props;
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryList, setGalleryList] = useState<Image[]>([]);
  const [masterVideo, setMasterVideo] = useState<Image>();
  const [finalHeight, setFinalHeight] = useState(660);
  const [singleFinalHeight, setSingleFinalHeight] = useState(660);
  const { settings, currentIndex } = useSlick(galleryList, product, customPagingFactory, false, '', bundleOptions);
  useEffect(() => {
    setGalleryList(mergeAndSortArrays(images, assets));
  }, [images, assets]);
  useEffect(() => {
    if (galleryList.length > 0) {
      galleryList.forEach((item) => {
        if (item.type === 'master_video') {
          setMasterVideo(item);
        }
      });
    }
  }, [galleryList]);
  const handleResize = () => {
    // console.log('getBoundingClientRect().width: galleryRef', galleryRef.current?.getBoundingClientRect().width);
    const oSlickList = document.querySelector('.slick-list');
    if (oSlickList) {
      setFinalHeight(oSlickList?.getBoundingClientRect().width || 660);
      window.setTimeout(() => {
        setFinalHeight(oSlickList?.getBoundingClientRect().width || 660);
      }, 100);
    }
    const oSingleImageBox = document.querySelector('#single-image-box');
    if (oSingleImageBox) {
      setSingleFinalHeight(oSingleImageBox?.getBoundingClientRect().width || 660);
    }
  };
  useEffect(() => {
    if (galleryRef.current || galleryList.length > 0) {
      const oSingleImageBox = document.querySelector('#single-image-box');
      if (oSingleImageBox) {
        setSingleFinalHeight(oSingleImageBox?.getBoundingClientRect().width || 660);
      }
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [galleryRef, galleryList]);
  useEffect(() => {
    handleResize();
    // const oSlickList = document.querySelector('.slick-list');
    // // const oSlickDots = document.querySelector('.slick-dots');
    // if (oSlickList) {
    //   setFinalHeight(oSlickList?.getBoundingClientRect().width || 660);
    // }
    // const oSingleImageBox = document.querySelector('#single-image-box');
    // if (oSingleImageBox) {
    //   setSingleFinalHeight(oSingleImageBox?.getBoundingClientRect().width || 660);
    // }
  }, []);
  const { isEnterGallery } = useSlickAutoHover(galleryRef);
  const { desktop } = useBreakpoints();
  useSlickAutoScrollDot(galleryRef, currentIndex);
  if (images.length === 0 && assets.length === 0) {
    return null;
  }
  if (galleryList.length === 1) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: `${singleFinalHeight}px`,
        }}
        id="single-image-box"
      >
        <BaseImage
          mainSrc={galleryList[0].links?.large || ''}
          mainAlt={`${product.name}`}
          bundleOptions={bundleOptions}
        />
      </Box>
    );
  }
  return (
    <Box
      ref={galleryRef}
      sx={[
        {
          position: 'relative',
          width: '100%',
          height: `${finalHeight + (desktop ? 0 : 106)}px`,
          '.slick-slider': {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            height: `${finalHeight + (desktop ? 0 : 106)}px`,
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            margin: desktop ? '0 0 0 122px' : '0 0 122px 0',
            // margin: desktop ? '0 55px 0 122px' : '0 0 122px 0',
          },
          '.slick-track': {
            display: 'flex',
          },
          '.slick-list': {
            boxSizing: 'border-box',
            height: `${finalHeight}px`,
            overflow: 'hidden',
            left: '104px',
          },
          '.slick-slide': {
            // width: '549px !important',
            height: `${finalHeight}px`,
            div: {
              height: `${finalHeight}px`,
            },
          },
          '.slick-dots': {
            position: 'absolute',
            left: desktop ? '-122px' : 0,
            margin: 0,
            top: desktop ? 0 : 'none',
            width: desktop ? '122px' : '100%',
            padding: 0,
            bottom: desktop ? '10px' : '-10px',
            transform: 'initial',
            // width: '100px',
            display: 'flex !important',
            justifyContent: 'flex-start',
            flexFlow: `${desktop ? 'column' : 'row'} nowrap`,
            overflowY: desktop ? 'auto' : 'none',
            overflowX: desktop ? 'none' : 'auto',
            alignItems: desktop ? '' : 'center',
            li: {
              position: 'relative',
              flex: '0 0 auto',
              width: '80px',
              height: '80px',
              overflow: 'hidden',
              border: '1px solid transparent',
              '&:first-child': {
                marginTop: desktop ? 0 : '4px',
              },
              // padding: '4px',

              '& > div': {
                // backgroundColor: '#f3f3f3',
              },

              '&:not(:first-of-type)': {
                marginTop: '6px',
              },
            },

            '.slick-active': {
              boxSizing: 'border-box',
              border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
              img: {
                width: '100%',
              },
            },

            '&::-webkit-scrollbar': {
              display: 'none',
              position: 'relative',
              left: '-15px',
              width: '3px',
              backgroundColor: '#fff',
            },

            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#cccccc',
            },
          },
          '.slick-prev': {
            left: '10px',
            top: '50%',
            transform: 'translate(0, -50%)',
            // left: '110px',
            opacity: 0,
            outline: 'none',

            '&:focus, &:active': {
              opacity: 0,
              outline: 'none',
            },
          },
          '.slick-next': {
            right: '10px',
            top: '50%',
            transform: 'translate(0, -50%)',
            opacity: 0,
            outline: 'none',

            '&:focus, &:active': {
              opacity: 0,
              outline: 'none',
            },
          },

          '.slick-prev, .slick-next': {
            zIndex: 10,
            padding: 0,
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.1)',
            width: '40px',
            height: '40px',
            minHeight: 0,
            position: 'relative',
            '&:hover': {
              backgroundColor: '#fff',
            },
            svg: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
            },
          },

          '.slick-prev:hover': {
            opacity: 1,
          },

          '.slick-next:hover': {
            opacity: 1,
          },
          '.slick-arrow': {
            position: 'absolute',
          },
          'a button': {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // borderTop: '1px solid #d9d9d9',
            // borderRight: 'none',
            // borderBottom: '1px solid #d9d9d9',
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s, border-color 0.2s',
            '&:focus, &:active': {
              color: '#323433',
            },
            // 'span': {
            //   marginLeft: '18px'
            // },
            // fontSize: '16px',
            // lineHeight: '24px',
            '@media (hover: hover)': {
              '&:hover': {
                // backgroundColor: (theme) => theme.palette.brand.terracotta[500],
                // borderColor: (theme) => theme.palette.brand.terracotta[500],
                color: '#fffdf9',
                '& + a': {
                  borderLeft: 'none',
                },
                svg: {
                  fill: '#fffdf9',
                },
              },
            },
            svg: {
              width: '20px',
              height: '20px',
            },
          },
          // '&:hover': {
          //   '.slick-prev, .slick-next': {
          //     boxSizing: 'border-box',
          //     opacity: '1 !important',
          //   },
          // },
        },
        isEnterGallery && {
          '.slick-prev, .slick-next': {
            boxSizing: 'border-box',
            opacity: '1 !important',
          },
        },
      ]}
    >
      <Slider {...settings} prevArrow={<PrevArrow />} nextArrow={<NextArrow />}>
        {galleryList.map((image, index) => {
          const { type, links } = image;
          if (index === 0 && masterVideo) {
            return (
              <MasterVideoRendered
                key={index}
                image={image}
                productName={product.name}
                masterVideo={masterVideo}
                activeStatus={currentIndex === index}
              />
            );
          }
          if (type === 'master_video' || type === 'video' || type === 'short_video') {
            return <VideoDecorated key={index} url={image.path || ''} activeStatus={currentIndex === index} />;
          }
          if (type === 'base') {
            return (
              <Box
                sx={{
                  position: 'relative',
                  'img &:focus': {
                    outline: 'none',
                  },
                }}
                key={index}
              >
                <BaseImage
                  mainSrc={links?.large || ''}
                  mainAlt={`${product.name} ${index}`}
                  bundleOptions={bundleOptions}
                />
                {/* <FortressImage src={links?.large || ''} alt={`${product.name} ${index}`} lazy={false} /> */}
              </Box>
            );
          }
          if (type === 'base_old') {
            return (
              <Box
                sx={{
                  position: 'relative',
                  'img &:focus': {
                    outline: 'none',
                  },
                }}
                key={index}
              >
                <FortressImage src={links?.large || ''} alt={`${product.name} ${index}`} lazy={false} />
              </Box>
            );
          }
          if (type === 'lifestyle' || type === 'lifestyle_other') {
            return (
              <Box
                sx={{
                  position: 'relative',
                  'img &:focus': {
                    outline: 'none',
                  },
                }}
                key={index}
              >
                <FortressImage
                  src={links?.large || ''}
                  alt={`${product.name} ${index}`}
                  lazy={false}
                  objectFit="cover"
                />
              </Box>
            );
          }
          return (
            <Box
              sx={{
                position: 'relative',
                'img &:focus': {
                  outline: 'none',
                },
              }}
              key={index}
            >
              <FortressImage src={links?.large || ''} alt={`${product.name} ${index}`} lazy={false} />
              {/* <NextImage src={links?.large || ''} alt={`${product.name} ${index}`} fill objectFit="contain" /> */}
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
}

export default ImageGallery;
