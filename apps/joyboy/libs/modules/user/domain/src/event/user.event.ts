import {
  updateUserProfile,
  updateReview,
  getCustomerReviews,
  getCurrentUser,
  getUserSubscriptions,
  updateUserSubscriptions,
  createUserSubscriptions,
  recoverPassword,
} from '../api/user.api';
import {
  deleteCustomerAddress,
  updateCustomerAddress,
  createCustomerAddress,
  getCustomerAddress,
} from '../api/address.api';
import { isAnyOf } from '@reduxjs/toolkit';

export const userProfileUpdatedEvent = updateUserProfile.matchFulfilled;
export const userGetEvent = getCurrentUser.matchFulfilled;
export const userAddressDeletedEvent = deleteCustomerAddress.matchFulfilled;
export const userAddressUpdatedEvent = updateCustomerAddress.matchFulfilled;
export const userAddressCreatedEvent = createCustomerAddress.matchFulfilled;
export const userAddressGetEvent = getCustomerAddress.matchFulfilled;
export const customerReviewUpdatedEvent = updateReview.matchFulfilled;
export const customerReviewGetEvent = getCustomerReviews.matchFulfilled;
export const userSubscriptionsGetEvent = getUserSubscriptions.matchFulfilled;
export const userSubscriptionsUpdatedEvent = updateUserSubscriptions.matchFulfilled;
export const userSubscriptionsCreatedEvent = createUserSubscriptions.matchFulfilled;

export const userAddressGetRejectedEvent = getCustomerAddress.matchRejected;
export const userAddressDeletedRejectedEvent = deleteCustomerAddress.matchRejected;
export const useProfileUpdatedRejectedEvent = updateUserProfile.matchRejected;
export const userAddressUpdatedRejectedEvent = updateCustomerAddress.matchRejected;
export const userAddressCreatedRejectedEvent = createCustomerAddress.matchRejected;
export const customerReviewUpdatedRejectedEvent = updateReview.matchRejected;
export const customerReviewGetRejectedEvent = getCustomerReviews.matchRejected;
export const userSubscriptionsGetRejectedEvent = getUserSubscriptions.matchRejected;
export const userSubscriptionsUpdatedRejectedEvent = updateUserSubscriptions.matchRejected;
export const userSubscriptionsCreatedRejectedEvent = createUserSubscriptions.matchRejected;
export const recoverPasswordRejectedEvent = recoverPassword.matchRejected;
export const customerApiErrorEvent = isAnyOf(
  userAddressDeletedRejectedEvent,
  useProfileUpdatedRejectedEvent,
  customerReviewUpdatedRejectedEvent,
  customerReviewGetRejectedEvent,
  userSubscriptionsUpdatedRejectedEvent,
  recoverPasswordRejectedEvent
  // userAddressUpdatedRejectedEvent,
  // userAddressCreatedRejectedEvent
);

export const customerAddressUpdatedEvent = isAnyOf(
  userAddressDeletedEvent,
  userAddressUpdatedEvent,
  userAddressCreatedEvent
);

// export const userNeedUpdatedEvent = isAnyOf(
//   // userSubscriptionsUpdatedEvent,
//   userProfileUpdatedEvent,
//   userSubscriptionsCreatedEvent
// );
