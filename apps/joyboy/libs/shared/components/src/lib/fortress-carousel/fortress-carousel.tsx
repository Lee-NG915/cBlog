'use client';
import Slider from 'react-slick';
import { Box, IconButton, Stack, useBreakpoints } from '@castlery/fortress';
import { CarouselDeActiveDot } from '@castlery/fortress/Icons';
import { useCallback, useRef, useState } from 'react';
import { WebLeft, WebRight } from '@castlery/fortress/Icons';
import { FortressImage, PinchZoom } from '@castlery/shared-components';
import { addImpressionFlag, createDataTrackingData } from '@castlery/utils';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { usePathname } from 'next/navigation';

interface FortressCarouselProps {
  outerModuleName?: string;
  carouselData: any;
  ratio?: number;
  imageRatio?: number;
}

export function FortressCarousel(props: FortressCarouselProps) {
  const pathname = usePathname();
  const { carouselData, ratio = 2.4, imageRatio = 2.4, outerModuleName = '' } = props;
  const { desktop } = useBreakpoints();
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);
  const [lightBoxOpen, setLightBoxOpen] = useState(false);

  const NextArrow = (nextProps: { className?: string; style?: React.CSSProperties; onClick?: () => void }) => {
    const { className, style, onClick } = nextProps;
    const trackingTags = useTrackingTags({
      moduleName: outerModuleName,
      elementName: 'Next Button',
    });
    return (
      <div
        className={className}
        style={{
          ...style,
          height: '100%',
          width: desktop ? '128px' : '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: desktop ? '#3234334D' : 'transparent',
        }}
      >
        <IconButton {...trackingTags} onClick={onClick}>
          <WebRight
            sx={{
              cursor: 'pointer',
              width: desktop ? '56px' : '32px',
              height: desktop ? '56px' : '32px',
            }}
          />
        </IconButton>
      </div>
    );
  };

  const PrevArrow = (prevProps: { className?: string; style?: React.CSSProperties; onClick?: () => void }) => {
    const { className, style, onClick } = prevProps;
    const trackingTags = useTrackingTags({
      moduleName: outerModuleName,
      elementName: 'Prev Button',
    });
    return (
      <div
        className={className}
        style={{
          ...style,
          height: '100%',
          width: desktop ? '128px' : '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: desktop ? '#3234334D' : 'transparent',
        }}
      >
        <IconButton {...trackingTags} onClick={onClick}>
          <WebLeft
            sx={{
              cursor: 'pointer',
              width: desktop ? '56px' : '32px',
              height: desktop ? '56px' : '32px',
            }}
          />
        </IconButton>
      </div>
    );
  };

  const CustomDot = useCallback(
    (dots: any) => (
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            li: {
              '::marker': {
                content: 'none',
              },
              cursor: 'pointer',
              '&.slick-active': {
                'svg circle': {
                  fill: '#606060',
                },
              },
            },
          }}
        >
          {dots}
        </Stack>
      </Stack>
    ),
    []
  );
  const CustomPaging = useCallback(() => {
    return (
      <Box
        sx={{
          padding: desktop ? '24px 8px' : '16px 4px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CarouselDeActiveDot
          sx={{
            width: desktop ? '16px' : '8px',
            height: desktop ? '16px' : '8px',
          }}
        />
      </Box>
    );
  }, [desktop]);

  const settings = {
    className: 'center',
    centerMode: desktop ? true : false,
    infinite: true,
    // centerPadding: '60px',
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: CustomDot,
    customPaging: CustomPaging,
    dots: true,
  };
  const trackingProps = useCallback(
    (index: number) => {
      return createDataTrackingData({
        pathname,
        module: outerModuleName,
        elementName: 'Picture',
        content: {
          index: index,
        },
      });
    },
    [outerModuleName, pathname]
  );

  return (
    <>
      <Box
        className="slider-container"
        ref={carouselRef}
        sx={[
          {
            position: 'relative',
            width: '100vw',
            maxWidth: '1728px',
            height: `${100 / ratio + 5}vw`,
            maxHeight: `calc( ${1728 / ratio}px + 5vw )`,
            marginBottom: '20px',
            '&::after': {
              content: '""',
              display: 'table',
              clear: 'both',
            },
            '.slick-slider': {
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              height: `${(100 / ratio) * 1}vw`,
              maxHeight: `calc( ${1728 / ratio}px )`,
              width: '100%',
              touchAction: 'pan-y',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            },
            '.slick-track': {
              height: '100%',
              display: 'flex',
              gap: desktop ? '16px' : 0,
            },
            '.slick-list': {
              boxSizing: 'border-box',
              height: '100%',
              overflow: 'hidden',
            },
            '.slick-slide': {
              width: desktop ? 'calc(100% - 288px) !important' : '100% !important',
              height: '100%',
              div: {
                height: `100%`,
                width: '100%',
              },
            },
            '.slick-prev': {
              left: 0,
            },
            '.slick-next': {
              right: 0,
            },

            '.slick-prev, .slick-next': {
              zIndex: 10,
              top: '50%',
              transform: 'translate(0, -50%)',
              opacity: 1,
              outline: 'none',
            },
            '.slick-arrow': {
              position: 'absolute',
            },
            li: {
              'list-style-type': 'none',
            },
          },
        ]}
      >
        <Slider {...settings}>
          {carouselData?.map((item: any, index: number) => {
            return (
              <FortressImage
                {...addImpressionFlag(`fortress-carousel-${index}`)}
                {...trackingProps(index)}
                key={index}
                sx={{
                  height: '100%',
                }}
                src={item?.src}
                alt={item?.alt || `fortress-carousel-${index}`}
                draggable={false}
                objectFit="cover"
                ratio={imageRatio}
                // lazy={index === 0 ? false : true}
                onClick={() => {
                  setLightBoxOpen(true);
                  setIndex(index);
                }}
              />
            );
          })}
        </Slider>
      </Box>
      <PinchZoom open={lightBoxOpen} setOpen={setLightBoxOpen} slideImages={carouselData} index={index} />
    </>
  );
}

export default FortressCarousel;
