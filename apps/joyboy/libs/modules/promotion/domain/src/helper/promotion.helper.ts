import { selectFreeGiftBreakdownV1 } from './promotion.helper.v1';
import { selectFreeGiftBreakdownV2 } from './promotion.helper.v2';
import { sharedFeatureService } from '@castlery/shared-services';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;
export const selectFreeGiftBreakdown = enableOrderV2 ? selectFreeGiftBreakdownV2 : selectFreeGiftBreakdownV1;
