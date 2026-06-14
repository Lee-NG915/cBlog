import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { renderImage } from 'utils/image';
import style from './style.scss';

export default function Promotion({ image, link }) {
  return (
    <div className={style.promotion}>
      <Link to={link}>{renderImage(image, null, 0.5, { alt: 'Promotion Image' })}</Link>
    </div>
  );
}

Promotion.propTypes = {
  image: PropTypes.string,
  link: PropTypes.string,
};
