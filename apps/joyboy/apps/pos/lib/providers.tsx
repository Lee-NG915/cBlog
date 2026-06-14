'use client';
import { AppStore, makeStore } from '@castlery/shared-redux-store';
import { useRef } from 'react';
import { Provider } from 'react-redux';

export const StoreProvider = (props: React.PropsWithChildren) => {
  // https://redux-toolkit.js.org/usage/nextjs#providing-the-store
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{props.children}</Provider>;
};
