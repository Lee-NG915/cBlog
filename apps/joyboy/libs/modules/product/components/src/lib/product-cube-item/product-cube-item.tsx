'use client';
import {
  HitSub,
  OptionValueItem,
  VariantItem,
  getProductByIdOrSlug,
  selectProductLoadingStatus,
  setLoadingStatus,
} from '@castlery/modules-product-domain';
import { Card, Box, Typography, ButtonGroup, Button, Link, useBreakpoints } from '@castlery/fortress';
// import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import Tag from '../product-badge/product-badge';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { FortressImage } from '@castlery/shared-components';
import Slider from 'react-slick';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

export function format(num: string, decimal = 0) {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    logger.error('Failed to format number', { error, num, decimal });
    return '0';
  }
}

export function toPrice(num: string | number, zeroToFree: boolean) {
  // if +num is not a number, return the original value
  if (isNaN(+num)) {
    return num;
  }

  try {
    num = +num;
    if (num > 0) {
      return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(num, 2)}`;
    }
    if (num < 0) {
      return `-${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(-num, 2)}`;
    }
    if (zeroToFree) {
      return 'Free';
    }
    return '0';
  } catch (error) {
    logger.error('Failed to convert to price', { error, num, zeroToFree });
    return '';
  }
}

/* eslint-disable-next-line */
export interface ProductCubeItemProps extends HitSub {}

interface ColorListItemProps extends OptionValueItem {
  id: number;
}

const optionDisplayPriorityList = ['material', 'leg_color', 'wood', 'color_option'];

export function ProductCubeItem(props: ProductCubeItemProps) {
  const { _source } = props;
  const [variantList, setVariantList] = useState<VariantItem[]>();
  const [hasDisplayVariant, setHasDisplayVariant] = useState<VariantItem>();
  // const [mouseOnImage, setMouseOnImage] = useState(false);
  const [mouseOnContainer, setMouseOnContainer] = useState(false);
  const [currentLink, setCurrentLink] = useState('');
  const [isMainVariant, setIsMainVariant] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [finalHeight, setFinalHeight] = useState(160);
  // const [routerGo, setRouterGo] = useState(false);
  const [colorMap, setColorMap] = useState<Map<string, ColorListItemProps>>();
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { tablet } = useBreakpoints();
  const cubeRef = useRef<HTMLDivElement>(null);
  const productLoadingStatus = useAppSelector(selectProductLoadingStatus);
  const goNewPDPPage = useCallback(async () => {
    await dispatch(
      getProductByIdOrSlug.initiate({
        idOrSlug: currentLink,
      })
    );
    let ifSPULink = currentLink;
    if (isMainVariant) {
      ifSPULink = currentLink.split('?')[0];
    }
    router.push(`/${params?.locale}/products/${ifSPULink}`);
    setHasClicked(false);
    // eslint-disable-next-line
  }, [params, currentLink, dispatch, router]);
  useEffect(() => {
    if (hasClicked) {
      goNewPDPPage();
      // setRouterGo(true);
      // router.push(`/${params?.locale}/discover/${currentLink}`);
    }
  }, [productLoadingStatus, hasClicked, goNewPDPPage]);
  useEffect(() => {
    setVariantList(_source.variants);
    setHasDisplayVariant(_source.variants[0]);
    setIsMainVariant(true);
  }, [_source]);
  useEffect(() => {
    if (variantList) {
      const tempMap: Map<string, ColorListItemProps> = new Map();
      let chooseOptionIndex = optionDisplayPriorityList.length - 1;
      variantList.forEach((item) => {
        const { option_values } = item;
        Object.keys(option_values).forEach((key) => {
          if (optionDisplayPriorityList.includes(key)) {
            const keyIndex = optionDisplayPriorityList.indexOf(key);
            if (keyIndex > -1 && keyIndex < chooseOptionIndex) {
              chooseOptionIndex = keyIndex;
            }
          }
        });
      });
      const chooseOption = optionDisplayPriorityList[chooseOptionIndex];
      variantList.forEach((item) => {
        const { option_values } = item;
        Object.keys(option_values).forEach((key) => {
          if (key === chooseOption) {
            if (option_values[key]?.image_src) {
              if (tempMap.has(option_values[key].value)) {
                return;
              } else {
                const tempObj: ColorListItemProps = {
                  ...option_values[key],
                  id: item.id,
                };
                tempMap.set(option_values[key].value, tempObj);
              }
            }
          }
        });
      });
      setColorMap(tempMap);
    }
  }, [variantList]);
  useEffect(() => {
    if (hasDisplayVariant) {
      const { option_values } = hasDisplayVariant;
      const paramArr = [];
      for (const key in option_values) {
        paramArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(option_values[key].value)}`);
      }
      if (isMainVariant) {
        setCurrentLink(_source.slug + (paramArr.length > 0 ? '?' : '') + paramArr.join('&'));
      } else {
        setCurrentLink(_source.slug + (paramArr.length > 0 ? '?' : '') + paramArr.join('&'));
      }
    }
  }, [hasDisplayVariant, isMainVariant, _source]);
  // const handleMouseEnterImage = () => {
  //   setMouseOnImage(true);
  // };
  // const handleMouseLeaveImage = () => {
  //   setMouseOnImage(false);
  // };
  const handleMouseEnterContainer = () => {
    setMouseOnContainer(true);
  };
  const handleMouseLeaveContainer = () => {
    setMouseOnContainer(false);
  };
  const handleOptionValueClick = (id: number) => {
    const tempVariant = variantList?.find((item) => item.id === id);
    if (tempVariant) {
      setIsMainVariant(tempVariant.id === variantList[0]?.id);
      setHasDisplayVariant(tempVariant);
    }
  };
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(setLoadingStatus('loading'));
    // dispatch(getProductByIdOrSlug.initiate({
    //   idOrSlug: currentLink
    // }));
    setHasClicked(true);
  };
  const handleResize = () => {
    // console.log('getBoundingClientRect().width: galleryRef', galleryRef.current?.getBoundingClientRect().width);
    const oCube = document.querySelector('#cube-item-mobile');
    if (oCube) {
      setFinalHeight(oCube?.getBoundingClientRect().width || 160);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      const oCube = document.querySelector('#cube-item-mobile');
      if (oCube) {
        setFinalHeight(oCube?.getBoundingClientRect().width || 160);
      }
    }, 10);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cubeRef]);
  const renderPrice = () => {
    if (hasDisplayVariant) {
      let priceStr = '';
      if (_source.product_type === 'bundle') {
        priceStr += 'From ';
      }
      priceStr += toPrice(hasDisplayVariant.price, true);
      if (hasDisplayVariant.price !== hasDisplayVariant?.list_price) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Typography
              sx={{
                color: (theme) => theme.palette.brand.terracotta[500],
                marginRight: '10px',
              }}
            >
              {`${priceStr}`}
            </Typography>
            <Typography
              sx={{
                color: (theme) => theme.palette.brand.charcoal[800],
                textDecoration: 'line-through',
              }}
            >
              {`${toPrice(hasDisplayVariant.list_price, true)}`}
            </Typography>
          </Box>
        );
      } else {
        return (
          <Box>
            <Typography
              sx={{
                color: (theme) => theme.palette.brand.charcoal[800],
              }}
            >
              {`${priceStr}`}
            </Typography>
          </Box>
        );
      }
    }
  };
  const renderOptionValues = () => {
    if (colorMap) {
      let colorMapArray = Array.from(colorMap, ([key, value]) => ({ key, ...value }));
      if (colorMapArray.length < 2) {
        return null;
      }
      const moreNum = colorMapArray.length - 3;
      if (colorMapArray.length > 3) {
        colorMapArray = colorMapArray.slice(0, 3);
        colorMapArray.push({
          id: -1,
          presentation: `+${moreNum}`,
          value: 'More',
          image_src: '',
          key: 'More',
        });
      }
      return colorMapArray.map((item, index) => {
        const { id, presentation, value, image_src } = item;
        const hasSelected = item.id === hasDisplayVariant?.id;
        if (id === -1) {
          return (
            <Typography
              key={index}
              sx={{
                color: (theme) => theme.palette.brand.charcoal[500],
                fontSize: '14px',
                borderLeft: 'none !important',
              }}
            >
              {presentation}
            </Typography>
          );
        }
        return (
          <Button
            key={index}
            value={value}
            sx={{
              borderRadius: '50%',
              padding: 0,
              minHeight: 0,
              marginRight: 1,
              width: 28,
              height: 28,
              border: (theme) => (hasSelected ? `1px solid ${theme.palette.brand.charcoal[800]} !important` : 'none'),
              ':not([data-first-child]):not([data-last-child]):not(:only-child)': {
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: '50%',
              },
              '&[data-last-child]': {
                borderLeft: 'none',
              },
              '&[data-first-child]': {
                borderRight: 'none',
              },
            }}
            onClick={() => handleOptionValueClick(id)}
          >
            {/* <NextImage
              style={{
                borderRadius: '50%',
              }}
              src={image_src}
              alt={presentation}
              width={hasSelected ? 20 : 28}
              height={hasSelected ? 20 : 28}
            /> */}
            <FortressImage
              src={image_src}
              alt={presentation}
              imageWidth={hasSelected ? 20 : 28}
              imageHeight={hasSelected ? 20 : 28}
              sx={{
                borderRadius: '50%',
              }}
            />
          </Button>
        );
      });
    }
    return null;
  };
  const renderImage = () => {
    if (!hasDisplayVariant) {
      return null;
    }
    let image = 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png';
    if (hasDisplayVariant.images.length > 0) {
      image = hasDisplayVariant.images[0].large;
    }
    if (tablet && hasDisplayVariant) {
      if (hasDisplayVariant.life_style_image === null) {
        return (
          <FortressImage
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
            ratio={1}
            src={image}
            alt={_source.name}
          />
        );
      }
      return (
        <Box
          id="cube-item-mobile"
          ref={cubeRef}
          sx={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              '.slick-slider': {
                height: finalHeight,
              },
              '.slick-track': {
                display: 'flex',
              },
              '.slick-list': {
                height: finalHeight,
                overflow: 'hidden',
              },
              '.slick-slide': {
                height: finalHeight,
                div: {
                  height: finalHeight,
                  position: 'relative',
                },
              },
              '.slick-dots': {
                position: 'absolute',
                bottom: '8px',
                width: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex !important',
                padding: 0,
                margin: 0,
                '.slick-active': {
                  backgroundColor: (theme) => theme.palette.brand.sage[500],
                },
                li: {
                  minWidth: '8px',
                  minHeight: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#CCC',
                  'list-style-type': 'none',
                  marginRight: '8px',
                },
                button: {
                  display: 'none',
                },
              },
            },
          ]}
        >
          <Slider
            arrows={false}
            dots={true}
            slidesToShow={1}
            slidesToScroll={1}
            infinite={false}
            // customPaging={(i)}
          >
            <FortressImage
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}
              ratio={1}
              src={image}
              alt={_source.name}
            />
            <FortressImage
              sx={{
                position: 'absolute',
                zIndex: 2,
                // transition: 'opacity .4s linear 0s',
                left: 0,
                top: 0,
                // '&: hover': {
                //   opacity: 1,
                // },
              }}
              ratio={1}
              src={hasDisplayVariant.life_style_image?.large}
              alt={_source.name}
            />
          </Slider>
        </Box>
      );
    }
    return (
      <>
        {/* <NextImage
          src={hasDisplayVariant.images[0].large}
          alt={_source.name}
          // width={155}
          // height={155}
          objectFit="contain"
          layout="fill"
          onMouseEnter={handleMouseEnterImage}
          onMouseLeave={handleMouseLeaveImage}
        /> */}
        <FortressImage
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
          ratio={1}
          src={image}
          alt={_source.name}
        />
        {hasDisplayVariant.life_style_image !== null && (
          // <NextImage
          //   style={{
          //     position: 'absolute',
          //     zIndex: 2,
          //     opacity: mouseOnImage ? 1 : 0,
          //     transition: 'opacity .4s linear 0s',
          //     left: 0,
          //     top: 0,
          //   }}
          //   src={hasDisplayVariant.life_style_image?.large}
          //   alt={_source.name}
          //   objectFit="contain"
          //   layout="fill"
          //   onMouseEnter={handleMouseEnterImage}
          //   onMouseLeave={handleMouseLeaveImage}
          // />
          <FortressImage
            sx={{
              position: 'absolute',
              zIndex: 2,
              opacity: 0,
              transition: 'opacity .4s linear 0s',
              left: 0,
              top: 0,
              '&: hover': {
                opacity: 1,
              },
            }}
            ratio={1}
            src={hasDisplayVariant.life_style_image?.large}
            alt={_source.name}
          />
          // <div></div>
        )}
      </>
    );
  };
  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        paddingBottom: 2,
        borderColor: (theme) => (mouseOnContainer ? theme.palette.brand.wheat[300] : 'transparent'),
        transition: 'border-color .4s ease-in-out',
      }}
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeaveContainer}
    >
      <Link
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '&:hover': {
            textDecoration: 'none',
          },
        }}
        href={currentLink}
        onClick={handleLinkClick}
      >
        <Box
          sx={{
            width: '100%',
            // width: '155px',
            position: 'relative',
            height: 0 /* 设置高度为0 */,
            paddingTop: '100%',
          }}
        >
          <Tag badgeList={hasDisplayVariant?.badges || []} />
          {renderImage()}
        </Box>
        <Typography
          sx={{
            textAlign: 'center',
            color: '#000',
          }}
        >
          {_source.name}
        </Typography>
        {renderPrice()}
      </Link>

      <ButtonGroup>{renderOptionValues()}</ButtonGroup>
      {/* <Typography>
        {hasDisplayVariant?.product_short_description}
      </Typography> */}
    </Card>
  );
}

export default ProductCubeItem;
