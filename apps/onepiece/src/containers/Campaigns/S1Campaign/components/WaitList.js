import React from 'react';
import { GhostArrowBtn } from 'components/Button';
import Banner from 'components/Banner';
import { isProd } from 'config';
import PropTypes from 'prop-types';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';
import Workshop from './Workshop';

const WaitList = ({ events }) => {
  const { desktop } = useBreakpoints();
  const handleClick = (id) => {
    window._klOnsite = window._klOnsite || [];
    // Tea
    if (Number(id) === 1) {
      window._klOnsite.push(['openForm', isProd ? 'XqAafc' : 'WiWPRw']);
    }
    // KonMari
    else {
      window._klOnsite.push(['openForm', isProd ? 'SPkNZH' : 'T8bkwM']);
    }
  };

  return (
    <div className={`${style.waitList}`}>
      <div className={`${style.waitList}__wrapper`}>
        <div className={`${style.waitList}__title`}>Wellness Weekend{!desktop && <br />} at Orchard Flagship</div>
        <div className={`${style.waitList}__line`} />
        <div className={`${style.waitList}__description`}>
          Stay present in the moment through a series of curated workshops, happening March 25 & 26.
        </div>
      </div>

      {desktop ? (
        <div className={`${style.waitList}__events`}>
          {events?.map((workshop, index) => (
            <div className={`${style.waitList}__event`} key={index}>
              <Banner
                mediaQueries={[
                  {
                    breakpoint: 'xs',
                    srcset: workshop.image_small,
                    loader: { ratio: 0.9026 },
                  },
                  {
                    breakpoint: 'lg',
                    srcset: workshop.image_large,
                    loader: { ratio: 0.6152 },
                  },
                ]}
                title="Workshop"
              />

              <div className={`${style.waitList}__event__label`}>{workshop.vendor_name}</div>
              <div className={`${style.waitList}__event__title`}>{workshop.name}</div>
              <div className={`${style.waitList}__event__desc`}>{workshop.description}</div>

              <GhostArrowBtn
                className={`${style.waitList}__event__btn`}
                text="Join Waitlist"
                hasArrow
                onClick={() => handleClick(workshop.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        events?.map((workshop, index) => (
          <Workshop
            workshop={workshop}
            key={index}
            rowReverse={index % 2 === 1}
            btnText="Join Waitlist"
            onClick={() => handleClick(workshop.id)}
          />
        ))
      )}
    </div>
  );
};
WaitList.propTypes = {
  events: PropTypes.array,
};

export default WaitList;
