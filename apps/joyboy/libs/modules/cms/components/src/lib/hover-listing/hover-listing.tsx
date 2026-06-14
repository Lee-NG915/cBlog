'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { DtStack } from '@castlery/modules-tracking-components';
import { ScrollWrapper } from '@castlery/shared-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { hasRichText } from '../../utils/rich-text-utils';
import { Button, ButtonProps } from '../component-v1/button';
import { RichTextTypography } from '../component-v1/components';
import {
  HoverHorizontalCard,
  HoverHorizontalCardProps,
  HoverVerticalCard,
  HoverVerticalCardProps,
} from '../hover-card';

type HoverListingProps = {
  blok: {
    direction: 'horizontal' | 'vertical';
    background: string;
    header: string;
    header_level: 'h2' | 'h3';
    header_color: string;
    header_position: 'left' | 'top_left' | 'top_center';
    text: string;
    items: HoverHorizontalCardProps[] | HoverVerticalCardProps[];
    button: ButtonProps[];
    hover_status?: boolean;
    _uid: string;
  };
};

const HoverListing = ({ blok }: HoverListingProps) => {
  const {
    direction = 'horizontal',
    background,
    header,
    header_level,
    text,
    items,
    button,
    header_color,
    header_position = 'left',
    hover_status = true,
    _uid,
  } = blok;

  const { desktop } = useBreakpoints();

  const noContent = !header && !hasRichText(text) && button.length === 0;

  if (!desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="hover-listing" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            padding: desktop ? '32px' : '24px',
            paddingRight: direction === 'vertical' ? 0 : 'auto',
            backgroundColor: background,
          })}
        >
          {(header || hasRichText(text) || button.length > 0) && (
            <Stack
              sx={{
                mb: '32px',
                paddingRight: '32px',
              }}
            >
              <Typography
                level={header_level}
                sx={(theme) => ({
                  color: header_color || theme.palette.brand.maroonVelvet[500],
                })}
              >
                {header}
              </Typography>
              {hasRichText(text) && (
                <RichTextTypography
                  description={text}
                  level="body1"
                  sx={(theme) => ({
                    mt: '16px',
                    color: theme.palette.brand.maroonVelvet[500],
                    marginBottom: '24px',
                  })}
                />
              )}
              <Stack
                sx={{
                  width: 'fit-content',
                }}
              >
                {button.map((button) => (
                  <Button key={button._uid} blok={button} color={button.color} textColor={button.text_color} />
                ))}
              </Stack>
            </Stack>
          )}
          <Stack>
            <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true} sx={{ pt: 0 }}>
              <Stack
                direction="row"
                sx={{
                  width: 'fit-content',
                  minWidth: '100%',
                  gap: '8px',
                }}
              >
                {items.map((item) => (
                  <Stack
                    key={item._uid}
                    sx={{
                      flex: '0 0 auto',
                      width: desktop ? 600 : 270,
                    }}
                  >
                    {direction === 'horizontal' ? (
                      <HoverHorizontalCard blok={item} />
                    ) : (
                      <HoverVerticalCard blok={item} />
                    )}
                  </Stack>
                ))}
              </Stack>
            </ScrollWrapper>
          </Stack>
        </Stack>
      </DtStack>
    );
  }

  if (direction === 'vertical') {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="hover-listing" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            padding: desktop
              ? `40px 0 40px ${header === '' && !hasRichText(text) && button.length === 0 ? '32px' : '60px'}`
              : `32px`,
            backgroundColor: background,
            flexDirection: header_position === 'left' ? 'row' : 'column',
            alignItems: header_position === 'top_left' ? 'flex-start' : 'center',
          })}
        >
          {!noContent && (
            <Stack
              sx={{
                maxWidth: '33%',
                ...(header_position !== 'left' && {
                  mb: '8px',
                }),
                ...((header_position === 'top_center' || header_position === 'top_left') && {
                  alignItems: header_position === 'top_left' ? 'flex-start' : 'center',
                  maxWidth: '100%',
                }),
              }}
            >
              {header && (
                <Typography
                  level={header_level}
                  sx={(theme) => ({
                    color: header_color || theme.palette.brand.maroonVelvet[500],
                    marginBottom: '16px',
                  })}
                >
                  {header}
                </Typography>
              )}
              {hasRichText(text) && (
                <RichTextTypography
                  description={text}
                  level="body1"
                  sx={(theme) => ({
                    textAlign: header_position === 'top_center' ? 'center' : 'left',
                    color: theme.palette.brand.maroonVelvet[500],
                    marginBottom: '24px',
                    paddingRight: header_position === 'top_center' ? '60px' : '0',
                  })}
                />
              )}
              <Stack
                sx={{
                  width: 'fit-content',
                }}
              >
                {button.map((button) => (
                  <Button key={button._uid} blok={button} color={button.color} textColor={button.text_color} />
                ))}
              </Stack>
            </Stack>
          )}
          <Stack
            sx={(theme) => ({
              width: '100%',
              ml: noContent || header_position !== 'left' ? 0 : '60px',
              overflow: 'hidden',
              flex: 1,
            })}
          >
            <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
              <Stack
                direction="row"
                sx={{
                  width: 'fit-content',
                  minWidth: '100%',
                  gap: '24px',
                }}
              >
                {items.map((item) => (
                  <Stack
                    key={item._uid}
                    sx={{
                      flex: '0 0 auto',
                      width: 520,
                    }}
                  >
                    <HoverVerticalCard blok={item} hover_status={hover_status} />
                  </Stack>
                ))}
              </Stack>
            </ScrollWrapper>
          </Stack>
        </Stack>
      </DtStack>
    );
  }

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="hover-listing" uid={_uid} key={_uid}>
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: `40px 32px`,
          backgroundColor: background,
        })}
      >
        <Stack>
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              marginBottom: '16px',
            })}
          >
            {header}
          </Typography>
          {hasRichText(text) && (
            <RichTextTypography
              description={text}
              level="body2"
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                marginBottom: '24px',
              })}
            />
          )}
          {button.map((button) => (
            <Button key={button._uid} blok={button} color={button.color} textColor={button.text_color} />
          ))}
        </Stack>
        <Stack>
          <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
            <Stack
              direction="row"
              sx={{
                width: 'fit-content',
                minWidth: '100%',
                gap: '24px',
              }}
            >
              {items.map((item) => (
                <Stack
                  key={item._uid}
                  sx={{
                    flex: '0 0 auto',
                    width: 600,
                  }}
                >
                  <HoverHorizontalCard blok={item} />
                </Stack>
              ))}
            </Stack>
          </ScrollWrapper>
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { HoverListing, HoverListingProps };
