import type { ButtonBlokV2 } from './button-blok.entity';
import type { TextBlokV2 } from './text-blok.entity';

export interface ProductInfoV2 {
  _uid: string;
  component: string;
  _editable: string;
  data_source: ProductInfoV2DataSource[];
  description_style: Pick<TextBlokV2, 'text_color' | 'text_level'>[];
  button: ButtonBlokV2[];
  show_price: boolean;
  show_cta: boolean;
  reviewsAnchorId?: string;
}

export interface ProductInfoV2DataSource {
  _uid: string;
  component: 'pla_data_selector_v2';
  _editable: string;
  image_url?: string;
  description?: string;
}
