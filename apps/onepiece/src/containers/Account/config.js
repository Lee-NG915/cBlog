import { globalFeatureInSG } from 'config';
import { toPrice } from 'utils/number';

/**
 * Base Calculator
 */
const ALL_FLAT_RATE = 'AllFlatRate';
const ALL_FLAT_PERCENT = 'AllFlatPercent';
const PERCENT_PER_ITEM = 'PercentPerItem';
const TIERED_PERCENT = 'TieredPercent';
const TIERED_FLAT_RATE = 'TieredFlatRate';
const FREE_SHIPPING = 'FreeShipping';
const FREE_ANY_SERVICE = 'FreeAnyService';
const FREE_ROC_SERVICE = 'FreeRocService';
const FREE_WG_SERVICE = 'FreeWgService';
export const GIFT_POOLS = 'GiftPools';

/**
 * AllFlatRate     amount
 * AllFlatPercent  flat_percent
 * FreeShipping
 * FreeAnyService
 * FreeRocService
 * FreeWgService
 * PercentPerItem  percent
 * GiftPools
 * TieredPercent   tiers
 * TieredFlatRate  tiers
 */
export const formatPreferences = (type, preferences, from) => {
  const { amount, tiers = {}, flat_percent: flatPercent, percent, effective_tier: effectiveTier } = preferences || {};
  let title = '';
  let description = '';
  let descriptionInfo = '';
  let isHighest = false;

  switch (type) {
    case ALL_FLAT_RATE:
      title = toPrice(amount);
      break;
    case ALL_FLAT_PERCENT:
      title = `${+flatPercent}% OFF`;
      break;
    case TIERED_FLAT_RATE:
      if (from === 'cart') {
        const lastTier = Object.values(tiers)?.pop();
        isHighest = lastTier === effectiveTier;
        title = effectiveTier ? `${toPrice(effectiveTier)} OFF` : `${toPrice(Object.values(tiers)[0])} OFF`;
      } else {
        title = `${Object.values(tiers)
          ?.map((tier) => `${toPrice(tier)}`)
          .join('/')}`;
      }
      description = 'Tiered Discount';
      descriptionInfo =
        Object.entries(tiers)?.map(([key, value]) => `${toPrice(value)} OFF Min. Spend ${toPrice(key)}`) || '';
      break;
    case TIERED_PERCENT:
      if (from === 'cart') {
        const lastTier = Object.values(tiers)?.pop();
        isHighest = lastTier === effectiveTier;
        title = effectiveTier ? `${+effectiveTier}% OFF` : `${+Object.values(tiers)[0]}% OFF`;
      } else {
        title = `${Object.values(tiers)
          ?.map((tier) => `${+tier}%`)
          .join('/')} OFF`;
      }
      description = 'Tiered Discount';
      descriptionInfo = Object.entries(tiers)?.map(([key, value]) => `${+value}% OFF Min. Spend ${toPrice(key)}`) || '';
      break;
    case PERCENT_PER_ITEM:
      title = `${+percent}% OFF Per Item`;
      break;
    case FREE_SHIPPING:
      title = 'Free Shipping';
      break;
    case FREE_ANY_SERVICE:
      title = globalFeatureInSG ? 'Free Service' : 'Free WG & ROC service';
      break;
    case FREE_ROC_SERVICE:
      title = 'Free ROC Service';
      break;
    case FREE_WG_SERVICE:
      title = 'Free WG Service';
      break;
    case GIFT_POOLS:
      title = 'Free Gift(s)';
      break;
    default:
  }

  return { title, description, descriptionInfo, isHighest };
};
