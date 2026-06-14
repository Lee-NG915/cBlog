import React from 'react';
import PropTypes from 'prop-types';
import { GhostArrowBtn } from 'components/Button';
import variables from 'sass/_variables.scss';
import { BannerEqualDualBox } from 'components/DualBox';
import Banner from 'components/Banner';
import classNames from 'classnames';
import style from './style.scss';

const WorkshopBanner = ({ workshop }) => (
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
        loader: { ratio: 1.1029 },
      },
    ]}
    title="Workshop"
  />
);
WorkshopBanner.propTypes = {
  workshop: PropTypes.object,
};

const WorkshopText = ({ workshop, btnText, onClick }, { frame }) => {
  const { vendor_name: vendorName, id, name, description } = workshop || {};

  return (
    <>
      <div className={`${style.workshop}__label`}>{vendorName}</div>
      <div className={`${style.workshop}__title`}>{name}</div>
      <div className={`${style.workshop}__desc`}>{description}</div>
      <GhostArrowBtn
        className={`${style.workshop}__btn`}
        text={btnText || 'Sign Up Now'}
        hasArrow
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            frame.openModal('appointment', {
              confirmBtnText: 'Confirm Workshop',
              eventId: id,
              showCertainDay: true,
              successBtnText: 'Continue Exploring',
            });
          }
        }}
      />
    </>
  );
};
WorkshopText.propTypes = {
  workshop: PropTypes.object,
  btnText: PropTypes.string,
  onClick: PropTypes.func,
};
WorkshopText.contextTypes = {
  frame: PropTypes.object,
};

const Workshop = ({ workshop, border, rowReverse, btnText, onClick }) => (
  <BannerEqualDualBox
    containerClassName={classNames(`${style.workshop}__container`, {
      'is-even': rowReverse,
    })}
    leftClassName={`${style.workshop}__left`}
    leftBanner={<WorkshopBanner workshop={workshop} />}
    rightComponent={<WorkshopText workshop={workshop} onClick={onClick} btnText={btnText} />}
    rightClassName={`${style.workshop}__right`}
    borderColor={variables.lightNeutralColor}
    border={border}
    rowReverse={rowReverse}
  />
);
Workshop.propTypes = {
  workshop: PropTypes.object,
  border: PropTypes.bool,
  rowReverse: PropTypes.bool,
  btnText: PropTypes.string,
  onClick: PropTypes.func,
};

export default Workshop;
