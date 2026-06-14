import { LinkClickArgs } from '../../../types';
import { GaMetrics } from '../../../metrics';

export interface LinkClickDataLayer {
  event: GaMetrics.link_click;
  eventDetails: {
    category: string;
    action: string;
    label: string;
    link: string;
  };
}
export const linkClick = (args: LinkClickArgs): LinkClickDataLayer => {
  return {
    event: GaMetrics.link_click,
    eventDetails: {
      category: args.category,
      action: args.action,
      label: args.label,
      link: args.link,
    },
  };
};
