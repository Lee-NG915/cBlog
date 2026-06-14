import React, { useState } from 'react';
import { FooterSubscriptionUI } from '../FooterSubscriptionUI/FooterSubscriptionUI';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { postSubscription } from '@castlery/modules-product-domain';
import { NiceModal } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';
import { EVENT_NEWSLETTER_SUBSCRIPTION } from '@castlery/modules-tracking-services';

type FooterSubscriptionProps = {
  footerPalette: {
    color: string;
    bg: string;
    hoverBg: string;
    activeBg: string;
    disableColor: string;
    disableBg: string;
  };
  newsletterHeaderTitle?: string;
};

const FooterSubscription = ({ footerPalette, newsletterHeaderTitle }: FooterSubscriptionProps) => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<{
    email: string;
    status: 'initial' | 'loading' | 'failure' | 'sent';
    info?: string;
  }>({
    email: '',
    status: 'initial',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setData((current) => ({ ...current, status: 'loading' }));
    try {
      const { email } = data;
      const result = await dispatch(postSubscription.initiate({ email, source: 'FOOTER' }));
      if (result?.error) {
        if (result.error?.data?.errors?.[0]?.detail) {
          setData({ email: '', status: 'failure', info: result.error?.data?.errors?.[0]?.detail });
        }
      } else {
        setData({ email: '', status: 'sent', info: 'You have successfully subscribed to the newsletter.' });
        dispatch(
          EVENT_NEWSLETTER_SUBSCRIPTION({
            subscriptionEmail: email,
          })
        );
      }
    } catch (err) {
      setError(err?.errors?.[0]?.detail || 'Oops! something went wrong, please try again later.');
      setData((current) => ({ ...current, status: 'failure' }));
    }
  };

  return (
    <>
      <FooterSubscriptionUI
        handleSubmit={handleSubmit}
        error={error}
        data={data}
        setData={setData}
        footerPalette={footerPalette}
        placeholder="Enter your email"
        ctaText="Submit"
        formLabel={newsletterHeaderTitle || `Enjoy ${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}50 off your first order`}
      />
      <NiceModal
        title="Thank You!"
        desc={data.info}
        onClose={() => setData({ email: '', status: 'initial' })}
        open={data.status === 'sent' || data.status === 'failure'}
        showCancelBtn={false}
        confirmText="CLOSE"
        success={data.status === 'sent'}
        danger={data.status === 'failure'}
        // showConfirmBtn={false}
      />
    </>
  );
};

export default FooterSubscription;
