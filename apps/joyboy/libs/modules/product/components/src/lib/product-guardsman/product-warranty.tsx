'use client';

import { sharedFeatureService } from '@castlery/shared-services';
import { ProductMulberry } from '../product-mulberry/product-mulberry';
import { ProductGuardsman } from './product-guardsman';

/**
 * [保险接入] PDP 保险 UI 入口（New PDP 挂载点见 apps/web/.../products/[slug]/page.tsx）
 * - CA: ProductGuardsman → SDK 加载 + Radio 选 plan → 加车时写入 warranty slice
 * - US: ProductMulberry → Mulberry SDK modal 选 plan → legacy Order API 加车
 * - 无 provider 时返回 null，不影响 ATC 主流程
 */
export const ProductWarranty = () => {
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();

  if (isGuardsmanEnabled) {
    return <ProductGuardsman />;
  }

  if (isMulberryEnabled) {
    return <ProductMulberry />;
  }

  return null;
};
