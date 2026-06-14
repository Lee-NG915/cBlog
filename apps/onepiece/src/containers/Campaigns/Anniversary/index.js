import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import style from './style.scss';

const Anniversary = (props, { frame }) => {
  const { desktop } = useBreakpoints();
  return (
    <div>
      <Banner
        mediaQueries={[
          {
            breakpoint: 'xs',
            srcset: '/v1540268663/marketing/SG/201810/anniversary_banner_mobile.jpg',
            loader: { ratio: 0.6 },
          },
          {
            breakpoint: 'lg',
            srcset: '/v1540268664/marketing/SG/201810/anniversary_banner_desktop.jpg',
            loader: { ratio: 0.41 },
          },
        ]}
        lazy={false}
        title="5th Anniversary"
      />

      <Container fixed>
        <div className={style.intro}>
          <h1>Join Our 5th Anniversary Party!</h1>
          <p>
            This weekend, stand to win from <strong>14 massive mystery prizes</strong> in our{' '}
            <strong>Anniversary Lucky Draw</strong>! Plus, enjoy refreshing sweet treats as you shop our ongoing
            Anniversary promotions.
          </p>
          <hr />
          <p>27 & 28 October, 10am - 6pm</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              frame.openModal('appointment', {
                skipIntro: true,
                date: '2018-10-27',
                days: 2,
                studioBtnText: 'RSVP Now',
                studioBtnStyle: 'btn-primary',
                confirmBtnText: 'Submit',
                confirmBtnStyle: 'btn-primary',
                eventId: { 'Jit Poh Studio': 4, 'The Grandstand Studio': 5 },
                pixelName: 'Anniversary2018',
                eventLabel: 'Anniversary2018',
                showTerms: true,
              })
            }
          >
            RSVP Now
          </button>
          <p>
            P.S. This is a registration-only event!
            <br />
            Please present QR code upon arrival.
          </p>
        </div>

        <div className={style.studios}>
          <div className={`${style.studios}__item`}>
            <ReactPicture
              srcset={`${cloudinaryRoot}/v1540279380/marketing/SG/201810/jit-poh.jpg`}
              alt="Jit Poh Studio"
              loader={{
                ratio: !desktop ? 0.8 : 0.6,
              }}
            />
            <h3>Jit Poh</h3>
            <p>19 Keppel Road, #02-06, Jit Poh Building</p>
            <a href="https://bit.ly/2PUGUu8" target="_blank" rel="noopener">
              How to get there >
            </a>
          </div>
          <div className={`${style.studios}__item`}>
            <ReactPicture
              srcset={`${cloudinaryRoot}${
                !desktop
                  ? '/v1540283333/marketing/SG/201810/grandstand-mobile.jpg'
                  : '/v1540279380/marketing/SG/201810/grandstand.jpg'
              }`}
              alt="The Grandstand"
              loader={{
                ratio: !desktop ? 0.8 : 0.6,
              }}
            />
            <h3>The Grandstand</h3>
            <p>200 Turf Club Road, #03-07, The Grandstand</p>
            <a href="https://bit.ly/2q701py" target="_blank" rel="noopener">
              How to get there >
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

Anniversary.contextTypes = {
  frame: PropTypes.object,
};

export default wrapPage()(Anniversary);
