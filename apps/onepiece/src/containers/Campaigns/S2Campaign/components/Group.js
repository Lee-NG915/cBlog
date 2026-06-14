import React from 'react';
import Banner from 'components/Banner';
import classnames from 'classnames';
import Video from 'components/Video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';
import Recommendation from './Recommendation';
import { groups } from '../config';

const Group = () => {
  const { desktop } = useBreakpoints();
  return groups.map((group) => {
    const {
      bannerMobileImage,
      bannerDesktopImage,
      backgroundVideo,
      title,
      titleMobileImage,
      titleDesktopImage,
      description,
      direction,
      recommendation,
    } = group;
    return (
      <div key={title} className={style.group}>
        <div
          className={classnames(`${style.group}__section`, {
            [`is-${direction}`]: direction,
          })}
        >
          <div className={`${style.group}__section__title`}>
            <Banner
              className={`${style.group}__section__title__head`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: titleMobileImage,
                },
                {
                  breakpoint: 'md',
                  srcset: titleDesktopImage,
                },
              ]}
              title={title}
            />
            <div className={`${style.group}__section__title__text`}>{description}</div>
          </div>

          <div className={`${style.group}__section__banner`}>
            <div className={`${style.group}__section__video`}>
              <Video
                id={backgroundVideo}
                videoRoot="https://res.cloudinary.com/castlery/video/upload"
                ratios={{
                  mobile: 1.6306,
                  desktop: 1.498,
                }}
                objectFit="cover"
                resolution={!desktop ? '720P' : '1080P'}
                showControls={false}
                loop
                muted
              />
            </div>

            <div className={`${style.group}__section__picture`}>
              <Banner
                mediaQueries={[
                  {
                    breakpoint: 'xs',
                    srcset: bannerMobileImage,
                    loader: {
                      ratio: 0.7841,
                    },
                  },
                  {
                    breakpoint: 'md',
                    srcset: bannerDesktopImage,
                    loader: {
                      ratio: 0.7804,
                    },
                  },
                ]}
                title={`${title} Banner`}
              />
            </div>
          </div>
        </div>

        <div className={`${style.group}__recommendation`}>
          <Recommendation recommendationName={recommendation} />
        </div>
      </div>
    );
  });
};

export default Group;
