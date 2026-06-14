import React from 'react';
import { storyblokEditable } from '@storyblok/react';
import { Stack, Typography } from '@castlery/fortress';
import { Link } from 'react-router';
import { EVENT_IMAGE_HOVER, EVENT_HOVER_LISTING_CLICK } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import { useDevice } from 'utils/hooks';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ImageOrVideo } from '../components';

export type HoverListingProps = {
  blok: {
    _uid?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    link: {
      url?: string;
      target?: string;
    };
    header?: string;
    header_level?: 'h2' | 'h3';
    description?: string;
  };
};

const HoverListing = ({ blok }: HoverListingProps) => {
  const { desktop } = useBreakpoints();
  const { _uid, image = [], video = [], link, header, header_level, description } = blok || {};
  const { url, target = '_self' } = link || {};
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');
  const dispatch = useDispatch();

  const device = useDevice();
  let assetLink = '';
  const hasVideo = video.length > 0;
  const hasImage = image.length > 0;
  if (hasVideo) {
    assetLink = video[0][`${device}_url`];
  } else if (hasImage) {
    assetLink = image[0][`${device}_url`];
  }

  const trackClick = () => {
    if (url) {
      dispatch({
        type: EVENT_HOVER_LISTING_CLICK,
        result: {
          assetLink,
        },
      });
    }
  };

  const trackMouseEnter = () => {
    dispatch({
      type: EVENT_IMAGE_HOVER,
      result: {
        assetLink,
      },
    });
  };

  const listElement = (
    <>
      <Stack
        sx={() => ({
          position: 'relative',
          width: '100%',
          height: '100%',
        })}
      >
        <ImageOrVideo
          video={video}
          image={image}
          loader={{
            ratio: desktop ? 0.6982 : 1.2712,
          }}
        />
      </Stack>

      <Stack
        direction="column-reverse"
        justifyContent="space-between"
        sx={(theme) => ({
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pl: theme.spacing(4),
          pr: theme.spacing(2),
          py: theme.spacing(1),
          visibility: 'hidden',
          opacity: 0,
          transition: 'opacity 0.3s',
          background: 'linear-gradient(0deg, rgba(50, 52, 51, 0.7), rgba(50, 52, 51, 0.7))',
          [theme.breakpoints.down('sm')]: {
            px: theme.spacing(2),
            py: theme.spacing(3),
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '63%',
            background: 'linear-gradient(180deg, rgba(50, 52, 51, 0) 0%, rgba(50, 52, 51, 0.8) 50%)',
          },
        })}
      >
        {header && (
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: theme.palette.brand.flour[10],
              flex: 'none',
              order: 0,
              alignSelf: 'flex-end',
              flexGrow: 0,
              textAlign: 'right',
              whiteSpace: 'pre-line',
              [theme.breakpoints.down('sm')]: {
                alignSelf: 'stretch',
                textAlign: 'left',
              },
            })}
          >
            {header}
          </Typography>
        )}

        {description && (
          <Typography
            level={desktop ? 'body1' : 'caption2'}
            sx={(theme) => ({
              width: '82.79%',
              color: theme.palette.brand.flour[10],
              flex: 'none',
              order: 1,
              alignSelf: 'stretch',
              flexGrow: 0,
              pt: theme.spacing(10),
              whiteSpace: 'pre-line',
              [theme.breakpoints.down('sm')]: {
                width: '100%',
                pt: 0,
              },
            })}
          >
            {description}
          </Typography>
        )}
      </Stack>
    </>
  );

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={(theme) => ({
        position: 'relative',
        ':hover': {
          div: {
            visibility: 'visible',
            opacity: 1,
          },
        },
        ...(!desktop && {
          div: {
            visibility: 'visible',
            opacity: 1,
          },
        }),
      })}
      onClick={trackClick}
      onMouseEnter={trackMouseEnter}
    >
      {url ? (
        isExternalLink ? (
          <a href={url} target={target}>
            {listElement}
          </a>
        ) : (
          <Link to={url} target={target}>
            {listElement}
          </Link>
        )
      ) : (
        listElement
      )}
    </Stack>
  );
};

export { HoverListing };
