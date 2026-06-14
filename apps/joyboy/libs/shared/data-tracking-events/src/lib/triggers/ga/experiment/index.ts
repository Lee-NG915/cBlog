import { GaMetrics } from '../../../metrics';

/**
 * https://developers.google.com/analytics/devguides/collection/ga4/integration?hl=zh-cn
 * exp_variant_string: "ABC-F2948574-3495F49" : XXX-YYYYYYYYY-ZZZZZZZZ 
 * @param args {
    XXX 是您提供的第三方工具的 ID
    YYYYYYYYY 是体验的 ID
    ZZZZZZZZ 是变体的 ID
 }
 */
export const experienceImpression = (args: { tdyId: string; expId: string; variantId: string }) => {
  const { tdyId, expId, variantId } = args;

  return {
    event: GaMetrics.experience_impression,
    exp_variant_string: `${tdyId}-${expId}-${variantId}`,
  };
};
