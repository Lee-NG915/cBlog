import React from 'react';
import PropTypes from 'prop-types';
import Header from 'components/Careers/Header';
import Footer from 'components/Careers/Footer';
import Script from 'components/Script';
import Breadcrumbs from 'components/Breadcrumbs';
import { ThemeCompositionProvider } from 'theme/themeProvider';
import Helmet from 'react-helmet';
import { hostUrl } from 'config';
import { Container } from '@castlery/fortress';
import MainContent from './components/MainContent';

import style from './style.scss';

const intro = {
  title: 'Come Join Us !',
  desc: `Founded in Singapore in 2013, Castlery creates quality, beautiful furniture for real life—the kind that helps people shape spaces they can truly live in, grow in, and feel good coming home to.

Today, we bring our designs to homes across the Singapore, Australia, Canada, the UK, and the US; with showrooms in Singapore and Australia, and our New York showroom opening in May 2026. As a certified B Corp, we are building Castlery with the same ambition we bring to our designs: creating something better, more thoughtful, and made to last.

We’re growing quickly and looking for people who want to build something with real staying power. Around here, good ideas are heard, initiative goes far, and ambitious self-starters have room to make their mark.

If making an impact gets you out of bed in the morning, come join us.`,
};
const customBreadcrumbs = [
  {
    name: 'Home',
    customUrl: hostUrl,
  },
  {
    name: 'Careers',
    customUrl: `${hostUrl}/careers`,
  },
  {
    name: 'Job Description',
  },
];
const CareersEntry = ({ isDetail, appContext }) => {
  const title = isDetail ? 'Job Openings at Castlery' : 'Careers at Castlery';
  return (
    <ThemeCompositionProvider appContext={appContext}>
      <div className={`${style.careers} ${style.common}`}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content="Explore open job opportunities at Castlery." />
          <link rel="canonical" href={`${__HOST__}${isDetail ? '/careers-list' : '/careers'}`} />
        </Helmet>

        <Script
          src="https://boards.greenhouse.io/embed/job_board/js?for=castlery"
          position="body"
          strategy="beforeInteractive"
        />
        <Header />
        {isDetail && (
          <Breadcrumbs
            useLink={false}
            showHome={false}
            customBreadcrumbs={customBreadcrumbs}
            className={`${style.common}__breadcrumbs`}
          />
        )}
        <MainContent
          isDetail={isDetail}
          intro={intro}
          style={style}
          hostUrl={hostUrl}
          rightImageSrc="https://res.cloudinary.com/castlery/image/upload/v1646730332/static/careers/Castlery-IsabellaBehravan-10212021-00369.jpg"
        />

        <Footer />
      </div>
    </ThemeCompositionProvider>
  );
};

CareersEntry.propTypes = {
  isDetail: PropTypes.bool,
  appContext: PropTypes.object,
};

CareersEntry.defaultProps = {
  isDetail: false,
};

export default CareersEntry;
