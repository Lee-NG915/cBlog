import { ButtonBlokV2, TextBlokV2 } from '@castlery/modules-cms-domain';

export interface BestsellersDefaultVariantV2 {
  _uid: string;
  title: TextBlokV2[];
  anchor: {};
  component: 'bestsellers_default_variant_v2';
  description: TextBlokV2[];
  action_button: ButtonBlokV2;
  _editable: string;
}
