import React from 'react';
import PropTypes from 'prop-types';

import Bem from 'utils/bem';

import style from './style.scss';

const SellingPoint = ({ className, points }) => {
  const block = new Bem(style.usp);

  return (
    <div className={block.mix(className)}>
      {points.map((sellPoint) => (
        <div key={sellPoint.title}>
          <img className={block.elm('icon')} src={sellPoint.icon} alt={sellPoint.title} />
          <div className={block.elm('content')}>
            <h4 className={block.elm('title')} dangerouslySetInnerHTML={{ __html: sellPoint.title }} />
          </div>
        </div>
      ))}
    </div>
  );
};

SellingPoint.propTypes = {
  className: PropTypes.string,
  points: PropTypes.array,
};

export default SellingPoint;
