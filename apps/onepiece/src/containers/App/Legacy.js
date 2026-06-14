import React from 'react';
import Logo from 'components/Logo';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

import chrome from './images/chrome.png';
import firefox from './images/firefox.png';
import edge from './images/edge.png';
import safari from './images/safari.png';

const Legacy = () => {
  const { desktop } = useBreakpoints();
  return (
    <div className={style.legacy}>
      <div className={`${style.legacy}__container`}>
        <Logo />
        <h1>Sorry, your browser is not supported.</h1>
        <p>
          Our site can only be viewed using a modern browser.
          {desktop ? <br /> : ' '}
          Please upgrade to latest version of one of the browsers below
        </p>
        {desktop && (
          <div className={`${style.legacy}__browsers`}>
            <div className={`${style.legacy}__browsers__cell`}>
              <img src={chrome} alt="Chrome" />
              <p>Google Chrome</p>
            </div>
            <div className={`${style.legacy}__browsers__cell`}>
              <img src={firefox} alt="Firefox" />
              <p>Firefox</p>
            </div>
            <div className={`${style.legacy}__browsers__cell`}>
              <img src={edge} alt="Edge" />
              <p>Microsoft Edge</p>
            </div>
            <div className={`${style.legacy}__browsers__cell`}>
              <img src={safari} alt="Safari" />
              <p>Safari</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legacy;
