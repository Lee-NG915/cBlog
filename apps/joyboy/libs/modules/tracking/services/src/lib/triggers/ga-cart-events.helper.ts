import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectedCurrentCustomer, selectedAdminUserInfo, selectedActiveUser } from '@castlery/modules-user-domain';
import {
  selectCurrentOrderNumber,
  selectOrderLineItems,
  selectOnlineLineItems,
  selectCartQtyDifference,
} from '@castlery/modules-order-domain';
import { selectedRetailId } from '@castlery/modules-retails-domain';

/**
 * triggered when added a new customer => regard as new customer sign up
 */
export const trackOfflineAccountSignUp = createAsyncThunk(
  'tracking/trackOfflineAccountSignUp',
  (_, { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const sales = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const retailId = selectedRetailId(rootState);

    try {
      dt.track(EventsNames.EVENT_OFFLINE_ACCOUNT)({
        sales: sales,
        customer: customer ?? null,
        isSignUp: true,
        retailId,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

/**
 * triggered when selected a customer => regard as a customer sign in
 */
export const trackOfflineAccountSignIn = createAsyncThunk(
  'tracking/trackOfflineAccountSignIn',
  async (_, { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const sales = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const retailId = selectedRetailId(rootState);
    try {
      dt.track(EventsNames.EVENT_OFFLINE_ACCOUNT)({
        sales: sales,
        customer: customer ?? null,
        retailId,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

/**
 * triggered when added a product to the cart,
 * Triggered only when the customer is logged in
 */
export const trackOfflineAtc = createAsyncThunk(
  'tracking/trackOfflineAtc',
  async (_, { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const admin = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const lineItems = selectOrderLineItems(rootState);
    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!customer) return Promise.resolve();
    if (!lineItems || lineItems?.length <= 0) return Promise.resolve();
    try {
      dt.track(EventsNames.EVENT_OFFLINE_ATC)({
        lineItems,
        sales: admin,
        customer: customer ?? null,
        transactionId: orderNumber,
      });
      return Promise.resolve();
    } catch (e) {
      rejectWithValue(e);
    }
  }
);

/**
 * triggered when pushed the Pos cart items to the online cart successfully
 */
export const trackPushToOnline = createAsyncThunk(
  'tracking/trackPushToOnline',
  async (itemIds: number[], { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const admin = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const lineItems = selectOrderLineItems(rootState);
    const items = lineItems?.filter((item) => itemIds.includes(item.id)) || [];
    const orderNumber = selectCurrentOrderNumber(rootState);

    try {
      dt.track(EventsNames.EVENT_PUSH_TO_ONLINE)({
        transactionId: orderNumber,
        lineItems: items,
        sales: admin,
        customer: customer ?? null,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

/**
 * triggered when added online cart items to Pos cart
 */
export const trackRetrieveOnlineCart = createAsyncThunk(
  'tracking/trackRetrieveOnlineCart',
  async (itemIds: number[], { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const admin = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const onlineItems = selectOnlineLineItems(rootState);
    const items = onlineItems?.filter((item) => itemIds.includes(item.id)) || [];
    const orderNumber = selectCurrentOrderNumber(rootState);

    try {
      dt.track(EventsNames.EVENT_RETRIEVE_ONLINE_CART)({
        transactionId: orderNumber,
        lineItems: items,
        sales: admin,
        customer: customer ?? null,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const trackOfflineAtcClick = createAsyncThunk(
  'tracking/trackOfflineAtcClick',
  async (_, { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const orderNumber = selectCurrentOrderNumber(rootState);
    const customer = selectedCurrentCustomer(rootState);
    try {
      dt.track(EventsNames.EVENT_OFFLINE_ATC_CLICK)({
        transactionId: orderNumber,
        customer: customer ?? null,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

/**
 * triggered when added a product to the cart, after the order is updated
 */
export const trackOnlineATC = createAsyncThunk('tracking/trackOnlineATC', async (_, { getState, rejectWithValue }) => {
  const rootState = getState() as any;
  const lineItems = selectOrderLineItems(rootState);
  const customer = selectedActiveUser(rootState);
  const cartQtyDifference = selectCartQtyDifference(rootState);
  try {
    dt.track(EventsNames.EVENT_ONLINE_ADD_TO_CART)({
      lineItems,
      customer: customer ?? null,
      cartQuantityDifference: cartQtyDifference,
    });
    return Promise.resolve();
  } catch (e) {
    return rejectWithValue(e);
  }
});
