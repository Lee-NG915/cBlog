'use client';

import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect } from 'react';

export const LoginLayoutClient = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Account',
      })
    );
  }, [dispatch]);
  return <></>;
};
