import { GaMetricsCustom } from '../../../metrics';
import { CommonGAEvent, Customer } from '../../../types';

export type AtcCtrCategory = 'offline_atc_click'; //可扩展online

export interface BaseTackAtcCtrArgs {
  transactionId: string;
  customer?: Customer | null;
  category: AtcCtrCategory;
}

export interface BaseTackAtcCtrDataLayer extends CommonGAEvent {
  event: GaMetricsCustom.track_event;
  eventDetails: {
    category: AtcCtrCategory;
  };
  transactionId: string;
  customer?: Customer | null;
}

export const baseAtcCtrTrigger = (args: BaseTackAtcCtrArgs): BaseTackAtcCtrDataLayer => {
  return {
    event: GaMetricsCustom.track_event,
    eventDetails: {
      category: args.category,
    },
    transactionId: args.transactionId,
    customer: args.customer || null,
  };
};
