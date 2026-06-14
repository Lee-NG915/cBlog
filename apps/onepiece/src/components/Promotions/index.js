import React from 'react';
import PropTypes from 'prop-types';
import { isOutdated } from 'utils/time';
import { Container } from '@castlery/fortress';
import style from './style.scss';
import { PROMOTIONS } from './config';

const Promotions = ({ className, fromRSVP }) => {
  const isValid = !isOutdated(PROMOTIONS.startDate, PROMOTIONS.endDate);
  const promotions = PROMOTIONS.data;

  if (!isValid) {
    return null;
  }

  let startDate;
  if (fromRSVP) {
    startDate = '2019-10-25 12:00';
  }

  return (
    <Container className={`${style.promotions} ${className}`}>
      {promotions.map((promotion, index) => {
        const { furtherPromotion } = promotion;
        const realPromotion =
          furtherPromotion && !isOutdated(startDate || furtherPromotion.startDate, furtherPromotion.endDate)
            ? furtherPromotion
            : promotion;
        return (
          <div
            className={`${style.promotions}__item ${realPromotion.img ? `${style.promotions}__item--further` : ''}`}
            key={index}
          >
            <div className={`${style.promotions}__item__content`}>
              <div className={`${style.promotions}__item__content__header`}>
                {realPromotion.img ? <img src={realPromotion.img} alt={realPromotion.title} /> : null}
                <span className={`${style.promotions}__item__content__title`}>{realPromotion.title}</span>
              </div>
              <div className={`${style.promotions}__item__content__body`}>{realPromotion.body}</div>
            </div>
          </div>
        );
      })}
    </Container>
  );
};

Promotions.propTypes = {
  className: PropTypes.string,
  fromRSVP: PropTypes.bool,
};

export default Promotions;
