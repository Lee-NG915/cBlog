import type { CommonGAEvent, Sales, Customer } from '../../../types';
import { GaMetricsCustom } from '../../../metrics';

export interface OfflineAccount extends CommonGAEvent {
  event: GaMetricsCustom.track_event;
  eventDetails: {
    category: 'offline_account';
    action: 'sign_up' | 'sign_in';
  };
  customer: Pick<Customer, 'email' | 'id'> | null;
  sales: { name: string } & Pick<Sales, 'id'>;
  retailId: number;
}

export interface OfflineAccountArgs {
  customer: Customer;
  sales: Sales;
  retailId: number;
  /**
   * @default false
   * @description true if the event is triggered by sign up
   * @description false if the event is triggered by sign in
   */
  isSignUp?: boolean;
}

/**
 * @description trigger when created a new customer account at showroom, or customer sign in
 * @important  the event is for customers, not sales.
 * @param args
 * @returns
 */
export const offlineAccount = (args: OfflineAccountArgs): OfflineAccount => {
  const { isSignUp = false, customer, sales, retailId } = args;

  const customerObj = customer ? { id: customer.id, email: customer.email } : null;
  const salesObj = { id: sales.id, name: sales.firstname + ' ' + sales.lastname };
  return {
    event: GaMetricsCustom.track_event,
    eventDetails: {
      category: 'offline_account',
      action: isSignUp ? 'sign_up' : 'sign_in',
    },
    customer: customerObj,
    sales: salesObj,
    retailId,
  };
};
