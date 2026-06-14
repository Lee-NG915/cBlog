import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import { useDispatch } from 'react-redux';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import styles from './styles.scss';

const PrevButton = ({
  currentSlide,
  slideCount,
  isUsedInPDP = false,
  onClick,
  trackClick,
  fixedWidthChange,
  ...rest
}) => {
  if (rest.style && fixedWidthChange) {
    rest.style.left = 'auto';
  }
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  if (!isUsedInPDP)
    return (
      <button
        type="button"
        data-selenium="slick_left_arrow"
        onClick={() => {
          onClick();
          if (trackClick) trackClick(dispatch);
        }}
        {...rest}
      >
        <SvgIcon name="line-left-arrow" hoverColor="primary" />
      </button>
    );
  return (
    <>
      {desktop ? (
        <button
          type="button"
          data-selenium="slick_left_arrow"
          onClick={() => {
            onClick();
            if (trackClick) trackClick(dispatch);
          }}
          {...rest}
        >
          <div className={styles.container}>
            <SvgIcon name="line-left-arrow" hoverColor="primary" />
          </div>
        </button>
      ) : null}
    </>
  );
};

PrevButton.propTypes = {
  currentSlide: PropTypes.any,
  slideCount: PropTypes.any,
  isUsedInPDP: PropTypes.bool,
  onClick: PropTypes.func,
  trackClick: PropTypes.func,
  rest: PropTypes.array,
};

const NextButton = ({
  currentSlide,
  slideCount,
  isUsedInPDP = false,
  onClick,
  trackClick,
  fixedWidthChange,
  ...rest
}) => {
  if (rest.style && fixedWidthChange) {
    rest.style.right = '20px';
  }
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  if (!isUsedInPDP)
    return (
      <button
        type="button"
        data-selenium="slick_right_arrow"
        onClick={() => {
          onClick();
          if (trackClick) trackClick(dispatch);
        }}
        {...rest}
      >
        <SvgIcon name="line-right-arrow" hoverColor="primary" />
      </button>
    );
  return (
    <>
      {desktop ? (
        <button
          type="button"
          data-selenium="slick_right_arrow"
          onClick={() => {
            onClick();
            if (trackClick) trackClick(dispatch);
          }}
          {...rest}
        >
          <div className={styles.container}>
            <SvgIcon name="line-right-arrow" hoverColor="primary" />
          </div>
        </button>
      ) : null}
    </>
  );
};

NextButton.propTypes = {
  currentSlide: PropTypes.any,
  slideCount: PropTypes.any,
  isUsedInPDP: PropTypes.bool,
  onClick: PropTypes.func,
  trackClick: PropTypes.func,
  rest: PropTypes.array,
};

const PrevBtn = PrevButton;
const NextBtn = NextButton;

export { PrevBtn, NextBtn };
