import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

const CardTwo = ({
  type,
  onSelect,
  isSelected,
  mainContent,
  bodyStyle,
  bodyClassName,
  titleContent,
  titleDirection,
  titleSelenium,
  className,
  disabled,
}) => (
  <div
    className={classNames(style.cardTwo, className, {
      'is-selected': isSelected,
      [`is-selected-${type}`]: isSelected,
      [`title-${titleDirection}`]: titleDirection,
    })}
  >
    {mainContent && (
      <div className={classNames(`${style.cardTwo}__content`, bodyClassName)} style={bodyStyle}>
        {mainContent}
      </div>
    )}

    <div
      role="button"
      className={classNames(`${style.cardTwo}__title ${style.cardTwo}__title-${titleDirection}`, {
        'is-disabled': disabled,
      })}
      style={{ border: !mainContent && 'none' }}
      data-selenium={titleSelenium}
      onClick={onSelect}
    >
      {titleContent}

      <div className={`${style.cardTwo}__title__check`}>{isSelected && <ReactSVG name="check-circle-fill" />}</div>
    </div>
  </div>
);

CardTwo.propTypes = {
  type: PropTypes.string,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  mainContent: PropTypes.element,
  titleContent: PropTypes.element,
  titleDirection: PropTypes.string,
  titleSelenium: PropTypes.string,
  className: PropTypes.string,
  bodyStyle: PropTypes.string,
  bodyClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

CardTwo.defaultProps = {
  titleDirection: 'bottom',
};

export default CardTwo;
