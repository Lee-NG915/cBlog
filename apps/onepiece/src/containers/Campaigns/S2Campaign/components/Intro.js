import React from 'react';
import style from './style.scss';
import Group from './Group';

const Intro = () => (
  <div className={`${style.intro} container`}>
    <div className={`${style.intro}__title`}>
      Discover how you can Live True through mindfulness with wellness advocate, Jacyln. Whether it's finding that
      rhythm in life or being in the moment, we champion all ways of living true.
    </div>
    <div className={`${style.intro}__line`} />

    <Group />
  </div>
);

export default Intro;
