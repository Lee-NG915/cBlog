import { createAsyncThunk } from '@reduxjs/toolkit';
import { pinterestConversion } from './api/pinterest.api';
import crypto from 'crypto';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { logger } from '@castlery/observability/client';
/**
 * Pinterest conversion api
 */
export const ptConversion = createAsyncThunk(
  'tracking/pinterest',
  async (args: any, { dispatch, rejectWithValue, extra }) => {
    try {
      const { data, formatData = true, accessToken } = args;
      const params = formatData ? formatPinterestData(data) : data;
      const { persistenceHandles } = extra as ExtraArgument;
      const gaPersudoId = persistenceHandles.gaClient.getItem();
      if (gaPersudoId) {
        if (params.user_data === undefined) {
          params.user_data = {};
        }
        params.user_data.external_id = [
          crypto
            .createHash('sha256')
            .update(gaPersudoId.slice(6) || '')
            .digest('hex'),
        ];
      }
      await dispatch(
        pinterestConversion.initiate({
          data: params,
          accessToken,
        })
      ).unwrap();
      return;
    } catch (error) {
      logger.error('Pinterest conversion failed', { error });
      return rejectWithValue(error);
    }
  }
);

const formatPinterestData = (data: any = {}) => {
  // format data

  const eventNameEnum = new Map([
    // facebook event to pinterest event
    ['ViewContent', 'page_visit'],
    ['AddToCart', 'add_to_cart'],
    ['CompleteRegistration', 'signup'],
    ['Purchase', 'checkout'],
    // NewCustomerPurchase: 'checkout',
    ['Lead', 'lead'],
  ]);

  // user_data backend will be covered if login
  const userData = data.user_data && {
    ...(data.user_data || {}),
    fbc: undefined,
    fbp: undefined,
  };

  const custom_data_contents =
    data.custom_data?.contents &&
    data.custom_data.contents.map((content: any) => ({
      item_price: content.item_price,
      quantity: content.quantity,
    }));

  const custom_data = data.custom_data && {
    value: data.custom_data.value === undefined ? undefined : `${data.custom_data.value}`,
    currency: data.custom_data.currency,
    content_ids: data.custom_data.content_ids,
    contents: custom_data_contents,
    num_items: data.custom_data.num_items,
    order_id: data.custom_data.order_id,
    search_string: data.custom_data.search_string,
  };

  const params = {
    event_name: eventNameEnum.get(data?.event_name) || 'custom',
    event_id: data.event_id,
    event_time: data.event_time,
    event_source_url: data.event_source_url,
    custom_data,
    user_data: userData,
    action_source: 'offline',
  };
  return params;
};
