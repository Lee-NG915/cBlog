import { createAction } from '@reduxjs/toolkit';

/**
 * @description User clicked the PDP delivery zipcode link to open the shipping-location modal.
 * @scenario Triggered from `product-usp` "Deliver to {city, zipcode}" link on PDP.
 */
export const productShippingZipcodeSelectorClickedEvent = createAction('product/shippingZipcodeSelectorClicked');

/**
 * @description User submitted a new zipcode inside the PDP shipping-location modal.
 * @scenario Triggered from `ShippingLocationModal` when opened from a PDP surface
 *           (caller passes `source="PDP"`).
 */
export const productShippingZipcodeSelectorSubmittedEvent = createAction('product/shippingZipcodeSelectorSubmitted');
