'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ensureIreQueue,
  getPosUTTCdnUrl,
  isPosUttEnabled,
  trackUTTConsentEvent,
  trackUTTIdentifyEvent,
} from '@castlery/modules-tracking-services';

// POS 端无 CookieYes / consent banner，consent 一次性下发 'default: granted'
// 全部 market 一致：POS 是受控线下场景，业务侧已确认默认同意 tracking
const PosConsentBridge = () => {
  const dispatch = useAppDispatch();
  const dispatchedRef = useRef(false);

  useEffect(() => {
    if (dispatchedRef.current) return;
    dispatchedRef.current = true;
    dispatch(trackUTTConsentEvent({ mode: 'default', granted: true }));
  }, [dispatch]);

  return null;
};

const PosIdentifyBridge = () => {
  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectedCurrentCustomer);

  useEffect(() => {
    dispatch(trackUTTIdentifyEvent({ user: customer }));
  }, [dispatch, customer?.id, customer?.email]);

  return null;
};

const PosUttScripts = ({ uttCdnUrl }: { uttCdnUrl: string }) => {
  ensureIreQueue();

  return (
    <>
      <Script id="impact-utt" src={uttCdnUrl} strategy="afterInteractive" />
      <PosConsentBridge />
      <PosIdentifyBridge />
    </>
  );
};

export const PosUttInitialScript = () => {
  if (!isPosUttEnabled()) return null;
  const uttCdnUrl = getPosUTTCdnUrl();
  if (!uttCdnUrl) return null;
  return <PosUttScripts uttCdnUrl={uttCdnUrl} />;
};
