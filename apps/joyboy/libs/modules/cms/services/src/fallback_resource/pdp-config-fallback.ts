import { PdpSelectorConfigStoryblok } from '@castlery/types';
import { EcEnv } from '@castlery/config';

/**
 * 所有国家的 fallback 配置映射
 * 作为 Storyblok API 失败时的最终兜底
 * 当 Storyblok 配置结构变化时，需要手动更新此配置
 */
const PDP_CONFIG_FALLBACK_BY_COUNTRY: Record<string, PdpSelectorConfigStoryblok> = {
  SG: {
    spu_groups: [],
    _uid: 'fallback-sg',
    component: 'pdp_selector_config',
  },
  US: {
    spu_groups: [],
    _uid: 'fallback-us',
    component: 'pdp_selector_config',
  },
  AU: {
    spu_groups: [],
    _uid: 'fallback-au',
    component: 'pdp_selector_config',
  },
  CA: {
    spu_groups: [],
    _uid: 'fallback-ca',
    component: 'pdp_selector_config',
  },
  UK: {
    spu_groups: [],
    _uid: 'fallback-uk',
    component: 'pdp_selector_config',
  },
};

/**
 * 根据国家代码获取对应的 fallback 配置
 *
 * @param country 国家代码（如 'SG', 'US', 'AU', 'CA', 'UK'），不区分大小写
 * @returns 对应国家的 fallback 配置，如果国家不存在则返回空配置
 */
export function getPdpConfigFallback(country?: string): PdpSelectorConfigStoryblok {
  const countryUpper = (country || EcEnv.NEXT_PUBLIC_COUNTRY || 'SG').toUpperCase();
  return (
    PDP_CONFIG_FALLBACK_BY_COUNTRY[countryUpper] || {
      spu_groups: [],
      _uid: `fallback-${countryUpper.toLowerCase()}`,
      component: 'pdp_selector_config',
    }
  );
}

/**
 * 当前运行国家的 fallback 配置
 * 自动根据 EcEnv.NEXT_PUBLIC_COUNTRY 获取对应国家的配置
 */
export const PDP_CONFIG_FALLBACK: PdpSelectorConfigStoryblok = getPdpConfigFallback();
