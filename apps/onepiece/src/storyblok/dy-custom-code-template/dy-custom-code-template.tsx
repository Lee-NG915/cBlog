import React, { useCallback, useMemo, useRef } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { Stack } from '@castlery/fortress';
import { useAnchorScroll } from '../hooks/anchor';
import { useApiCampaigns } from 'hooks/dy';
import { useSelector } from 'react-redux';
import { useDevice } from 'utils/hooks';
import Banner from 'components/Banner';
import Video from 'components/Video';
import { Link } from 'react-router';
import { reportClickEngagement } from 'utils/dyReporting';

export type DYEmbedProps = {
  blok: {
    _uid?: string;
    selector_name: string;
    anchor_link?: string;
  };
};

const DYCustomCodeTemplate = ({ blok }: DYEmbedProps) => {
  const { _uid, selector_name, anchor_link } = blok;

  // useApiCampaigns({ selectorArray: [selector_name], shouldCheckIfNeedLoad: false });
  const dyHPBannerState = useSelector((state) => state.dyApiData.campaign?.[selector_name]);
  const bannerData = dyHPBannerState?.data || {};
  const device = useDevice();

  const getMediaQuery = useCallback(
    (breakpoint, src, ratio) => ({
      breakpoint,
      srcset: src,
      loader: { ratio },
    }),
    []
  );

  const imageBanner = useMemo(() => {
    if (!bannerData || bannerData.type !== 'image') return null;
    const mobileMediaQuery = getMediaQuery('xs', bannerData.mobile.src, bannerData.mobile.ratio);
    const tabletMediaQuery = getMediaQuery('md', bannerData.tablet.src, bannerData.tablet.ratio);
    const desktopMediaQuery = getMediaQuery('lg', bannerData.desktop.src, bannerData.desktop.ratio);
    const mediaQueries = [mobileMediaQuery, tabletMediaQuery, desktopMediaQuery].filter((query) => !!query);

    return {
      mediaQueries,
    };
  }, [bannerData, getMediaQuery]);

  const videoBanner = useMemo(() => {
    if (!bannerData || bannerData.type !== 'video') return null;
    const { thumbnail, mobile, desktop } = bannerData;
    return {
      video: device === 'desktop' ? desktop.video : mobile.video,
      thumbnail,
      ratios: {
        mobile: 1.25,
        tablet: 0.65,
        desktop: 0.52,
      },
      loader: {
        widths: device === 'desktop' ? [1280, 1440, 1920, 2880] : [700, 900, 1000, 1200, 1400],
        sizes: device === 'desktop' ? ['1440px-xxl', '1'] : ['1'],
      },
    };
  }, [bannerData, device]);

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const bannerDataBox = () => {
    const children = (
      <>
        {imageBanner && (
          <Banner
            mediaQueries={imageBanner.mediaQueries}
            title={bannerData.alt || 'Castlery Home Banner'}
            lazy={false}
            setImagePreloaderOnServer
          />
        )}
        {videoBanner && (
          <Video
            id={videoBanner.video}
            videoRoot="https://res.cloudinary.com/castlery/video/upload"
            ratios={videoBanner.ratios}
            thumbnail={{
              alt: bannerData.alt || 'Castlery Home Banner',
              setImagePreloaderOnServer: true,
              loader: videoBanner.loader,
            }}
            objectFit="cover"
            resolution={device === 'desktop' ? '1080P' : '720P'}
            showControls={false}
            loop
            muted
          />
        )}
      </>
    );
    return (
      <Link
        to={bannerData.link}
        onClick={() =>
          reportClickEngagement({
            decisionId: dyHPBannerState?.decisionId,
            variationId: dyHPBannerState?.variationId,
          })
        }
      >
        {children}
      </Link>
    );
  };

  if (bannerData) {
    return (
      <Stack {...storyblokEditable(blok)} key={_uid} ref={blokRef} id={anchor_link?.slice(1)}>
        {bannerDataBox()}
      </Stack>
    );
  }

  return null;
};

export { DYCustomCodeTemplate };
