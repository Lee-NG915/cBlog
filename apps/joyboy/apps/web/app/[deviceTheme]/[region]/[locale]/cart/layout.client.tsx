'use client';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';

export const CartLayoutClient = () => {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      dispatch(
        enterApp({
          page: 'WEB_CART',
        })
      );
      initialized.current = true;
    }
  }, [dispatch]);
  return null;
};

export default CartLayoutClient;
