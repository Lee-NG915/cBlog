import { createAction } from '@reduxjs/toolkit';

/**
 * @description User clicked the cart icon in the website navigation bar.
 * Fires on every click; no page-view or session deduping.
 */
export const cartIconClickedEvent = createAction('product/cartIconClicked');
