'use client';

import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { RightArrow } from '@castlery/fortress/Icons';
import { DtStack } from '@castlery/modules-tracking-components';
import { useEffect, useRef, useState } from 'react';
import { hasRichText } from '../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { ImageProps } from '../component-v1/image';
import { VideoProps } from '../component-v1/video';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

interface MixMatchCardProps {
  blok: {
    _uid: string;
    size: 'small' | 'medium' | 'large';
    background_color: string;
    header: string;
    logo: {
      filename: string;
    };
    hover_logo: {
      filename: string;
    };
    image: ImageProps[];
    video: VideoProps[];
    text: string;
    link: {
      text: string;
      url: string;
      text_color: string;
      open_in_new_tab?: boolean;
    }[];
    direction: 'left' | 'right';
    header_color: string;
    stretchPos?: number;
  };
}

const MixMatchCard = ({ blok }: MixMatchCardProps) => {
  const {
    _uid,
    background_color = '#ffffff',
    size = 'large',
    header,
    logo,
    hover_logo,
    image,
    video,
    text,
    link,
    direction = 'left',
    stretchPos,
    header_color,
  } = blok || {};

  const { desktop } = useBreakpoints();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const smallStackRef = useRef<HTMLDivElement>(null);
  const [smallStackRatio, setSmallStackRatio] = useState(0.57);
  const dispatch = useAppDispatch();
  const aspectRatioConfig = {
    large: 0.6360424,
    medium: 0.83,
    small: 0.57,
  };

  useEffect(() => {
    if (!desktop) {
      setIsHovered(true);
    }
  }, [desktop]);

  // 使用 requestAnimationFrame 动态更新 smallStackRatio
  useEffect(() => {
    if (!smallStackRef.current) return;

    let animationFrameId: number;

    const updateRatio = () => {
      if (smallStackRef.current) {
        const rect = smallStackRef.current.getBoundingClientRect();
        const height = rect.height;
        const width = rect.width;

        if (width > 0) {
          const ratio = height / width;
          setSmallStackRatio(ratio);
        }
      }

      // 继续下一帧的更新
      animationFrameId = requestAnimationFrame(updateRatio);
    };

    // 开始更新
    animationFrameId = requestAnimationFrame(updateRatio);

    // 清理函数
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const hasText = hasRichText(text);

  const handleLinkClick = () => {
    dispatch(EVENT_STORYBLOK({ action: 'mix_match_card_click', label: header, method: document?.title || '' }));
  };

  if (desktop) {
    if (size === 'small') {
      return (
        <DtStack
          useImpression
          key={_uid}
          uid={_uid}
          componentName="Mix Match Card V2"
          direction={direction === 'right' ? 'row' : 'row-reverse'}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          sx={{
            flex: 1,
            ...(stretchPos === 0 && {
              position: 'absolute',
              top: 0,
              bottom: '50%',
              left: 0,
              right: 0,
            }),
            ...(stretchPos === 1 && {
              position: 'absolute',
              top: '50%',
              bottom: 0,
              left: 0,
              right: 0,
            }),
          }}
        >
          <Stack
            sx={{
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
            ref={smallStackRef}
          >
            {link?.[0]?.url ? (
              <Link
                target={link?.[0]?.open_in_new_tab ? '_blank' : '_self'}
                href={link?.[0]?.url}
                onClick={handleLinkClick}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  padding: '0 !important',
                  margin: '0 !important',
                  border: 'none !important',
                }}
              >
                <ImageOrVideo
                  image={image}
                  video={video}
                  // loader={{
                  //   ratio: smallStackRatio,
                  // }}
                  imageWidth={smallStackRef.current?.getBoundingClientRect().width || 0}
                  imageHeight={smallStackRef.current?.getBoundingClientRect().height || 0}
                  sizes={['1-xs', '0.5-md', '0.5-lg', '0.3-xl']}
                />
              </Link>
            ) : (
              <ImageOrVideo
                image={image}
                video={video}
                // loader={{
                //   ratio: smallStackRatio,
                // }}
                imageWidth={smallStackRef.current?.getBoundingClientRect().width || 0}
                imageHeight={smallStackRef.current?.getBoundingClientRect().height || 0}
                sizes={['0.5-md', '1-xs']}
              />
            )}
          </Stack>
        </DtStack>
      );
    }

    if (!hasText) {
      return (
        <DtStack
          useImpression
          key={_uid}
          uid={_uid}
          componentName="Mix Match Card V2"
          direction="column-reverse"
          justifyContent={direction === 'right' ? 'flex-start' : 'flex-end'}
          sx={{
            flex: 1,
          }}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          <Stack
            direction="column"
            sx={(theme) => ({
              width: '100%',
              padding: `${20}px ${32}px`,
              justifyContent: 'center',
              [theme.breakpoints.down('sm')]: {
                padding: '24px',
              },
              backgroundColor: isHovered ? theme.palette.brand.maroonVelvet[500] : background_color,
              transition: 'background-color 0.3s ease',
            })}
          >
            {link?.length > 0 && (
              <Stack>
                {link.map((item) => (
                  <Stack direction="row" alignItems="center" sx={{ cursor: 'pointer' }}>
                    <Link
                      target={item.open_in_new_tab ? '_blank' : '_self'}
                      href={item.url}
                      onClick={handleLinkClick}
                      sx={(theme) => ({
                        fontSize: '18px',
                        color: isHovered
                          ? `${theme.palette.brand.warmLinen[500]} !important`
                          : `${item.text_color} !important`,
                        transition: 'color 0.3s ease',
                        marginRight: '8px',
                        textDecoration: 'none',
                        fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
                        '&:hover': {
                          textDecoration: 'none',
                        },
                      })}
                    >
                      {item.text.toLocaleUpperCase()}
                    </Link>
                    <RightArrow
                      sx={(theme) => ({
                        fill: isHovered ? theme.palette.brand.warmLinen[500] : item.text_color,
                        pointerEvents: isHovered ? 'auto' : 'none',
                        transition: 'opacity 0.3s ease',
                      })}
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack
            sx={{
              width: '100%',
              position: 'relative',
              maxHeight: '720px',
              overflow: 'hidden',
            }}
          >
            {header && (
              <Typography
                level="h2"
                sx={(theme) => ({
                  color: header_color || theme.palette.brand.warmLinen[500],
                  position: 'absolute',
                  bottom: '32px',
                  left: '32px',
                  zIndex: 3,
                })}
              >
                {header}
              </Typography>
            )}
            <ImageOrVideo
              image={image}
              video={video}
              loader={{
                ratio: !desktop ? 1.391 : aspectRatioConfig[size],
              }}
              sizes={['1-xs', '0.5-md', '0.5-lg', '0.3-xl']}
            />
          </Stack>
        </DtStack>
      );
    }

    if (size === 'medium') {
      return (
        <DtStack
          useImpression
          key={_uid}
          uid={_uid}
          componentName="Mix Match Card V2"
          direction="column-reverse"
          justifyContent={direction === 'right' ? 'flex-start' : 'flex-end'}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          <Stack
            direction="column"
            sx={(theme) => ({
              width: '100%',
              position: 'relative',
              padding: '32px',
              justifyContent: 'center',
              backgroundColor: isHovered ? theme.palette.brand.maroonVelvet[500] : background_color,
              transition: 'background-color 0.3s',
            })}
          >
            {header && (
              <Typography level="h2" sx={{ color: header_color || 'transparent', opacity: 0 }}>
                {header}
              </Typography>
            )}
            {hasRichText(text) && (
              <RichTextTypography
                level="body2"
                sx={(theme) => ({
                  opacity: 0,
                  mt: '16px',
                  mb: '0px',
                  [theme.breakpoints.down('sm')]: {
                    mt: '16px',
                  },
                  color: 'transparent !important',
                })}
                description={text}
              />
            )}
            <Stack
              sx={(theme) => ({
                position: 'absolute',
                top: isHovered ? '32px' : '60px',
                left: '32px',
                right: '32px',
                transition: 'color 0.3s ease, top 0.3s ease',
                zIndex: 3,
              })}
            >
              {header && (
                <Typography
                  level="h2"
                  sx={(theme) => ({
                    color: isHovered
                      ? theme.palette.brand.warmLinen[500]
                      : header_color || theme.palette.brand.maroonVelvet[500],
                  })}
                >
                  {header}
                </Typography>
              )}
              {hasRichText(text) && (
                <RichTextTypography
                  level="body2"
                  sx={(theme) => ({
                    mt: '16px',
                    color: isHovered ? `${theme.palette.brand.warmLinen[500]} !important` : '',
                    a: {
                      color: isHovered
                        ? `${theme.palette.brand.warmLinen[500]} !important`
                        : theme.palette.brand.terracotta[500],
                      textDecorationColor: isHovered
                        ? `${theme.palette.brand.warmLinen[500]} !important`
                        : theme.palette.brand.terracotta[500],
                    },
                    transition: 'color 0.3s ease',
                  })}
                  description={text}
                />
              )}
            </Stack>
            {link?.length > 0 && (
              <Stack
                sx={{
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {link.map((item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={(theme) => ({
                      marginTop: '16px',
                      cursor: 'pointer',
                    })}
                  >
                    <Link
                      target={item.open_in_new_tab ? '_blank' : '_self'}
                      href={item.url}
                      onClick={handleLinkClick}
                      sx={(theme) => ({
                        color: `${theme.palette.brand.warmLinen[500]} !important`,
                        marginRight: '6px',
                        textDecoration: 'underline',
                        textDecorationColor: theme.palette.brand.warmLinen[500],
                        '&:hover': {
                          textDecoration: 'underline',
                          textDecorationColor: theme.palette.brand.warmLinen[500],
                        },
                        [theme.breakpoints.down('sm')]: {
                          marginRight: '4px',
                        },
                      })}
                    >
                      {item.text}
                    </Link>
                    <RightArrow
                      sx={(theme) => ({
                        fill: theme.palette.brand.warmLinen[500],
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: isHovered ? 'auto' : 'none',
                        transition: 'opacity 0.3s ease',
                      })}
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack
            sx={{
              width: '100%',
              position: 'relative',
              maxHeight: '720px',
              overflow: 'hidden',
            }}
          >
            <ImageOrVideo
              image={image}
              video={video}
              loader={{
                ratio: aspectRatioConfig[size],
              }}
              sizes={['1-xs', '0.5-md', '0.5-lg', '0.3-xl']}
            />
          </Stack>
        </DtStack>
      );
    }

    return (
      <DtStack
        useImpression
        key={_uid}
        uid={_uid}
        componentName="Mix Match Card V2"
        direction={direction === 'right' ? 'row' : 'row-reverse'}
        sx={{
          width: '100%',
          maxHeight: '720px',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <Stack
          direction="column"
          sx={(theme) => ({
            width: '34.6%',
            position: 'relative',
            padding: `${20}px ${32}px`,
            justifyContent: 'center',
            [theme.breakpoints.down('sm')]: {
              padding: '24px',
            },
            backgroundColor: isHovered ? theme.palette.brand.maroonVelvet[500] : background_color,
            transition: 'background-color 0.3s ease',
          })}
        >
          {!isHovered && logo?.filename && (
            <img src={logo.filename} alt={''} style={{ width: 200, height: 50, marginBottom: '24px' }} />
          )}
          {isHovered && hover_logo?.filename && (
            <img src={hover_logo.filename} alt={''} style={{ width: 200, height: 50, marginBottom: '24px' }} />
          )}
          {header && (
            <Typography
              level="h2"
              sx={(theme) => ({
                color: isHovered
                  ? theme.palette.brand.warmLinen[500]
                  : header_color || theme.palette.brand.maroonVelvet[500],
                transition: 'color 0.3s ease',
              })}
            >
              {header}
            </Typography>
          )}
          {hasRichText(text) && (
            <RichTextTypography
              level="body1"
              sx={(theme) => ({
                mt: '24px',
                [theme.breakpoints.down('sm')]: {
                  mt: '16px',
                },
                color: isHovered ? `${theme.palette.brand.warmLinen[500]} !important` : '',
                a: {
                  color: isHovered
                    ? `${theme.palette.brand.warmLinen[500]} !important`
                    : theme.palette.brand.terracotta[500],
                  textDecorationColor: isHovered
                    ? `${theme.palette.brand.warmLinen[500]} !important`
                    : theme.palette.brand.terracotta[500],
                },
                transition: 'color 0.3s ease',
              })}
              description={text}
            />
          )}
          {link?.length > 0 && (
            <Stack
              sx={(theme) => ({
                position: 'absolute',
                bottom: '40px',
                left: '32px',
                [theme.breakpoints.down('sm')]: {
                  bottom: '24px',
                  left: '24px',
                },
              })}
            >
              {link.map((item) => (
                <Stack direction="row" alignItems="center" sx={{ cursor: 'pointer' }}>
                  <Link
                    target={item.open_in_new_tab ? '_blank' : '_self'}
                    href={item.url}
                    onClick={handleLinkClick}
                    sx={(theme) => ({
                      color: `${theme.palette.brand.warmLinen[500]} !important`,
                      opacity: isHovered ? 1 : 0,
                      pointerEvents: isHovered ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease',
                      textDecoration: 'underline',
                      textDecorationColor: theme.palette.brand.warmLinen[500],
                      marginRight: '6px',
                      [theme.breakpoints.down('sm')]: {
                        marginRight: '4px',
                      },
                      '&:hover': {
                        textDecoration: 'underline',
                        textDecorationColor: theme.palette.brand.warmLinen[500],
                      },
                    })}
                  >
                    {item.text}
                  </Link>
                  <RightArrow
                    sx={(theme) => ({
                      fill: theme.palette.brand.warmLinen[500],
                      opacity: isHovered ? 1 : 0,
                      pointerEvents: isHovered ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease',
                    })}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
        <Stack
          sx={{
            width: '65.4%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <ImageOrVideo
            image={image}
            video={video}
            loader={{
              ratio: !desktop ? 1.391 : aspectRatioConfig[size],
            }}
            sizes={['1-xs', '1-md', '0.7-lg', '0.5-xl']}
          />
        </Stack>
      </DtStack>
    );
  }

  if (size === 'small') {
    return (
      <DtStack
        useImpression
        key={_uid}
        uid={_uid}
        componentName="Mix Match Card V2"
        direction={direction === 'right' ? 'column-reverse' : 'column'}
      >
        <Stack
          sx={{
            width: '100%',
            mb: '16px',
          }}
        >
          {link?.[0]?.url ? (
            <Link
              target={link?.[0]?.open_in_new_tab ? '_blank' : '_self'}
              href={link?.[0]?.url}
              onClick={handleLinkClick}
              sx={{
                display: 'block',
                height: '100%',
                padding: '0 !important',
                border: 'none !important',
              }}
            >
              <ImageOrVideo
                image={image}
                video={video}
                loader={{
                  ratio: 0.705,
                }}
                sizes={['1-xs', '1-md']}
              />
            </Link>
          ) : (
            <ImageOrVideo
              image={image}
              video={video}
              loader={{
                ratio: 0.705,
              }}
              sizes={['1-xs', '1-md']}
            />
          )}
        </Stack>
      </DtStack>
    );
  }

  if (!hasText) {
    return (
      <DtStack
        useImpression
        key={_uid}
        uid={_uid}
        componentName="Mix Match Card V2"
        direction="column-reverse"
        justifyContent={direction === 'right' ? 'flex-start' : 'flex-end'}
        sx={{
          flex: 1,
        }}
      >
        <Stack
          direction="column"
          sx={(theme) => ({
            width: '100%',
            padding: `${12}px ${24}px`,
            justifyContent: 'center',
            backgroundColor: theme.palette.brand.maroonVelvet[500],
          })}
        >
          {link?.length > 0 && (
            <Stack>
              {link.map((item) => (
                <Stack direction="row" alignItems="center">
                  <Link
                    target={item.open_in_new_tab ? '_blank' : '_self'}
                    href={item.url}
                    onClick={handleLinkClick}
                    sx={(theme) => ({
                      fontSize: '16px',
                      color: `${theme.palette.brand.warmLinen[500]} !important`,
                      fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
                      marginRight: '8px',
                      textDecoration: 'none',
                    })}
                  >
                    {item.text}
                  </Link>
                  <RightArrow
                    sx={(theme) => ({
                      fill: theme.palette.brand.warmLinen[500],
                      opacity: isHovered ? 1 : 0,
                      pointerEvents: isHovered ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease',
                    })}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
        <Stack
          sx={{
            position: 'relative',
            width: '100%',
          }}
        >
          <ImageOrVideo
            image={image}
            video={video}
            loader={{
              ratio: 1,
            }}
            sizes={['1-xs', '1-md']}
          />
          {header && (
            <Typography
              level="h2"
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                zIndex: 3,
              })}
            >
              {header}
            </Typography>
          )}
        </Stack>
      </DtStack>
    );
  }

  return (
    <DtStack
      useImpression
      key={_uid}
      uid={_uid}
      componentName="Mix Match Card V2"
      direction={direction === 'right' || size === 'large' ? 'column-reverse' : 'column'}
    >
      {size !== 'small' && (
        <Stack
          direction="column"
          sx={(theme) => ({
            width: '100%',
            position: 'relative',
            padding: '24px',
            justifyContent: 'center',
            backgroundColor: theme.palette.brand.maroonVelvet[500],
          })}
        >
          {hover_logo?.filename && (
            <img src={hover_logo.filename} alt={''} style={{ width: 200, height: 50, marginBottom: '20px' }} />
          )}
          {header && (
            <Typography
              level="h2"
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
              })}
            >
              {header}
            </Typography>
          )}
          {hasRichText(text) && (
            <RichTextTypography
              level="body1"
              sx={(theme) => ({
                mt: '16px',
                mb: '24px',
                color: `${theme.palette.brand.warmLinen[500]} !important`,
                a: {
                  color: theme.palette.brand.warmLinen[500],
                  textDecorationColor: theme.palette.brand.warmLinen[500],
                },
              })}
              description={text}
            />
          )}
          {link?.length > 0 && (
            <Stack>
              {link.map((item) => (
                <Stack direction="row" alignItems="center">
                  <Link
                    target={item.open_in_new_tab ? '_blank' : '_self'}
                    href={item.url}
                    onClick={handleLinkClick}
                    sx={(theme) => ({
                      color: `${theme.palette.brand.warmLinen[500]} !important`,
                      textDecoration: 'underline',
                      textDecorationColor: theme.palette.brand.warmLinen[500],
                    })}
                  >
                    {item.text}
                  </Link>
                  <RightArrow
                    sx={(theme) => ({
                      fill: theme.palette.brand.warmLinen[500],
                      opacity: isHovered ? 1 : 0,
                      pointerEvents: isHovered ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease',
                    })}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      )}
      <Stack
        sx={{
          width: '100%',
          mb: size === 'small' ? '16px' : 0,
        }}
      >
        <ImageOrVideo
          image={image}
          video={video}
          loader={{
            ratio: size === 'medium' ? 1 : video.length > 0 ? 1.418 : 0.705,
          }}
          sizes={['1-xs', '1-md']}
        />
      </Stack>
    </DtStack>
  );
};

export { MixMatchCard, MixMatchCardProps };
