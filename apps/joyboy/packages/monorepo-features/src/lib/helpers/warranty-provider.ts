import { featureManager } from '../scripts/feature-manager';

export type WarrantyProvider = 'mulberry' | 'guardsman' | null;

/**
 * [保险接入] 市场级 Provider 路由（单一真相源）
 * - CA（enabledOrderV2=true）→ Guardsman
 * - US（enabledOrderV2=false）→ Mulberry
 * - 下游 PDP 选 plan、加车 payload、Cart 增删保险均依赖此返回值，勿在业务层硬编码 market 判断
 */
export const getWarrantyProvider = (): WarrantyProvider => {
  if (featureManager.isFeatureEnabled(featureManager.featureName.GUARDSMAN)) {
    return 'guardsman';
  }

  if (featureManager.isFeatureEnabled(featureManager.featureName.MULBERRY)) {
    return 'mulberry';
  }

  return null;
};
