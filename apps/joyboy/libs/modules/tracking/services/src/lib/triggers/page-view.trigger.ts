import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectOrder } from '@castlery/modules-order-domain';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { getOriginalAmount, getPageViewParams, TRACKING_MSGS_MAP } from '../helpers';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { trackFacebookProductViewMoreThan3Event } from './fb-capi-events.trigger';
import { trackPinterestPageVisitEvent } from './pinterest-capi-events.trigger';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack, getEventRandomId } from '../utils';
import { WEB_PAGE_NAMES, WEB_PAGE_TYPES } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import { User } from '@castlery/types';

// import { setHistoryPageviews } from '@castlery/modules-tracking-domain';

// 已弃用，待移除
export const trackProductPageView = createAsyncThunk(
  'tracking/trackProductPageView',
  async ({ variantion }: { variantion?: string }, { dispatch, getState, fulfillWithValue }) => {
    const rootState = getState() as any;
    const order = selectOrder(rootState);
    const product = selectProduct(rootState);
    const customer = selectedActiveUser(rootState);
    const location = window.location.pathname;
    const productTaxons = product?.taxons;
    const pageContent = productTaxons?.find((item) => item.level === 1)?.name || '';
    const pageProduct = productTaxons?.find((item) => item.level === 2)?.name || '';
    const { sku, name, price, list_price: listPrice } = product?.variants ? product?.variants[0] || {} : {};
    const isSale = Number(listPrice) - Number(price) > 0;

    try {
      dt.track(EventsNames.EVENT_PAGE_VIEW)({
        customer: customer,
        details: {
          pageCat: 'product-detail',
          pageType: 'product',
          pageContent: pageContent,
          pageProduct: pageProduct,
          ...(order && { isNewCustomer: Boolean(order?.first_purchase) }),
          productCode: sku,
          productName: name,
          productPrice: getOriginalAmount(Number(price)),
          productSale: isSale ? 'sale' : 'full', // 'sale' if reduced price; 'full' if standard price
          pageUrl: location,
          pageVariant: variantion,
        },
      });
      await dispatch(trackFacebookProductViewMoreThan3Event());
      return fulfillWithValue({ data: 'success' });
    } catch (e) {
      logger.error('trackProductPageView failed', { error: e });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

export const trackCommonPageViewEvent = createAsyncThunk(
  'tracking/trackCommonPageViewEvent',
  async (
    { pageName, pageVariant, ...rest }: Partial<Parameters<typeof getPageViewParams>[0]>,
    { getState, dispatch, fulfillWithValue }
  ) => {
    if (!pageName) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const rootState = getState() as any;
      const customer = selectedActiveUser(rootState);
      const order = selectOrder(rootState);
      const product = selectProduct(rootState);
      const variant = selectVariant(rootState);
      const pathname = window.location.pathname;
      const eventId = getEventRandomId('Pageview');

      const pageViewParams = getPageViewParams({
        pathname,
        pageName: pageName ?? '',
        pageVariant: pageVariant ?? '',
        customer,
        order,
        product,
        variant,
        ...rest,
      });
      // 1. track ga page view
      gaTrack({
        event: EVENTS_NAMES_MAP.GA_PAGE_VIEW,
        eventId,
        ...pageViewParams,
      });

      // 2. track pinterest page view
      if (pageName === WEB_PAGE_NAMES.PRODUCT_DETAIL_PAGE) {
        await dispatch(trackFacebookProductViewMoreThan3Event());
        const originalPrice = getOriginalAmount(Number(variant?.price));
        await dispatch(trackPinterestPageVisitEvent({ eventId, variant, originalPrice }));
      }

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackCommonPageViewEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

//在登录弹窗登录后，手动模拟一次pageview事件
export const trackPageViewAfterAuthByModalEvent = createAsyncThunk(
  'tracking/trackPageViewAfterAuthByModalEvent',
  async (
    payload: {
      customer: User;
    },
    { fulfillWithValue, rejectWithValue }
  ) => {
    if (typeof window === 'undefined') {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    const pathname = window.location.pathname;
    const excludePathSymbols = ['/forgot-password', '/reset-password', '/signup', '/login'];
    if (excludePathSymbols.some((symbol) => pathname.endsWith(symbol))) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    }
    if (!payload.customer) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const historyPageviews = window.historyPageviews || [];
      const allTrackedPageviews = historyPageviews.filter(
        (item: any) => item.event === EVENTS_NAMES_MAP.GA_PAGE_VIEW && item.pageCat !== WEB_PAGE_TYPES.ACCOUNT_PAGE
      );
      if (allTrackedPageviews && allTrackedPageviews.length > 0) {
        const lastTrackedPageview = allTrackedPageviews[allTrackedPageviews.length - 1];
        gaTrack({
          ...lastTrackedPageview,
          userEmail: payload.customer.emailHashed ?? encHex.stringify(sha256(payload.customer.email ?? '')),
          userID: payload.customer.id,
          userPhone: payload.customer.phoneHashed ?? encHex.stringify(sha256(payload.customer.phone ?? '')),
          userType: 'member',
          userStatus: 'logged-in',
        });
      }
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
