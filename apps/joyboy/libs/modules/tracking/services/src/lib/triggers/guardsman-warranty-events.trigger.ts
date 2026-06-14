import { createAsyncThunk } from '@reduxjs/toolkit';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack } from '../utils';
import { logger } from '@castlery/observability/client';
import type { GuardsmanWarrantyTriggerPayloadSchema } from '../entity/ga-events.schema';

export function buildGuardsmanWarrantyGaParams(payload: GuardsmanWarrantyTriggerPayloadSchema) {
  return {
    event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
    'eventDetails.category': 'guardsman_warranty' as const,
    'eventDetails.action': payload.action,
    'eventDetails.label': payload.label ?? '',
    'eventDetails.sku_id': payload.sku,
    'eventDetails.sku_name': payload.skuName,
    'eventDetails.position': payload.position ?? '',
    'eventDetails.price': payload.price ?? '',
  };
}

/**
 * @description Guardsman extended warranty GA interactions (CA market).
 * @note GA event : trackEvent (guardsman_warranty)
 */
export const trackGuardsmanWarrantyEvent = createAsyncThunk(
  'tracking/trackGuardsmanWarrantyEvent',
  async (payload: GuardsmanWarrantyTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.sku || !payload.skuName) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      gaTrack(buildGuardsmanWarrantyGaParams(payload));
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackGuardsmanWarrantyEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);
