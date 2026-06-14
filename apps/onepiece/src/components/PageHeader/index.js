import React from 'react';
import PropTypes from 'prop-types';
import Banner from 'components/Banner';
import style from './style.scss';

const PageHeader = ({ mainTitle, mainIntro, subTitle, subIntro, ...props }) => (
  <>
    <Banner {...props}>
      <div className={`${style.pageHeader}__main`}>
        <h1 dangerouslySetInnerHTML={{ __html: mainTitle }} />
        {mainIntro && (
          <div className={`${style.pageHeader}__main__intro`} dangerouslySetInnerHTML={{ __html: mainIntro }} />
        )}
      </div>
    </Banner>

    {subTitle && (
      <div className={`${style.pageHeader}__sub`}>
        <h2>{subTitle}</h2>
        {subIntro && (
          <div className={`${style.pageHeader}__sub__intro`} dangerouslySetInnerHTML={{ __html: subIntro }} />
        )}
      </div>
    )}
  </>
);

PageHeader.propTypes = {
  mainTitle: PropTypes.string,
  mainIntro: PropTypes.string,
  subTitle: PropTypes.string,
  subIntro: PropTypes.string,
};

export default PageHeader;
