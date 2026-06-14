'use client';

import { selectDiscontinued, warrantySDKLoadSuccess } from '@castlery/modules-product-domain';
import { WarrantyProviderManager } from '@castlery/shared-components';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { ProductGuardsmanPicker } from './product-guardsman-picker';

/**
 * [保险接入] CA Guardsman PDP 容器
 * 1. WarrantyProviderManager 加载 Guardsman SDK → dispatch warrantySDKLoadSuccess
 * 2. SDK 就绪后渲染 ProductGuardsmanPicker（用户选 plan → selectedGuardsmanPlanId）
 * 3. product.listener 监听 variant 变化拉取 plan 列表（fetchGuardsmanProductPlans）
 */
export const ProductGuardsman = () => {
  const dispatch = useAppDispatch();
  const discontinued = useAppSelector(selectDiscontinued);
  const [hadInitGuardsman, setHadInitGuardsman] = useState(false);

  return (
    <>
      {!discontinued && (
        <WarrantyProviderManager
          loadSuccess={() => {
            setHadInitGuardsman(true);
            dispatch(warrantySDKLoadSuccess());
          }}
        />
      )}
      {hadInitGuardsman && <ProductGuardsmanPicker />}
    </>
  );
};
