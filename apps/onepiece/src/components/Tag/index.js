import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';

import style from './style.scss';

const Tag = ({ tags, className, type = 'old', size = 'normal', showCustomized }) => {
  const block = new Bem(type === 'old' ? style.tag : style.newTag, size === 'small' ? ' small' : '').mix(className);

  if (!(Array.isArray(tags) && tags.length > 0)) {
    return null;
  }

  return <sup className={block.mod('sale')}>{tags[0]}</sup>;
};

Tag.propTypes = {
  tags: PropTypes.array,
  type: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  showCustomized: PropTypes.bool,
};

Tag.defaultProps = {
  tags: [],
};

export default Tag;
