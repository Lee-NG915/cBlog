/* eslint-disable @typescript-eslint/no-explicit-any */
/* cspell: disable */

import { ButtonBlokV2 } from './button-blok.entity';
import { TextBlokV2 } from './text-blok.entity';

export interface HotspotsV2 {
  component: string;
  name: string;
  popup: string;
  variant_id: string;
  x: string;
  y: string;
  _editable: string;
  _uid: string;
}

export interface TipsV2 {
  component: string;
  name: string;
  popup: string;
  variant_id: string;
  title: string;
  description: string;
  x: string;
  y: string;
  _editable: string;
  _uid: string;
}

export interface TheLookComponentV2 {
  look_name: string;
  _uid: string;
  component: string;
  hotspots: HotspotsV2[];
  image: string;
  tips: TipsV2[];
  _editable: string;
  collection_name: string;
}

export interface shopTheLookDataV2 {
  _uid: string;
  sku_id: string;
  cta_link: string;
  component: string;
  look_name: string;
  look_type: string;
  _editable: string;
}

export interface ShopTheLookBlokV2 {
  _uid: string;
  component: string;
  _editable: string;
  anchor: string;
  cta_link_type: string;
  cta_btn: ButtonBlokV2[];
  data_source: shopTheLookDataV2[];
  description: TextBlokV2[];
  title: TextBlokV2[];
}
