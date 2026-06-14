import React from 'react';
import PropTypes from 'prop-types';

import ReactSVG from 'components/ReactSVG';

const APP_STORE_URL = 'https://go.onelink.me/app/75e1402b';

const AppStore = ({ className, icon }) => (
  <a className={className} href={APP_STORE_URL} aria-label="App Store link">
    {icon}
  </a>
);

AppStore.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.element,
};

AppStore.defaultProps = {
  icon: <ReactSVG name="app-store-outline" />,
};

export default AppStore;
