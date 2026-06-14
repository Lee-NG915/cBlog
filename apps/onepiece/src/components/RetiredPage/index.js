import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getPageByUrl } from 'pages';
// import { Link } from 'react-router';
// import DYWrapper from 'components/DYWrapper';
import SubscriptionBanner from 'components/Subscription/Banner';
import Banner from 'components/CategoryBanner';
import { isBefore } from 'utils/time';

import { Container } from '@castlery/fortress';
import style from './style.scss';

const RetiredPage = (props, context) => {
  const page = getPageByUrl(context.router.location.pathname) || {};
  const DYWidget = 'LP Expired Campaign';
  const notReached = isBefore(page.publishedAt);
  const ref = useRef();
  useEffect(() => {
    if (ref.current.childElementCount) {
      ref.current.style.borderTop = '1px solid #e3e3e3';
    } else {
      ref.current.style.borderTop = 'none';
    }
  });

  return (
    <div className={style.retiredPage}>
      <Banner
        page={{
          ...page,
          title: page.name || page.title,
          ...(notReached && {
            description: '',
            imageWithText: '',
            imageWithTextResponsive: '',
            image: '',
            imageResponsive: '',
          }),
        }}
        retired
      />
      <Container fixed className={`${style.retiredPage}__body`}>
        <div
          className={`${style.retiredPage}__body-content`}
          dangerouslySetInnerHTML={{
            __html: notReached
              ? `Stay tuned for ${page.name || page.title}. <br />Start browsing & build your wishlist!`
              : 'This sale has ended!',
          }}
        />
      </Container>
      <Container fixed>
        <div className={`${style.retiredPage}__recommend`} ref={ref} data-campaign={DYWidget} />
        {/* <DYWrapper
          campaign={DYWidget}
          render={(selector) => (
            <div
              className={`${style.retiredPage}__recommend`}
              ref={ref}
              id={selector}
            />
          )}
        /> */}
      </Container>
      <Container disableGutters className={`${style.retiredPage}__subscription`}>
        <SubscriptionBanner />
      </Container>
    </div>
  );
};

RetiredPage.contextTypes = {
  router: PropTypes.object,
};

export default RetiredPage;
