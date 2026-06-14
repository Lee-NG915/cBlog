'use client';

import { selectDiscontinued, warrantySDKLoadSuccess } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { WarrantyProviderManager } from '@castlery/shared-components';

export const GuardsmanWarrantyLoader = () => {
  const dispatch = useAppDispatch();
  const discontinued = useAppSelector(selectDiscontinued);

  if (discontinued) {
    return null;
  }

  return (
    <WarrantyProviderManager
      loadSuccess={() => {
        dispatch(warrantySDKLoadSuccess());
      }}
    />
  );
};

export default GuardsmanWarrantyLoader;
