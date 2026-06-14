import { selectCustomerAddresses } from '@castlery/modules-checkout-domain';
import { selectOrderBillingAddress, selectOrderShippingAddress } from '@castlery/modules-order-domain';
import { createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { selectedCustomerId, selectedCurrentZipcode } from '@castlery/modules-user-domain';

export const selectCheckoutAddress = createSelector(
  [selectOrderShippingAddress, selectOrderBillingAddress, selectCustomerAddresses, selectedCurrentZipcode],
  (orderShippingAddress, orderBillingAddress, customerAddressesList, currentZipcode) => {
    const customerAddresses = customerAddressesList.length
      ? customerAddressesList.filter(({ is_valid }) => is_valid)
      : [];
    let shippingAddress = customerAddresses[0];
    let billingAddress = customerAddresses[0];

    const sameZipAddress = customerAddresses.find((address) => address.zipcode === currentZipcode);
    if (sameZipAddress) {
      shippingAddress = sameZipAddress;
    }
    if (orderShippingAddress) {
      if (customerAddresses.find((address) => address.id === orderShippingAddress.id)) {
        shippingAddress = orderShippingAddress;
      }
    }

    if (orderBillingAddress) {
      if (customerAddresses.find((address) => address.id === orderBillingAddress.id)) {
        billingAddress = orderBillingAddress;
      }
    }

    return {
      shippingAddress,
      billingAddress,
    };
  }
);

export const resetAutoOnlineCartSymbol = createAsyncThunk(
  'customer/resetAutoOnlineCartSymbol',
  async (_, { getState }) => {
    const rootState = getState() as any;
    const customerId = selectedCustomerId(rootState);
    const hasSymbol = !!makePersistenceHandles()?.onlineCartSymbol?.hasItem();
    if (!customerId && hasSymbol) {
      makePersistenceHandles()?.onlineCartSymbol?.removeItem();
    }
    return Promise.resolve();
  }
);

export const setAutoOnlineCartSymbol = createAsyncThunk(
  'customer/setAutoOnlineCartSymbol',
  async ({ id, hasOpen }: { id: number; hasOpen: boolean }) => {
    makePersistenceHandles()?.onlineCartSymbol?.setItem(JSON.stringify({ id, hasOpen }));
    return Promise.resolve();
  }
);
