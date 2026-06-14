'use client';

import { useState, useEffect } from 'react';
import { getCustomerServiceApi } from '../lib/customer-service/sdk-loader';

/**
 * Hook to detect whether Casa chat is the active channel.
 * Uses the Customer Service SDK's resolved switcher channel instead of polling.
 */
export const useCasaEnabled = (): boolean => {
  const [isCasaEnabled, setIsCasaEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribeReady = () => {};
    let unsubscribeChannelChanged = () => {};

    void getCustomerServiceApi()
      .then((api) => {
        if (!mounted) return;

        unsubscribeReady = api.on('ready', ({ defaultChannel }) => {
          setIsCasaEnabled(defaultChannel === 'casa');
        });
        unsubscribeChannelChanged = api.on('channel_changed', ({ to }) => {
          setIsCasaEnabled(to === 'casa');
        });
      })
      .catch(() => {
        if (!mounted) return;
        setIsCasaEnabled(false);
      });

    return () => {
      mounted = false;
      unsubscribeReady();
      unsubscribeChannelChanged();
    };
  }, []);

  return isCasaEnabled;
};
