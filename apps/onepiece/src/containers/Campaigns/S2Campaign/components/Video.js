import React from 'react';
import Video from 'components/Video';
import { OneDualBox } from 'components/DualBox';
import { useDevice } from 'utils/hooks';
import style from './style.scss';

const TeaserVideo = () => {
  const device = useDevice();
  const desktop = device === 'desktop';
  const videoUrl = {
    mobile:
      'v1683527659/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/HD_4-5_60s_Castlery_Jac_sub',
    tablet:
      'v1683527811/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/HD_9-16_60s_Castlery_Jac_sub',
    desktop:
      'v1683470482/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/HD_16-9_60s_Castlery_Jac_sub',
  };

  const videoBanner = {
    video: videoUrl[device],
    ratios: {
      mobile: 1.2544,
      tablet: 1.7777,
      desktop: 0.5625,
    },
    loader: {
      widths: desktop ? [1280, 1440, 1920, 2880] : [700, 900, 1000, 1200, 1400],
      sizes: desktop ? ['1440px-xxl', '1'] : ['1'],
    },
  };

  return (
    <div className={`${style.video}`}>
      <OneDualBox
        leftComponent={
          <Video
            id={videoBanner.video}
            videoRoot="https://res.cloudinary.com/castlery/video/upload"
            ratios={videoBanner.ratios}
            thumbnail={{
              alt: 'Live True Through Mindfulness',
              setImagePreloaderOnServer: true,
              loader: videoBanner.loader,
            }}
            objectFit="cover"
            resolution={!desktop ? '720P' : '1080P'}
            controls
            allowUnmute
            hideClose
            clickOverlayEvent="play"
            loop
            muted
            qAuto={desktop ? 'best' : ''}
          />
        }
        rightClassName={`${style.video}__right`}
        rightComponent={<h1 className={`${style.video}__title`}>Live True Through Mindfulness</h1>}
      />
    </div>
  );
};

export default TeaserVideo;
