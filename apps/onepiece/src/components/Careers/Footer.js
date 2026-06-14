import React from 'react';
import style from './style.scss';

export default () => (
  <footer className={`${style.footer}`}>
    <span>Powered by</span>{' '}
    <a target="_blank" href="http://www.greenhouse.io/">
      <img
        border="0"
        alt="Greenhouse Logo"
        style={{ width: '100px', height: '30px' }}
        src="https://boards.cdn.greenhouse.io/assets/greenhouse-in-app-logo-green-236d994ee39682bb46e214901c264de0df582c97e949e7c854c3531b79f00240.svg"
        width="100"
        height="30"
      />
    </a>
    <div className="privacy-policy">
      Read our <a href="http://www.greenhouse.io/privacy-policy">Privacy Policy</a>
    </div>
  </footer>
);
