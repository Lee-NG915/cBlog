import { baseAtcCtrTrigger, type BaseTackAtcCtrArgs, type BaseTackAtcCtrDataLayer } from './atc-ctr.trigger';
import { offlineAddToCart, type OfflineAddToCartArgs, type OfflineAddToCartDataLayer } from './base-atc.trigger';

/**
 * Scenario: Clicking the atc button, modifying the quantity in cart, etc.
 * based on clicks only，regardless of whether are logged in or not
 *
 * @param args
 * @returns
 */
export const offlineAtcClick = (args: Omit<BaseTackAtcCtrArgs, 'category'>): BaseTackAtcCtrDataLayer =>
  baseAtcCtrTrigger({ ...args, category: 'offline_atc_click' });

/**
 * Scenario: Triggered when the add to pos button is clicked
 * @param args
 * @returns
 */
export const retrieveOnlineCart = (args: Omit<OfflineAddToCartArgs, 'atcCategory'>): OfflineAddToCartDataLayer =>
  offlineAddToCart({ ...args, atcCategory: 'retrieve_online_cart' });

/**
 * Scenario: User add to cart. When the user is not logged in, this event is not tracked.
 * also contains  adding to cart and modifying the quantity in cart
 * @param args
 * @returns
 */
export const offlineAtc = (args: Omit<OfflineAddToCartArgs, 'atcCategory'>): OfflineAddToCartDataLayer =>
  offlineAddToCart({ ...args, atcCategory: 'offline_atc' });

/**
 * Scenario: Tracking when clicking the push to online button
 * @param args
 * @returns
 */
export const pushToOnline = (args: Omit<OfflineAddToCartArgs, 'atcCategory'>): OfflineAddToCartDataLayer =>
  offlineAddToCart({ ...args, atcCategory: 'push_to_online' });
