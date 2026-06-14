import { GaMetricsCustom } from '../../../metrics';
import type { Customer, Sales } from '../../../types';
import { ObjHelper, SalesHelper } from '../../../adapters';

export type CouponEventCategory = 'offline_coupon' | 'online_coupon';

export type CouponEventAction = 'add_coupon' | 'select_coupon' | 'redeem_coupon';

export interface BaseTrackCouponArgs {
  category: CouponEventCategory;
  action: CouponEventAction;
  customer?: Customer | null;
  sales: Sales;
  transactionId: string;
}

export interface BaseTrackCouponDataLayer {
  event: GaMetricsCustom.track_event;
  eventDetails: {
    category: CouponEventCategory;
    action: CouponEventAction;
  };
  customer: Pick<Customer, 'email' | 'id'> | null;
  sales: Pick<Sales, 'name'>;
  transactionId: string; //order number
}

export const baseCouponTrigger = (args: BaseTrackCouponArgs): BaseTrackCouponDataLayer => {
  const { category, action, customer, sales, transactionId } = args;

  return {
    event: GaMetricsCustom.track_event,
    eventDetails: {
      category: category,
      action: action,
    },
    customer: ObjHelper.get(customer, ['email', 'id']) as Pick<Customer, 'email' | 'id'> | null,
    sales: {
      name: SalesHelper.getFullName(sales),
    },
    transactionId: transactionId,
  };
};
