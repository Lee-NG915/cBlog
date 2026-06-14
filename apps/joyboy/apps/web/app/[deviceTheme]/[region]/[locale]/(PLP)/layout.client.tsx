'use client';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';

// todo @rick 期望在 plp layout client 中获取到 breadcrumbs 数据,
export default function PLPLayoutClient() {
  const store = useAppStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      store.dispatch(
        enterApp({
          page: 'PLP',
        })
      );

      initializedRef.current = true;
    }
  }, [store, initializedRef.current]);

  return null;
}
