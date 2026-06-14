import React from 'react';
import { storyblokEditable, renderRichText } from '@storyblok/react';
import { Stack } from '@castlery/fortress';
import { Link } from 'react-router';
import { EVENT_UGC_LISTING_CLICK } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import { hasRichText } from '../tool';
import { RichTextTypography, ImageOrVideo } from '../components';

export type UGCListingProps = {
  blok: {
    _uid?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    link: {
      url?: string;
      target?: string;
    };
    creator_handle?: object;
    creatorHandle?: object;
  };
};

const UGCListing = ({ blok }: UGCListingProps) => {
  const { _uid, image = [], video = [], link, creator_handle, creatorHandle } = blok || {};
  const { url, target = '_self' } = link || {};
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');
  const dispatch = useDispatch();

  const trackClick = () => {
    if (url) {
      dispatch({
        type: EVENT_UGC_LISTING_CLICK,
        result: {
          creatorHandle: creator_handle || creatorHandle ? renderRichText(creator_handle || creatorHandle) : '',
          link: url,
        },
      });
    }
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
            ratio: 1,
          }}
        />
      </Stack>

      {hasRichText(creator_handle || creatorHandle) && (
        <RichTextTypography
          level="caption2"
          sx={(theme) => ({
            color: theme.palette.common.white,
            background: 'rgba(50, 52, 51, 0.7)',
            boxShadow: '0px 1px 3px rgba(50, 52, 51, 0.2)',
            position: 'absolute',
            left: theme.spacing(1),
            mr: theme.spacing(1),
            bottom: theme.spacing(1),
            zIndex: 1,
            px: theme.spacing(0.5),
            whiteSpace: 'pre-line',
            maxWidth: `calc(100% - ${theme.spacing(2)})`,
            overflow: 'hidden',
          })}
          description={creator_handle || creatorHandle}
        />
      )}
    </>
  );

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={{
        position: 'relative',
      }}
      onClick={trackClick}
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

export { UGCListing };
