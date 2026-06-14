import type { Variant } from 'components/VariationCard/props';
import type { TabProps } from '@castlery/fortress/Tabs';

export type ProductsProps = {
  wishlist: {
    data: Array<Variant>;
  };
  cartData: {
    line_items: Array<{
      variant: Variant;
    }>;
    [key: string]: any;
  };
  onUnlike: (variant: Variant) => void;
};

export type WishlistTabsProps = TabProps & {
  tabs: string[];
  value?: string | number | null;
  onChange: (e: React.SyntheticEvent | null, value: string | number | null) => void;
};

export type Look = {
  shop_the_look_id: string;
  background_image: string;
};

export type LooksProps = {
  looks: Look[];
  setShowTheLookDetail: (look: Look) => void;
  onUnLikeLook: (look: Look) => void;
};
