// import type { Image, VariantOptionValue } from './product.entity';
export type GlobalShopTheLookResponse = Record<string, any>;
export interface HotspotsType {
  component: string;
  name: string;
  popup: string;
  variant_id: string;
  x: string;
  y: string;
  _editable: string;
  _uid: string;
}

export interface TipsType {
  component: string;
  name: string;
  popup: string;
  variant_id: string;
  x: string;
  y: string;
  _editable: string;
  _uid: string;
}

export interface ShopTheLookType {
  _uid: string;
  component: string;
  _editable: string;
  anchor: string;
  cta_link_type: string;
  cta_text: string;
  data_source: string;
  description: any[];
  title: any[];
}
