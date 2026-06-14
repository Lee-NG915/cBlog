'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { getCustomerServiceApi, useCustomerServiceApi } from './sdk-loader';
export { getCustomerServiceApi };
export type { CustomerServiceApi } from './sdk-types';

export const CustomerServiceBox = () => {
  const { customerServiceApi } = useCustomerServiceApi();
  const currentUser = useAppSelector(selectedActiveUser);

  useEffect(() => {
    if (!customerServiceApi || !currentUser) return;
    void customerServiceApi.setUser({
      name: `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim(),
      email: currentUser.email,
    });
  }, [customerServiceApi, currentUser]);

  return null;
};
