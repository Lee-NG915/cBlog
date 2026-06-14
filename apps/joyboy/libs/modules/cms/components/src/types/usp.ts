import type { TextStyleBlokV2, LinkBlokV2 } from '@castlery/modules-cms-domain';

export interface UspVariantAV2 {
  _uid: string;
  component: string;
  _editable: string;
  title_style: TextStyleBlokV2[];
  description_style: TextStyleBlokV2[];
  data_source: {
    list: UspVariantAV2DataSource[];
  };
}

export interface UspVariantADemoV2 {
  _uid: string;
  component: 'usp_variant_a_pm_demo';
  _editable: string;
  anchorId: string;
  data_source: string;
  list: UspVariantAItemDemoV2[];
}

export interface UspVariantAItemDemoV2 {
  title: Array<{
    level: string;
  }>;
  description: Array<{
    level: string;
  }>;
  media: {
    filename: string;
  };
}

export interface UspVariantAItemDataDemoV2 {
  title: string;
  description: string;
  media: {
    filename: string;
  };
}

interface UspVariantAV2DataSource {
  _uid: string;
  component: 'usp_varaint_a_list_item_data_v2';
  _editable: string;
  title: string;
  description: string;
  media: {
    filename: string;
  };
}

export interface UspVariantCV2 {
  _uid: string;
  component: string;
  _editable: string;
  link: LinkBlokV2[];
  title_style: TextStyleBlokV2[];
  media_position: 'right' | 'left';
  description_style: TextStyleBlokV2[];
  data_source: UspVariantCV2DataSource;
}

export interface UspVariantCV2DataSource {
  _uid: string;
  component: 'usp_variant_c_data_v2';
  _editable: string;
  title: string;
  description: string;
  media: {
    filename: string;
  };
  cta_url?: string;
  cta_text?: string;
}
