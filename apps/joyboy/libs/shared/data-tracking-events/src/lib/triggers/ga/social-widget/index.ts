import { GaMetricsCustom } from '../../../metrics';

export interface SocialWidgetPayload {
  action:
    | 'widget_impression'
    | 'image_impression'
    | 'arrow_click'
    | 'image_click'
    | 'video_click'
    | 'product_link_click';
  skuName: string; //SKU name for product page that user is on
  skuId: string; //SKU ID for product page that user is on
  label?: string; // Post ID or name of the social post
  position?: string; // Position of the image seen
}

export const socialWidgetTrigger = ({ action, skuName, skuId, label, position }: SocialWidgetPayload) => {
  return {
    event: GaMetricsCustom.track_event,
    'eventDetails.category': 'social_widget',
    'eventDetails.action': action,
    'eventDetails.label': label ?? '',
    'eventDetails.sku_name': skuName,
    'eventDetails.sku_id': skuId,
    'eventDetails.position': position ?? '',
  };
};
