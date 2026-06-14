import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { svg } from '@cloudinary/url-gen/qualifiers/format';
import style from './style.scss';

const CardOne = ({ onSelect, isSelected, mainContent, className }) => (
  <div
    role="button"
    className={classNames(style.cardOne, className, {
      'is-selected': isSelected,
    })}
    onClick={onSelect}
  >
    <div className={`${style.cardOne}__content`}>{mainContent}</div>

    {/* <div className={`${style.cardOne}__check`}>{isSelected && <ReactSVG name="check-circle-fill" />}</div> */}
    <div className={`${style.cardOne}__check`}>
      {isSelected && (
        <svg>
          <path d="M9.475 17.075L4.5 12.125l.725-.725 4.25 4.25 9.15-9.15.725.725-9.875 9.85z" />
        </svg>
      )}
    </div>
  </div>
);

CardOne.propTypes = {
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  mainContent: PropTypes.element,
  className: PropTypes.string,
};

export default CardOne;
