'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { DtStack } from '@castlery/modules-tracking-components';
import { hasRichText } from '../../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../components';
import { ButtonProps } from './../button';
import { ImageProps } from './../image';
import { VideoProps } from './../video';

export type RowItemProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    sub_header?: string;
    description?: string;
    logo: {
      filename?: string;
    };
    icon?: {
      filename?: string;
      alt?: string;
    };
    header_color?: string;
    background_color?: string;
    extra_description?: string;
  };
  ratio?: number;
  needPadding?: boolean;
  inStoryblok?: boolean;
  sizes?: Array<string | number> | string;
};

function RowItem({ blok, ratio, needPadding, inStoryblok = true, sizes }: RowItemProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    header,
    sub_header,
    description,
    image = [],
    video = [],
    button = [],
    icon = {},
    header_color,
    background_color,
    logo,
    extra_description,
  } = blok || {};
  const { filename } = icon;

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      key={_uid}
      uid={_uid}
      componentName="row-item"
      direction="column"
      justifyContent="space-between"
      sx={(theme) => ({
        position: 'relative',
        height: '100%',
        width: needPadding ? '89vw' : '100%',
        padding: needPadding ? '0 28px' : 0,
        backgroundColor: background_color || theme.palette.brand.warmLinen[500],
      })}
    >
      <ImageOrVideo
        video={video}
        image={image}
        loader={{
          ratio: ratio || (!desktop ? 1 : 0.6223),
        }}
        sizes={sizes}
      />

      <Stack
        direction="column"
        sx={(theme) => ({
          flex: 1,
          alignItems: 'center',
          padding: desktop ? `${8 * 4}px ${6 * 4}px ${15 * 4}px ${6 * 4}px` : `${5 * 4}px 0 ${8 * 4}px 0`,
        })}
      >
        {logo?.filename && (
          <img
            src={logo.filename}
            alt={''}
            style={{ width: 200, height: 50, marginBottom: desktop ? '24px' : '20px' }}
          />
        )}
        {header && (
          <Typography
            level="h3"
            textAlign="center"
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              // fontFamily: `var(--fortress-fontFamily-body)`,
            })}
          >
            {header}
          </Typography>
        )}

        <Stack
          sx={(theme) => ({
            mt: desktop ? `${4 * 4}px` : `${2 * 4}px`,
            display: 'flex',
            flexDirection: 'row',
          })}
        >
          {filename && <img src={filename} alt={''} style={{ width: 24, height: 24 }} />}
          {hasRichText(sub_header) && (
            <RichTextTypography
              level="subh2"
              textAlign="center"
              description={sub_header}
              sx={(theme) => ({
                ml: `${2 * 4}px`,
                p: {
                  fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
                },
              })}
            />
          )}
        </Stack>

        {hasRichText(description) && (
          <RichTextTypography
            level="body1"
            textAlign="center"
            sx={(theme) => ({
              mt: desktop ? `${4 * 4}px` : `${2 * 4}px`,
            })}
            description={description}
          />
        )}

        {button?.length > 0 && (
          <Stack
            sx={(theme) => ({
              mt: desktop ? `${6 * 4}px` : `${5 * 4}px`,
            })}
          >
            {button.map((nestedBlok) => (
              <StoryblokServerComponent
                blok={nestedBlok}
                key={nestedBlok._uid}
                color={nestedBlok.color}
                textColor={nestedBlok.text_color}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </DtStack>
  );
}

export { RowItem };
