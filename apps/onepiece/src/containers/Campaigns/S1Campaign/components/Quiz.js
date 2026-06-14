import React, { useEffect } from 'react';
import style from './style.scss';

const Quiz = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://paperform.co/__embed.min.js';
    document.body.appendChild(script);
  }, []);

  return (
    <div className={style.quiz}>
      <div data-paperform-id={__PAPERFORM_ID__} data-spinner={1} data-height="100%" className={`${style.quiz}__form`} />
    </div>
  );
};

export default Quiz;
