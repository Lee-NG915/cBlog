import type { SxProps } from '@castlery/fortress';

export type Variant = {
  id?: number;
  tags: string[];
  badges?: string[];
  price: number;
  product_name: string;
  name: string;
  product_type: string;
  product_layout: string;
  // option_type_name, option_type_id
  product_bundle_options: Array<{
    option_product_name: string;
  }>;
  variant_option_values: Array<{
    presentation: string;
  }>;
  images: Array<{
    //  PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
    links: string;
  }>;
  list_price: number;
  sku: string;
  min_sale_qty: number;
};

export type ActionCardProps = {
  variant: Variant;
  cardSx?: SxProps;
  cartData: {
    line_items: Array<{
      variant: Variant;
    }>;
    [key: string]: any;
  };
  loading?: boolean;
  handleAddToCart?: (variant: Variant, hasAddToCart: boolean) => void;
  handleRemoveWishlist?: (variant: Variant) => void;
  handleClick?: (variant: Variant) => void;
};
