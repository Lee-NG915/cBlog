import { ButtonBlokV2 } from './button-blok.entity';
import { TextBlokV2 } from './text-blok.entity';
export interface BarItemV2 {
  _uid: string;
  title: string;
  anchor_id: string;
  component: string;
  _editable: string;
}
export interface StickyBarDefaultVariantV2 {
  _uid: string;
  bar_items: BarItemV2[];
  component: string;
  button: ButtonBlokV2[];
  visibility: { show: Array<'all' | 'none' | 'tablet' | 'mobile' | 'desktop'> }[];
  _editable: string;
}

export interface StickyButtonBarV2 {
  _uid: string;
  text: TextBlokV2[];
  button: ButtonBlokV2[];
  component: string;
  _editable: string;
}
