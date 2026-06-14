import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import style from './style.scss';

const Intro = ({ type, description }) => {
  const block = new Bem(style.intro).mix(type);

  return (
    <div className={block}>
      <div className={block.elm('title')}>
        After a long day of chasing your aspirations, what better way to seek respite and restfulness than in your own
        sanctuary?
      </div>
      <div className={block.elm('line')} />
      <div className={block.elm('description')}>
        {description || (
          <>
            <div>Get set to embrace moments of rejuvenation within your home.</div>
            <div className={block.elm('description').elm('line')}>
              Our new collection launches <b>March 23</b>.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
Intro.propTypes = {
  type: PropTypes.string,
  description: PropTypes.node,
};

export default Intro;
