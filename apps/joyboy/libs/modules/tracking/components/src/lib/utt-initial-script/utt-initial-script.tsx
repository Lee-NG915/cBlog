'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useConsent } from '@castlery/shared-privacy-kit';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ensureIreQueue,
  getUTTCdnUrl,
  isUttEnabled,
  trackUTTConsentEvent,
  trackUTTIdentifyEvent,
} from '@castlery/modules-tracking-services';

const ConsentBridge = () => {
  const dispatch = useAppDispatch();
  const granted = useConsent('advertisement');
  const hasDefaultedRef = useRef(false);

  useEffect(() => {
    const mode: 'default' | 'update' = hasDefaultedRef.current ? 'update' : 'default';
    hasDefaultedRef.current = true;
    dispatch(trackUTTConsentEvent({ mode, granted }));
  }, [dispatch, granted]);

  return null;
};

const IdentifyBridge = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectedActiveUser);

  useEffect(() => {
    dispatch(trackUTTIdentifyEvent({ user }));
  }, [dispatch, user?.id, user?.email]);

  return null;
};

const UttScripts = ({ uttCdnUrl }: { uttCdnUrl: string }) => {
  ensureIreQueue();

  return (
    <>
      <Script id="impact-utt" src={uttCdnUrl} strategy="afterInteractive" />
      <ConsentBridge />
      <IdentifyBridge />
    </>
  );
};

export const UttInitialScript = () => {
  if (!isUttEnabled()) return null;
  const uttCdnUrl = getUTTCdnUrl();
  if (!uttCdnUrl) return null;
  return <UttScripts uttCdnUrl={uttCdnUrl} />;
};
