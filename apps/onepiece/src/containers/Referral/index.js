import React, { useEffect } from 'react';
import YotpoScript from 'components/Yotpo';
import { wrapPage } from 'utils/page';
import PropTypes from 'prop-types';
import { Container } from '@castlery/fortress';
import style from './style.scss';

function Referral(props, { frame, router }) {
  useEffect(() => {
    const { query } = router.location;
    if (query?.open === 'cart') {
      frame.openModal('cart', { loadCart: true });
      const currentURL = window.location.href;
      const newURL = currentURL.substring(0, currentURL.indexOf('?'));
      window.history.pushState({ path: newURL }, '', newURL);
    }
  }, [router, frame]);

  if (__FRIENDBUY_ENABLED__) {
    return (
      <Container>
        <div id="friendbuylanding" className={style.referral} />
      </Container>
    );
  }
  if (__YOTPO_ENABLED__) {
    return (
      <Container className={`${style.referral}`}>
        <YotpoScript />
        <div className="yotpo-widget-instance" data-yotpo-instance-id={__YOTPO_REFERRAL_ID__} />
      </Container>
    );
  }
  return null;
}
Referral.contextTypes = {
  router: PropTypes.object,
  frame: PropTypes.object,
};
export default wrapPage()(Referral);
