import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Breadcrumbs from 'components/Breadcrumbs';
import Header from 'components/Careers/Header';
import Footer from 'components/Careers/Footer';
import Script from 'components/Script';
import PositionContents from 'components/Careers/Graduate/PositionContents';
import { ThemeCompositionProvider } from 'theme/themeProvider';
import { Container } from '@castlery/fortress';
import ReactPicture from 'components/ReactPicture';
import { intro, customBreadcrumbs, bannerDescription, baseImgUrl } from './data';
import MainContent from './components/MainContents';

import style from '../style.scss';

const GraduateEntry = ({ isDetail, appContext }) => (
  <ThemeCompositionProvider appContext={appContext}>
    <div className={`${style.graduate} ${style.common}`}>
      <Helmet>
        <title>Graduate Program at Castlery</title>
        {/* <link rel="canonical" href={`${__HOST__}/careers/graduate-programme`} /> */}
      </Helmet>

      {/* {__OPEN_GRADUATE_APPLICATION__ && (
        <Script src={__GRADUATE_PROGRAM_GREENHOUSE__} position="body" strategy="beforeInteractive" />
      )} */}

      <Header />
      <Breadcrumbs
        useLink={false}
        showHome={false}
        customBreadcrumbs={customBreadcrumbs}
        className={`${style.common}__breadcrumbs`}
      />
      <MainContent
        isDetail={isDetail}
        intro={intro}
        style={style}
        rightImageSrc={`${baseImgUrl}/v1678248112/static/careers/graduate-new.png`}
      />
      {/* <div className={`${style.graduate}__banner`}>
        <p>{bannerDescription}</p>
      </div> */}
      <ReactPicture
        srcset={`${baseImgUrl}/v1710236805/static/careers/banner-new.png`}
        loader={{
          width: '100%',
        }}
        lazy={false}
      />

      <Container>
        <PositionContents />

        {/* {__OPEN_GRADUATE_APPLICATION__ && (
          <div id="grnhse_app" style={{ minHeight: isDetail ? '800px' : '400px', backgroundColor: 'red' }} />
        )} */}
      </Container>

      <Footer />
    </div>
  </ThemeCompositionProvider>
);

GraduateEntry.propTypes = {
  isDetail: PropTypes.bool,
  appContext: PropTypes.object,
};

GraduateEntry.defaultProps = {
  isDetail: false,
};

export default GraduateEntry;
