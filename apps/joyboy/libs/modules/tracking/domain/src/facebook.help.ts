import { createAsyncThunk } from '@reduxjs/toolkit';
import { facebookConversionV2 } from './api/facebook.api';
import crypto from 'crypto';
import { EcEnv, enableCAPI, enablePinterest } from '@castlery/config';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { ptConversion } from './pinterest.help';
import { logger } from '@castlery/observability/client';

/* For GTM */
export function getOriginalAmount(amount: number) {
  if (!amount && amount !== 0) {
    return '';
  }
  const unitPriceTaxRate: Record<string, number> = {
    AU: 1.1,
    SG: 1.07,
    US: 1,
  };
  return (amount / unitPriceTaxRate[EcEnv.NEXT_PUBLIC_COUNTRY]).toFixed(2);
}

export function randomId(prefix: string) {
  return `${prefix || ''}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

export const fbs = createAsyncThunk(
  'tracking/fbs',
  async (args: any, { extra, dispatch, getState, rejectWithValue }) => {
    try {
      const { event_id, event_name, event_time, custom_data = {} } = args;
      const { persistenceHandles } = extra as ExtraArgument;
      const accessToken = persistenceHandles.accessToken.getItem();
      const { email, phone, lastname, firstname } = (getState() as any)?.customer?.customer || {};
      const { zipcode } = (getState() as any)?.order || {};
      const data = {
        event_id,
        event_name,
        event_time,
        event_source_url: (window && window.location.href) || '',
        user_data: {
          client_user_agent: navigator.userAgent,
          country: crypto.createHash('sha256').update(EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()).digest('hex'),
          zp: (zipcode && crypto.createHash('sha256').update(zipcode).digest('hex')) || void 0,
          em: (email && [crypto.createHash('sha256').update(email).digest('hex')]) || void 0,
          ph: (phone && [crypto.createHash('sha256').update(phone).digest('hex')]) || void 0,
          ln: (lastname && [crypto.createHash('sha256').update(lastname).digest('hex')]) || void 0,
          fn: (firstname && [crypto.createHash('sha256').update(firstname).digest('hex')]) || void 0,
        },
        custom_data,
        action_source: EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 'physical_store' : 'website',
      };
      if (enableCAPI) {
        const newData = {
          ...data,
          pixel_id: EcEnv.NEXT_PUBLIC_CAPI_PIXEL_ID,
          custom_data: {
            ...custom_data,
            delivery_category: 'in_store',
          },
        };
        await dispatch(
          facebookConversionV2.initiate({
            data: newData,
            accessToken,
          })
        ).unwrap();
      }
      // Pinterest CAPI
      if (enablePinterest && data.event_name === 'Purchase') {
        await dispatch(
          ptConversion({
            data,
            formatData: true,
            accessToken,
          })
        );
      }
      return;
    } catch (error) {
      logger.error('Facebook conversion failed', { error });
      return rejectWithValue(error);
    }
  }
);

export const fbp = createAsyncThunk(
  'tracking/fbp',
  async ({ eventName, eventData, eventId }: { eventName: string; eventData: any; eventId: string }, { dispatch }) => {
    const now = new Date();
    const eventTime = (now.getTime() / 1000) | 0;
    if (!eventId) {
      eventId = randomId(`${eventName || ''}`);
    }
    const result = await dispatch(
      fbs({
        event_id: eventId,
        event_name: eventName,
        event_time: eventTime,
        custom_data: eventData,
      })
    );
    return result;
  }
);
/**
 *
 * @param {*} param0
 */
export const trackViewContent = createAsyncThunk('tracking/trackViewContent', async (_, { dispatch }) => {
  const eventId = randomId('viewContent');
  await dispatch(
    fbp({
      eventName: 'ViewContent',
      eventData: {},
      eventId,
    })
  );
  return;
});

export const trackCartOperation = createAsyncThunk(
  'tracking/trackCartOperation',
  async ({ eventId, eventData }: { eventId: string; eventData: any }, { dispatch }) => {
    await dispatch(
      fbp({
        eventName: 'AddToCart',
        eventData: eventData,
        eventId,
      })
    );
    return;
  }
);

/**
 * @Remark two case 1: add to cart 2: increase the quatity
 * @param {*} res
 * @param {*} customer
 */
export const handleATC = createAsyncThunk(
  'tracking/handleATC',
  async ({ order }: { order: any }, { dispatch, getState }) => {
    if (JSON.stringify((getState() as any).customer) === '{}') return;
    const { line_items } = order || {};
    if (line_items && line_items.length !== 0) {
      const data = line_items[0];
      const originalValue = getOriginalAmount(+data.price || 0);
      const currency = data.currency;
      const content_name = data.variant.name;
      const content_ids = [data.variant.sku];
      const eventId = randomId('addToCart');
      const content_type = 'product';
      await dispatch(
        trackCartOperation({
          eventData: {
            value: originalValue,
            currency,
            content_name,
            content_ids,
            content_type,
          },
          eventId,
        })
      );
    }
    return;
  }
);

/**
 *
 * @param {*} param0
 */
export const trackPurchase = createAsyncThunk(
  'tracking/trackPurchase',
  async ({ eventId, eventData }: { eventId: string; eventData: any }, { dispatch }) => {
    await dispatch(
      fbp({
        eventName: 'Purchase',
        eventData,
        eventId,
      })
    );
    return;
  }
);

export const handlePurchase = createAsyncThunk('tracking/handlePurchase', async (_, { dispatch, getState }) => {
  const eventId = randomId('Purchase');
  const data = (getState() as any)?.order?.order || {};
  const swatches = data?.line_items.filter((lineItem: any) => lineItem.is_swatch);
  const products = data?.line_items.filter((lineItem: any) => !lineItem.is_swatch);
  const trackedOrder = {
    ...data,
    line_items: products,
    item_count: data.item_count - swatches.length,
  };
  const contents =
    trackedOrder.line_items &&
    trackedOrder.line_items.map((item: any) => ({
      id: item.variant.sku,
      quantity: item.quantity,
      item_price: item.variant.price,
    }));
  await dispatch(
    trackPurchase({
      eventData: {
        value: trackedOrder.total,
        currency: trackedOrder.currency,
        content_ids: trackedOrder.line_items.map((i: any) => i.variant.sku),
        content_type: 'product',
        contents,
        order_id: trackedOrder.number,
      },
      eventId,
    })
  );
  return;
});

export const setFbUserInSession = createAsyncThunk(
  'tracking/setFbUserInSession',
  async ({ email, fbLoginID }: { email: string; fbLoginID: string }, { dispatch, extra }) => {
    if (!email || !fbLoginID) return;
    const { persistenceHandles } = extra as ExtraArgument;
    try {
      const userData = {
        fb_login_email: email,
        fb_login_id: fbLoginID,
      };
      const userDataString = JSON.stringify(userData);
      persistenceHandles.fbUser.setItem(userDataString);
    } catch (error) {
      logger.error('Failed to set FB user in session', { error });
    }
  }
);
