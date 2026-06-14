import React from 'react';
import Banner from 'components/Banner';
import { GhostArrowBtn } from 'components/Button';
import style from './style.scss';

const Studio = () => {
  const studioImage = [
    {
      breakpoint: 'xs',
      srcset:
        '/v1682236510/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Orchard_Flagship_Mobile.jpg',
      loader: { ratio: 1.0384 },
    },
    {
      breakpoint: 'lg',
      srcset:
        '/v1682236510/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Orchard_Flagship_Desktop.jpg',
      loader: { ratio: 0.4314 },
    },
  ];

  return (
    <div className={style.studio}>
      <Banner className={`${style.studio}__banner`} mediaQueries={studioImage} title="Castlery Orchard Flagship">
        <div className={`${style.studio}__text`}>
          <Banner
            className={`${style.studio}__head`}
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset:
                  '/v1682218420/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Visit_Us_Mobile.png',
              },
              {
                breakpoint: 'md',
                srcset:
                  '/v1683697263/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Visit_Us.png',
              },
            ]}
            title="Visit Us"
          />
          <div className={`${style.studio}__title`}>Castlery Orchard Flagship</div>

          <div className={`${style.studio}__address`}>
            Liat Towers, 541 Orchard Road
            <br />
            #02/03-02, Singapore 238881
          </div>

          <GhostArrowBtn
            className={`${style.studio}__btn`}
            text="How To Get There"
            hasArrow
            href="https://g.page/Castlery-JP?share"
            target="_blank"
            rel="noopener"
          />
        </div>
      </Banner>
    </div>
  );
};

export default Studio;
