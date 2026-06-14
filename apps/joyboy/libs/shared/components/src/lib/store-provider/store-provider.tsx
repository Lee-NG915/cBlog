'use client';
import { AppStore, makeStore } from '@castlery/shared-redux-store';
import { AiChatUtils } from '@castlery/shared-services';
import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';

export const StoreProvider = (props: React.PropsWithChildren) => {
  // https://redux-toolkit.js.org/usage/nextjs#providing-the-store
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }
  useEffect(() => {
    if (!storeRef.current) return;
    if (typeof window !== 'undefined') {
      window.clsr = window.clsr || {};
      window.clsr.aiChatUtils = new AiChatUtils(storeRef.current as AppStore);
    }
  }, [storeRef.current]);

  return <Provider store={storeRef.current}>{props.children}</Provider>;
};
