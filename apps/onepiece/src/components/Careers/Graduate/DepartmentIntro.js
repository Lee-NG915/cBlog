import React from 'react';
import PropTypes from 'prop-types';

import { ArrowBtn } from 'components/Button';

import style from './style.scss';

const DepartmentIntro = ({ description, url }) => (
  <div className={`${style.positionApply}`}>
    <div className={`${style.positionApply}__intro`}>
      <p>{description}</p>
    </div>
    <ArrowBtn
      text="Apply Now"
      width="100%"
      bgColor="white"
      color="light-accent"
      className={`${style.positionApply}__applybtn`}
      hoverStyle={{
        backgroundColor: 'primary',
      }}
      href={url || '#grnhse_app'}
      disabled={!__OPEN_GRADUATE_APPLICATION__}
    />
  </div>
);
DepartmentIntro.propTypes = {
  description: PropTypes.string,
  url: PropTypes.string,
};
export default DepartmentIntro;
