import { createAction } from '@reduxjs/toolkit';

/**
 * Dispatched explicitly after a user address is saved (create or update)
 * within the checkout shipping address selection flow.
 *
 * Unlike createCustomerAddressV2/updateCustomerAddressV2 which are shared
 * user-service endpoints also used on the payment billing address flow,
 * this event carries explicit intent: the save happened in the checkout
 * shipping context and the checkout address list should be refreshed.
 */
export const checkoutShippingAddressSavedEvent = createAction<{ addressId: number }>('checkout/shippingAddressSaved');
