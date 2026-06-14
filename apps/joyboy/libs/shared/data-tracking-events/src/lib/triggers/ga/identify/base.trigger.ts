import type { CommonGAEvent, Customer } from '../../../types';
import { GaMetricsCustom } from '../../../metrics';

export interface IdentifyUserEvent extends CommonGAEvent {
  event: GaMetricsCustom.track_event;
  eventDetails: {
    category: 'Account';
    action: 'identify';
    label: string;
    method: 'log in' | 'signed in' | '';
    dimension5: string;
    dimension6: string;
    dimension7: string;
  };
}

/**
 * @description trigger when customer login, or customer sign in
 * @important  the event is for customers
 * @param args
 * @returns
 */
export const identifyUser = (args: { customer: Customer; isSignup?: boolean }): IdentifyUserEvent => {
  const { id, email, firstname, lastname } = args.customer;
  const method = typeof args.isSignup === 'undefined' ? '' : args.isSignup ? 'signed in' : 'log in';

  return {
    event: GaMetricsCustom.track_event,
    eventDetails: {
      category: 'Account',
      action: 'identify',
      label: `${id}`,
      method: method,
      dimension5: email,
      dimension6: firstname || '',
      dimension7: lastname || '',
    },
  };
};
