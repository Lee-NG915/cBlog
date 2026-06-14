'use client';

import { Box, Typography, Stack, IconButton } from '@castlery/fortress';
import { Add, Remove } from '@castlery/fortress/Icons';
import { useEffect, useState, useRef } from 'react';
import ComfortRatingLine from './comfort-rating-line';
import InfoButton from '../info-button/info-button';
// import Image from 'next/image';
import { FortressImage } from '@castlery/shared-components';
import { EcEnv, enableWarranty } from '@castlery/config';

/* eslint-disable-next-line */

export type ContentListItem = {
  explanation?: string | null;
  is_private: boolean;
  is_public: boolean;
  name: string;
  presentation: string;
  value: string;
};
export interface ProductPropertyExpandProps {
  propertyName: string;
  contentList: ContentListItem[];
  onClick?: (explanation: string) => void;
}

enum ClickStatus {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

const SPECIAL_PROPERTY_NAME = 'Product Dimensions';
const SPECIAL_COMFORT_NAME_ARRAY = [
  'overall_sit_rating',
  'seat_depth_rating',
  'seat_height_rating',
  'seat_softness_rating',
];
const SPECIAL_COMFORT_DESC_MAP: { [key: string]: string[] } = {
  overall_sit_rating: ['Relaxed', 'Upright'],
  seat_depth_rating: ['Shallow', 'Deep'],
  seat_height_rating: ['Low', 'High'],
  seat_softness_rating: ['Soft', 'Firm'],
};
const SPECIAL_DIMENSION_IMAGE_NAME = 'Dimension Image';

export function ProductPropertyExpand(props: ProductPropertyExpandProps) {
  const { propertyName, contentList, onClick } = props;
  const [hasExpand, setHasExpand] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);
  const [hasAnimationExpand, setHasAnimationExpand] = useState(false);
  const [realContentList, setRealContentList] = useState<ContentListItem[]>();
  const [comfortContentArr, setComfortContentArr] = useState<ContentListItem[]>();
  const [dimensionImageUrl, setDimensionImageUrl] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState(0);
  const handleExpandChange = (status?: ClickStatus) => {
    if (status === ClickStatus.ADD) {
      setHasAnimationExpand(true);
      setTimeout(() => {
        if (expandRef.current) {
          setMaxHeight(expandRef.current.scrollHeight);
        }
      }, 10);
    } else if (status === ClickStatus.REMOVE) {
      setHasAnimationExpand(false);
    } else {
      if (hasExpand) {
        setHasAnimationExpand(false);
      } else {
        setHasAnimationExpand(true);
        setTimeout(() => {
          if (expandRef.current) {
            setMaxHeight(expandRef.current.scrollHeight);
          }
        }, 10);
      }
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasExpand(hasAnimationExpand);
    }, 500);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [hasAnimationExpand]);
  useEffect(() => {
    if (contentList?.length) {
      if (propertyName === SPECIAL_PROPERTY_NAME) {
        const comfortArr: ContentListItem[] = [];
        const normalArr: ContentListItem[] = [];
        setDimensionImageUrl('');
        contentList.forEach((item) => {
          if (SPECIAL_COMFORT_NAME_ARRAY.includes(item.name)) {
            comfortArr.push(item);
          } else if (item.name === SPECIAL_DIMENSION_IMAGE_NAME) {
            setDimensionImageUrl(item.explanation || '');
          } else {
            normalArr.push(item);
          }
        });
        setRealContentList(normalArr);
        setComfortContentArr(comfortArr);
      } else {
        setRealContentList(contentList);
      }
    }
  }, [contentList, propertyName]);

  if (contentList.length === 0) {
    return null;
  }
  return (
    <Stack
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        paddingX: 2,
        paddingY: 1,
        border: (theme) => `1px solid ${theme.palette.brand?.wheat?.[500]}`,
      }}
    >
      <Box
        sx={[
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          },
        ]}
        onClick={() => handleExpandChange()}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: (theme) => theme.palette.brand?.charcoal?.[800],
          }}
        >
          {propertyName}
        </Typography>
        {!hasExpand && (
          <IconButton
            sx={[
              {
                // width: 24,
                // height: 24,
                // minWidth: 0,
                // minHeight: 0,
                opacity: 1,
                transition: 'opacity .5s linear',
              },
              hasAnimationExpand && {
                opacity: 0,
              },
              // !hasAnimationExpand && {
              //   opacity: 1,
              //   transition: 'transform 1s',
              // }
            ]}
            onClick={() => handleExpandChange(ClickStatus.ADD)}
          >
            <Add
              sx={[
                {
                  color: (theme) => theme.palette.brand?.wheat?.[500],
                },
              ]}
            />
          </IconButton>
        )}
        {hasExpand && (
          <IconButton
            sx={[
              {
                // width: 24,
                // height: 24,
                // minWidth: 0,
                // minHeight: 0,
                // '--IconButton-size': 0,
                opacity: 0,
                transition: 'opacity .5s linear',
              },
              hasAnimationExpand && {
                opacity: 1,
              },
              // !hasAnimationExpand && {
              //   opacity: 0,
              //   transition: 'transform 1s',
              // }
            ]}
            onClick={() => handleExpandChange(ClickStatus.REMOVE)}
          >
            <Remove
              sx={[
                {
                  color: (theme) => theme.palette.brand.wheat[500],
                },
              ]}
            />
          </IconButton>
        )}
      </Box>
      <Stack
        ref={expandRef}
        sx={[
          {
            transition: 'max-height .5s linear',
            overflow: 'hidden',
            maxHeight: 0,
          },
          hasAnimationExpand && {
            maxHeight: `${maxHeight}px`,
          },
        ]}
      >
        {dimensionImageUrl && (
          <Box>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
              }}
            >
              <FortressImage src={dimensionImageUrl} alt={propertyName} ratio={2.69} />
              {/* <Image src={dimensionImageUrl} alt={propertyName} layout="fill" objectFit="contain" /> */}
            </Box>
          </Box>
        )}
        {comfortContentArr &&
          comfortContentArr.map((item, index) => {
            return (
              <ComfortRatingLine
                isFirst={index === 0}
                key={index}
                highestRating={5}
                name={item.presentation}
                lowestWord={SPECIAL_COMFORT_DESC_MAP[item.name][0]}
                highestWord={SPECIAL_COMFORT_DESC_MAP[item.name][1]}
                currentRating={item.value}
                explanation={item.explanation}
                onClick={onClick}
              />
            );
          })}
        {realContentList &&
          realContentList.map((item, index) => {
            if (item.name === 'warranty' && enableWarranty) {
              return (
                <Box
                  key={index}
                  sx={[
                    {
                      boxSizing: 'border-box',
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      paddingBottom: 1,
                    },
                    index !== 0 && {
                      marginTop: 1,
                    },
                    index === 0 && {
                      marginTop: 2,
                    },
                    index !== realContentList.length - 1 && {
                      borderBottom: (theme) => `.5px solid ${theme.palette.brand.wheat[500]}`,
                    },
                  ]}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: (theme) => theme.palette.brand.charcoal[800],
                      minWidth: 200,
                      maxWidth: 200,
                    }}
                  >
                    {item.presentation}
                  </Typography>
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {item.value.split(' ').map((value, index) => {
                        return (
                          <Typography
                            key={index}
                            sx={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: (theme) => theme.palette.brand.charcoal[800],
                              marginRight: item?.explanation || item.name === 'returns' ? 1 : '4px',
                            }}
                          >
                            {value}
                          </Typography>
                        );
                      })}
                      {item.name === 'warranty' && enableWarranty && (
                        <>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: (theme) => theme.palette.brand.charcoal[800],
                              marginRight: 1,
                            }}
                          >
                            {`(Included)`}
                          </Typography>
                          <InfoButton
                            innerStyle={{
                              width: '14px',
                              height: '14px',
                            }}
                            tooltipTitle="More Info Here"
                            placement="right"
                            onClick={() => {
                              window.open(
                                `${
                                  EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
                                }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/warranty`,
                                '_blank'
                              );
                            }}
                          />
                        </>
                      )}
                    </Stack>
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: (theme) => theme.palette.brand.charcoal[800],
                          marginRight: 1,
                        }}
                      >
                        {`Mulberry Extended Warranty (Add-On)`}
                      </Typography>
                      <InfoButton
                        innerStyle={{
                          width: '14px',
                          height: '14px',
                        }}
                        tooltipTitle="More Info Here"
                        placement="right"
                        onClick={() => {
                          window.mulberry.inline.instances[0].postMessageClient.listeners
                            .find((x) => x.key === 'mulberry:inline-to-faq')
                            .fn(window.mulberry.core.settings);
                        }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              );
            }
            return (
              <Box
                key={index}
                sx={[
                  {
                    boxSizing: 'border-box',
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    paddingBottom: 1,
                  },
                  index !== 0 && {
                    marginTop: 1,
                  },
                  index === 0 && {
                    marginTop: 2,
                  },
                  index !== realContentList.length - 1 && {
                    borderBottom: (theme) => `.5px solid ${theme.palette.brand.wheat[500]}`,
                  },
                ]}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: (theme) => theme.palette.brand.charcoal[800],
                    minWidth: 200,
                    maxWidth: 200,
                  }}
                >
                  {item.presentation}
                </Typography>
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  {item.value?.split(' ').map((value, index) => {
                    return (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: (theme) => theme.palette.brand.charcoal[800],
                          marginRight: item?.explanation || item.name === 'returns' ? 1 : '4px',
                        }}
                      >
                        {value}
                      </Typography>
                    );
                  })}
                  {item.name === 'warranty' && enableWarranty && (
                    <>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: (theme) => theme.palette.brand.charcoal[800],
                          marginRight: 1,
                        }}
                      >
                        {`(Included)`}
                      </Typography>
                      <InfoButton
                        innerStyle={{
                          width: '14px',
                          height: '14px',
                        }}
                        tooltipTitle="More Info Here"
                        placement="right"
                        onClick={() => {
                          window.open(
                            `${
                              EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
                            }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/warranty`,
                            '_blank'
                          );
                        }}
                      />
                    </>
                  )}
                  {(item?.explanation || item.name === 'returns') && (
                    <InfoButton
                      innerStyle={{
                        width: '14px',
                        height: '14px',
                      }}
                      tooltipTitle="More Info Here"
                      placement="right"
                      onClick={() => {
                        if (onClick) {
                          if (item.name === 'returns') {
                            window.open(
                              `${
                                EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
                              }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/sales-and-refunds`,
                              '_blank'
                            );
                            return;
                          } else if (item?.explanation) {
                            onClick(item.explanation);
                          }
                        }
                      }}
                    />
                  )}
                </Stack>
              </Box>
            );
          })}
      </Stack>
    </Stack>
  );
}

export default ProductPropertyExpand;
