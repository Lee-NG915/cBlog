import React from 'react';
import AppStore from 'components/AppStore';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import style from './style.scss';

const Badge = ({ title }) => (
  <div className={`${style.footer}__badges`}>
    {title && <div className={`${style.footer}__title`}>{title}</div>}
    <AppStore icon={<SvgIcon name="app-store-outline" />} />
  </div>
);

Badge.propTypes = {
  title: PropTypes.string,
};

export default Badge;
