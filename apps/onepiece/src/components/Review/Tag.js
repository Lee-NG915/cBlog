import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';

import style from './style.scss';

const Tag = ({ className }) => {
  const block = new Bem(style.tag).mix(className);

  return <div className={block}>Top Review</div>;
};

Tag.propTypes = {
  className: PropTypes.string,
};

export default Tag;
