import type { TextBlokV2, LinkBlokV2 } from '@castlery/modules-cms-domain';
export interface ProductsCollectionBlokV2 {
  _uid: string;
  title: TextBlokV2[];
  component: string;
  description: TextBlokV2[];
  action_button: LinkBlokV2[];
  _editable: string;
}
