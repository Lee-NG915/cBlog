import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { GhostArrowBtn } from 'components/Button';
import { DualBox } from 'components/DualBox';
import Banner from 'components/Banner';
import { isBefore } from 'utils/time';
import { Link } from 'react-router';
import classNames from 'classnames';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const StudioInfo = ({ url }) => {
  const { desktop } = useBreakpoints();
  return (
    <>
      <div className={`${style.studio}__label`}>VISIT US</div>
      <div className={`${style.studio}__name`}>Orchard Flagship</div>
      <div className={`${style.studio}__address`}>
        Liat Towers, 541 Orchard Road
        <br />
        #02/03-02, Singapore 238881
      </div>
      {desktop && (
        <>
          <div className={`${style.studio}__line`} />

          <div className={`${style.studio}__detail`}>
            <div>
              If you require lift access for prams & wheelchairs, head over to
              <br />
              Liat Towers Level 4 carpark and take the Fireman's Lift down to Level 2.
            </div>

            <div>
              Onsite parking is available in Liat Towers,
              <br />
              or nearby at Angullia Park Public Carpark.
            </div>

            <div>Public Transport: 7 mins walk from Orchard MRT.</div>
          </div>
        </>
      )}

      <Link className={`${style.studio}__link`} href={url} target="_blank" rel="noopener">
        {'How to get there >'}
      </Link>
    </>
  );
};
StudioInfo.propTypes = {
  url: PropTypes.string,
};

const Studio = () => {
  const stores = useSelector((state) => state.stores);
  const studios = stores?.data?.filter((s) => s.is_public);
  const { desktop } = useBreakpoints();
  const mapUrl = studios?.[0]?.url;
  // const showInfo = !isBefore('2023-03-23 00:00');
  const showInfo = true;

  const studioImage = [
    {
      breakpoint: 'xs',
      srcset:
        'https://res.cloudinary.com/castlery/image/upload/v1676874709/campaign_page/S1/Orchard_Flagship_Exclusive_Mobile.jpg',
      loader: { ratio: 0.7846 },
    },
    {
      breakpoint: 'lg',
      srcset:
        'https://res.cloudinary.com/castlery/image/upload/v1676874710/campaign_page/S1/Orchard_Flagship_Exclusive_Desktop.jpg',
      loader: { ratio: 1.0289 },
    },
  ];

  return (
    <div className={style.studio}>
      <DualBox
        leftComponent={
          <Banner className={`${style.story}__banner`} mediaQueries={studioImage} title="Orchard Flagship Exclusive" />
        }
        rightClassName={classNames(`${style.studio}__textBox`, {
          showInfo,
        })}
        rightComponent={
          showInfo ? (
            <StudioInfo url={mapUrl} />
          ) : (
            <>
              <div className={`${style.studio}__name`}>Orchard Flagship Exclusive</div>

              <div className={`${style.studio}__sale`}>
                {desktop ? (
                  <>
                    On Mar 25 & 26, enjoy an <b>extra $100 off</b> in the Refresh Storewide Sale - exclusively at
                    Orchard Flagship.*
                  </>
                ) : (
                  <>
                    Enjoy an <b>extra $100 off</b> in the Refresh Storewide Sale.
                  </>
                )}
              </div>

              <div className={`${style.studio}__promotion`}>
                <div>{desktop ? '$280 off with min. spend of $2,500' : '$280 off with $2,500 spent'}</div>
                <div>{desktop ? '$550 off with min. spend of $4,500' : '$550 off with $4,500 spent'}</div>
              </div>

              <div className={`${style.studio}__description`}>
                *Promo is valid with a min. purchase of at least 1 product from our latest collection. Exclusively at
                Orchard Flagship.
              </div>

              <GhostArrowBtn
                className={`${style.studio}__btn`}
                text="Locate us here"
                hasArrow
                href={mapUrl}
                target="_blank"
                rel="noopener"
              />
            </>
          )
        }
        whichIsTop="left"
      />
    </div>
  );
};

export default Studio;
