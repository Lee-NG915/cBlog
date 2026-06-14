import React, { useEffect } from 'react';
import Banner from 'components/Banner';
import { useSelector, useDispatch } from 'react-redux';
import { load } from 'redux/modules/subscriptionBar';
import { isOutdated } from 'utils/time';
import SubscriptionBar from './BannerBar';

const SubscriptionBanner = () => {
  const showOnHomePage = useSelector((state) => state.subscriptionBar.showOnHomePage);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load());
  }, []);

  if (!showOnHomePage) {
    return null;
  }

  const isGiveawayValid = !isOutdated('2021-03-15 00:00', '2021-03-22 00:00');

  return (
    <div id="email">
      <Banner
        mediaQueries={[
          {
            breakpoint: 'xs',
            srcset: isGiveawayValid
              ? '/static/home/patrick-giveaway-mobile.jpg'
              : '/static/home/subscription-mobile-v4.jpg',
            loader: {
              ratio: 0.933,
            },
          },
          {
            breakpoint: 'md',
            srcset: isGiveawayValid
              ? '/static/home/patrick-giveaway-tablet.jpg'
              : '/static/home/subscription-tablet-v4.jpg',
            loader: {
              ratio: 0.5208,
            },
          },
          {
            breakpoint: 'lg',
            srcset: isGiveawayValid ? '/static/home/patrick-giveaway.jpg' : '/static/home/subscription-v4.jpg',
            loader: {
              ratio: 0.3125,
            },
          },
        ]}
        title="subscription"
      >
        <SubscriptionBar />
      </Banner>
    </div>
  );
};

export default SubscriptionBanner;
