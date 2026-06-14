import { ButtonBlokV2 } from './button-blok.entity';
import { TextBlokV2 } from './text-blok.entity';

export interface ReviewsDefaultVariantV2 {
  _uid: string;
  title: TextBlokV2[];
  description: TextBlokV2[];
  action_button: ButtonBlokV2[];
  show_scroll_bar: boolean;
  reviews_list_length: string;
  show_back_forth_button: boolean;
  component: string;
  _editable: string;
}
