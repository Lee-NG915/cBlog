import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability/client';

export const trackUGCEvent = createAsyncThunk(
  'tracking/trackUGCEvent',
  async (payload: { skuName: string; skuId: string; label?: string; position?: string }, { fulfillWithValue }) => {
    try {
      dt.track(EventsNames.EVENT_SOCIAL_WIDGET)({
        action: 'product_link_click',
        skuName: payload.skuName,
        skuId: payload.skuId,
        label: payload.label,
        position: payload.position,
      });
      return fulfillWithValue({ data: 'success' });
    } catch (e) {
      // 由于tracking 不能影响主流程逻辑，所以不抛出错误
      logger.error('trackUGCEvent failed', { error: e });
      return fulfillWithValue({ data: 'success' });
    }
  }
);
