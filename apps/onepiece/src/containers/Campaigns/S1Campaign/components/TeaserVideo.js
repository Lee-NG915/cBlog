import React from 'react';
import Video from 'components/Video';
import { OneDualBox } from 'components/DualBox';
import { useDevice } from 'utils/hooks';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInUS } from 'config';
import style from './style.scss';

const TeaserVideo = () => {
  const device = useDevice();
  const { desktop } = useBreakpoints();

  // for Mar 10th
  // const videoUrl = {
  //   mobile: 'v1678679807/S1%20Microsite%20Assets/Workshop%20%28Mar%2010%29/SGAU_Website_Teaser_-_HPB_Mobile',
  //   tablet: 'v1678679803/S1%20Microsite%20Assets/Workshop%20%28Mar%2010%29/SGAU_Website_Teaser_-_HPB_Tablet',
  //   desktop: 'v1678679822/S1%20Microsite%20Assets/Workshop%20%28Mar%2010%29/SGAU_Website_Teaser_-_HPB_Desktop',
  // };

  // for Mar 23rd
  const videoUrl = globalFeatureInUS
    ? {
        mobile:
          'v1679475655/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/US%20S1%20Launch%20Video/US_S1_Product_Launch_-_HPB_Mobile',
        tablet:
          'v1679475652/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/US%20S1%20Launch%20Video/US_S1_Product_Launch_-_HPB_Tablet',
        desktop:
          'v1679475654/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/US%20S1%20Launch%20Video/US_S1_Product_Launch_-_HPB_Desktop',
      }
    : {
        mobile:
          'v1679475671/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/SGAU%20S1%20Launch%20Video/SGAU_S1_Product_Launch_-_HPB_Mobile',
        tablet:
          'v1679475672/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/SGAU%20S1%20Launch%20Video/SGAU_S1_Product_Launch_-_HPB_Tablet',
        desktop:
          'v1679475669/S1%20Microsite%20Assets/Main%20Campaign%20%28Mar%2023%29/SGAU%20S1%20Launch%20Video/SGAU_S1_Product_Launch_-_HPB_Desktop',
      };

  const videoBanner = {
    video: videoUrl[device],
    ratios: {
      mobile: 1.2544,
      tablet: 0.651,
      desktop: 0.5208,
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
              alt: 'Come Home to a Getaway',
              setImagePreloaderOnServer: true,
              loader: videoBanner.loader,
            }}
            objectFit="cover"
            resolution={!desktop ? '720P' : '1080P'}
            showControls={false}
            loop
            muted
          />
        }
        rightClassName={`${style.video}__right`}
        rightComponent={
          <h1 className={`${style.video}__title`}>
            Come Home
            <br /> to a Getaway
          </h1>
        }
      />
    </div>
  );
};

export default TeaserVideo;
