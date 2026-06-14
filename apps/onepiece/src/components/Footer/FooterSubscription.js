import React from 'react';
import { useFrame } from 'hooks/frame';
import PropTypes from 'prop-types';

import { isOutdated } from 'utils/time';

import { postSubscriptions } from 'api/product';
import { setSubscribed } from 'utils/cookies';
import { hideSubscriptionBar } from 'redux/modules/subscriptionBar';
import { useDispatch, useSelector } from 'react-redux';
import { randomId } from 'utils/number';
import { trackSubscription } from 'utils/tracking';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import { globalFeatureInUS } from 'config';
import lang from 'utils/lang';
import { FooterSubscriptionUI } from './FooterSubscriptionUI';

const FooterSubscription = ({ footerPalette = {} }) => {
  const frame = useFrame();
  const givewaySaleStartDate = globalFeatureInUS ? '2023-02-09 00:00' : '2023-02-13 00:00';
  const givewaySaleEndDate = '2023-04-04 00:00';
  const isGivewayOutdated = isOutdated(givewaySaleStartDate, givewaySaleEndDate);
  const placeholder = 'Enter your email';
  const ctaText = isGivewayOutdated ? 'Submit' : 'Get Lucky here';
  const givewayVoucher = '2,000';

  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const [data, setData] = React.useState({
    email: '',
    status: 'initial',
  });
  const [error, setError] = React.useState('');

  const handleSubmit = async (
    event
    // : React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setData((current) => ({ ...current, status: 'loading' }));
    try {
      const { email } = data;
      await postSubscriptions({ email, source: 'FOOTER' });
      setData({ email: '', status: 'sent' });
      frame?.openModal('response', {
        status: 'successful',
        title: 'Thank You!',
        body: 'You have successfully subscribed to the newsletter.',
      });

      // set cookie to avoid future popup
      // setCookie('has_subscribed', JSON.stringify(true), 365);
      setSubscribed();

      if (hideSubscriptionBar) {
        dispatch(
          hideSubscriptionBar({
            showOnProductPage: false,
            showOnHomePage: false,
          })
        );
      }
      const eventId = randomId('NewsletterSubscription');
      /* record signup newsletter event */
      trackSubscription(email, { eventId });

      dispatch({
        type: EVENT_FORM_SUBMIT,
        result: {
          action: 'Newsletter Sign-up',
          label: user?.id,
          eventId,
          method: email,
        },
      });
    } catch (err) {
      setError(err?.errors?.[0]?.detail || 'Oops! something went wrong, please try again later.');
      setData((current) => ({ ...current, status: 'failure' }));
    }
  };
  return (
    <FooterSubscriptionUI
      handleSubmit={handleSubmit}
      error={error}
      data={data}
      setData={setData}
      footerPalette={footerPalette}
      placeholder={placeholder}
      ctaText={ctaText}
      formLabel={
        isGivewayOutdated
          ? ` Enjoy ${lang.t('common.currency_symbol')}50 off your first order.`
          : `Win a ${lang.t('common.currency_symbol')} ${givewayVoucher} voucher!*`
      }
    />
  );
};
FooterSubscription.propTypes = {
  footerPalette: PropTypes.object,
};
export default FooterSubscription;
