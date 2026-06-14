import React from 'react';
import { Typography, Stack, Box } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import ReactPicture from 'components/ReactPicture';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';

export type RowItemProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    sub_header?: string;
    description?: string;
    icon?: {
      filename?: string;
      alt?: string;
    };
  };
  ratio?: number;
};

function RowItem({ blok, ratio }: RowItemProps) {
  const { desktop } = useBreakpoints();
  const { _uid, header, sub_header, description, image = [], video = [], button = [], icon = {} } = blok || {};
  const { filename, alt } = icon;

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      direction="column"
      justifyContent="space-between"
      sx={(theme) => ({
        position: 'relative',
        height: '100%',
        width: '100%',
      })}
    >
      <ImageOrVideo
        video={video}
        image={image}
        loader={{
          ratio: ratio || (!desktop ? 1 : 0.6223),
        }}
      />

      <Stack
        direction="column"
        sx={(theme) => ({
          flex: 1,
          alignItems: 'center',
          px: theme.spacing(6),
          py: theme.spacing(6),
          [theme.breakpoints.down('sm')]: {
            px: theme.spacing(2),
            py: theme.spacing(2),
          },
        })}
      >
        {header && (
          <Typography level="h2" textAlign="center" sx={(theme) => ({})}>
            {header}
          </Typography>
        )}

        <Stack
          sx={(theme) => ({
            mt: theme.spacing(2),
            [theme.breakpoints.down('sm')]: {
              mt: theme.spacing(1),
            },
          })}
        >
          {hasRichText(sub_header) && (
            <RichTextTypography
              level={!desktop ? 'subh2' : 'body1'}
              textAlign="center"
              description={sub_header}
              prefix={
                filename && (
                  <Box
                    sx={(theme) => ({
                      width: '24px',
                      height: 'auto',
                      display: 'inline-block',
                      mr: theme.spacing(1),
                      '> div': {
                        position: 'relative',
                        top: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                    })}
                  >
                    <ReactPicture
                      srcset={filename}
                      alt={alt}
                      loader={{
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )
              }
            />
          )}
        </Stack>

        {hasRichText(description) && (
          <RichTextTypography
            level="body2"
            textAlign="center"
            sx={(theme) => ({
              mt: theme.spacing(2),
              [theme.breakpoints.down('sm')]: {
                mt: theme.spacing(1),
              },
            })}
            description={description}
          />
        )}

        {button?.length > 0 && (
          <Stack
            sx={(theme) => ({
              mt: theme.spacing(4),
              [theme.breakpoints.down('sm')]: {
                mt: theme.spacing(3),
              },
            })}
          >
            {button.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export { RowItem };
