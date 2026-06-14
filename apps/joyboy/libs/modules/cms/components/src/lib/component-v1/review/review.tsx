'use client';

import React, { useRef } from 'react';
import { containerClasses, Stack, Typography, Box, Button, Container } from '@castlery/fortress';
import { ArrowRight, Quote } from '@castlery/fortress/Icons';
import { storyblokEditable } from '@storyblok/react/rsc';
import { CustomLink, Rating } from '@castlery/shared-components';
import { ImageProps } from './../image';
import { VideoProps } from './../video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { RichTextTypography, ImageOrVideo } from '../components';

import { hasRichText } from '../../../utils/rich-text-utils';
import { useImgRatio } from '../hook/ratio';
import { useNumberOfLines } from '../hook/lines';
import { DtStack } from '@castlery/modules-tracking-components';

export type ReviewProps = {
  blok: {
    _uid?: string;
    header?: string;
    description?: object;
    rating?: number;
    author?: string;
    link?: {
      url?: string;
      target?: string;
    };
    image?: ImageProps[];
    video?: VideoProps[];
  };
  isNested?: boolean;
};

export const ReviewHeader = ({ header, headerRef, lineNum, borderTop }: any) => (
  <Stack
    sx={(theme) => ({
      borderTop: borderTop ? `1px solid ${theme.palette.brand.wheat[500]}` : 'none',
      borderBottom: `1px solid ${theme.palette.brand.wheat[500]}`,
      position: 'absolute',
      top: theme.spacing(8),
      width: '47%',
      [theme.breakpoints.down('sm')]: {
        position: 'relative',
        top: 0,
        alignItems: 'flex-start',
        width: '100%',
      },
    })}
  >
    {header && (
      <Typography
        ref={headerRef}
        level="h1"
        component="h2"
        sx={(theme) => ({
          width: '70%',
          whiteSpace: 'pre-line',
          [theme.breakpoints.down('sm')]: {
            width: '100%',
            px: '6px',
          },
        })}
      >
        {header}
      </Typography>
    )}

    {lineNum > 1 &&
      Array.from({ length: lineNum - 1 }, (_, i) => (
        <Box
          key={i}
          sx={(theme) => ({
            width: '100%',
            borderBottom: `1px solid ${theme.palette.brand.wheat[500]}`,
            position: 'absolute',
            left: 0,
            top: `${((i + 1) / lineNum) * 100}%`,
          })}
        />
      ))}
  </Stack>
);

export const AllReviewsLink = ({ header, link }: any) => {
  // const trackClick = () => {
  //   // dispatch({
  //   //   type: EVENT_VIEW_ALL_REVIEWS_CLICK,
  //   //   result: {
  //   //     header,
  //   //   },
  //   // });
  // };

  return (
    <Stack
      sx={(theme) => ({
        width: 'fit-content',
        a: {
          alignItems: 'flex-end',
          [theme.breakpoints.down('sm')]: {
            alignItems: 'flex-start',
          },
          button: {
            pl: 0,
          },
        },
      })}
    >
      <CustomLink
        href={link?.url || ''}
        // handleClick={trackClick}
      >
        <Button variant="tertiary" endDecorator={<ArrowRight fontSize="xl3" />} size="sm">
          View All Reviews
        </Button>
      </CustomLink>
    </Stack>
  );
};

function Review({ blok, isNested }: ReviewProps) {
  const { desktop } = useBreakpoints();
  const { _uid, header, description, rating, author, link, image = [], video = [] } = blok;
  const textRef = useRef<HTMLDivElement>(null);
  const imgRatio = useImgRatio('default', { default: 0.636 }, textRef, 0.56);
  const headerRef = useRef<HTMLDivElement>(null);
  const lineNum = useNumberOfLines(headerRef);

  return (
    <Container
      disableGutters
      sx={(theme) => ({
        [`&.${containerClasses.root}`]: {
          position: 'relative',
          [theme.breakpoints.up('sm')]: {
            height: '617px',
          },
          [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            px: isNested ? 0 : theme.spacing(2),
          },
        },
      })}
    >
      <DtStack useImpression {...storyblokEditable(blok)} key={_uid} uid={_uid} componentName="review">
        <Stack
          sx={(theme) => ({
            borderTop: !isNested || desktop ? `1px solid ${theme.palette.brand.wheat[500]}` : 'none',
            pl: theme.spacing(6),
            height: '100%',
            [theme.breakpoints.down('sm')]: {
              pl: 0,
            },
          })}
        >
          {(!isNested || desktop) && <ReviewHeader header={header} headerRef={headerRef} lineNum={lineNum} />}

          <Stack
            direction="row"
            sx={(theme) => ({
              position: 'relative',
              alignItems: 'center',
              gap: theme.spacing(5),
              height: '100%',
              [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
                alignItems: 'start',
                gap: theme.spacing(3),
              },
            })}
          >
            <Stack
              ref={textRef}
              sx={(theme) => ({
                width: '44%',
                height: '100%',
                pt: theme.spacing(lineNum * 8 + 12),
                [theme.breakpoints.down('sm')]: {
                  width: '100%',
                  py: 0,
                  alignItems: 'flex-start',
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  [theme.breakpoints.down('sm')]: {
                    display: 'none',
                  },
                })}
              >
                <AllReviewsLink header={header} link={link} />
              </Box>

              <Stack
                sx={(theme) => ({
                  mt: theme.spacing(4),
                  [theme.breakpoints.down('sm')]: {
                    mt: theme.spacing(3),
                  },
                })}
              >
                <Quote fontSize="xl4" />
              </Stack>

              {hasRichText(description) && (
                <RichTextTypography
                  level={desktop ? 'body1' : 'body2'}
                  sx={(theme) => ({
                    mt: theme.spacing(6),
                    pl: theme.spacing(4),
                    whiteSpace: 'pre-line',
                    ...(isNested
                      ? {
                          height: '150px',
                        }
                      : {
                          maxHeight: '150px',
                        }),
                    overflow: 'auto',
                    zIndex: 1,
                    [theme.breakpoints.down('sm')]: {
                      mt: theme.spacing(2),
                      pl: theme.spacing(3),
                      ...(isNested && {
                        height: '150px',
                      }),
                    },
                  })}
                  description={description}
                />
              )}

              <Stack
                direction="row"
                gap={5}
                sx={(theme) => ({
                  mt: theme.spacing(6),
                  [theme.breakpoints.down('sm')]: {
                    mt: theme.spacing(3),
                  },
                  '> div': {
                    display: 'inline-flex',
                    ':first-child': {
                      mt: theme.spacing(0.5),
                      [theme.breakpoints.down('sm')]: {
                        mt: theme.spacing(0.25),
                      },
                    },
                  },
                })}
              >
                <Rating rating={rating} size={18} innerColor={'#A45B37'} outerColor={'#A45B37'} />

                {author && (
                  <Typography level="body2" whiteSpace="pre-line">
                    {author}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack
              sx={(theme) => ({
                width: '56%',
                position: 'relative',
                alignSelf: 'stretch',
                [theme.breakpoints.down('sm')]: {
                  width: '100%',
                  alignSelf: 'start',
                },
                div: {
                  height: '100%',
                },
              })}
            >
              <ImageOrVideo
                video={video}
                image={image}
                loader={{
                  ratio: !desktop ? 0.6703 : imgRatio,
                }}
              />
            </Stack>

            {!isNested && (
              <Box
                sx={(theme) => ({
                  display: 'none',
                  [theme.breakpoints.down('sm')]: {
                    display: 'block',
                  },
                })}
              >
                <AllReviewsLink header={header} link={link} />
              </Box>
            )}
          </Stack>
        </Stack>
      </DtStack>
    </Container>
  );
}

export { Review };
