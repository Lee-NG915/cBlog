import React, { useEffect } from 'react';
import { wrapPage } from 'utils/page';
import PropTypes from 'prop-types';
import { initConfig, loadHC } from './utils';
import Faq from '../Faq';

import style from './style.scss';

const HelpCenter = () => {
  useEffect(() => {
    initConfig();
    loadHC();

    return () => {
      window.gladlyHCLoaded = false; // gladlyHCLoaded must be false HC can be reload！FAQ：in hcl.js
    };
  }, []);

  return (
    <div className={`${style.helpCenter}`}>
      <div className={`${style.helpCenter}-title`}>
        <h1> Help Center </h1>
      </div>
      <div id="gladly-help-center" />
    </div>
  );
};
HelpCenter.contextTypes = {
  router: PropTypes.object,
};
const HcPage = __GLADLY_ENABLED__ ? wrapPage({ page: { title: `Help Center` } })(HelpCenter) : Faq;
export default HcPage;
