import { getYotpoCustomerDetails } from '../api/yotpo.api';
export const yotpoDetailsRefreshedEvent = getYotpoCustomerDetails.matchFulfilled;
