import { createAction } from '@reduxjs/toolkit';

/**
 * @description User clicked the PLP Quickship zipcode link to open the shipping-location modal.
 * @scenario Triggered from `quickship-toggle-refinement` on the PLP/Quickship surface.
 */
export const quickshipZipcodeSelectorClickedEvent = createAction('search/quickshipZipcodeSelectorClicked');

/**
 * @description User submitted a new zipcode inside the PLP/Quickship shipping-location modal.
 * @scenario Triggered from `ShippingLocationModal` when opened from a Quickship surface
 *           (caller passes `source="Quickship"`).
 */
export const quickshipZipcodeSelectorSubmittedEvent = createAction('search/quickshipZipcodeSelectorSubmitted');
