import type { Order } from '@castlery/types';

export const itemDescription = (item: Order['line_items'][0], qty: number) => {
  const { variant, product_type, product_layout, bundle_line_items } = item;
  if (!variant) return '';
  const itemName = item.product_type === 'swatch' ? item.variant.name : item.variant.product_name;
  let variantDescription = '';
  if (product_type !== 'bundle' && product_type !== 'swatch') {
    variantDescription =
      variant.variant_option_values?.map((v) => `${v.option_type_presentation}: ${v.presentation}`).join(', ') || '';
  } else if (product_type === 'bundle') {
    if (product_layout === 'bundle_overlay') {
      variantDescription =
        bundle_line_items
          .map((i) =>
            i.bundle_option.bundle_option_type !== 'simple'
              ? `${i.bundle_option.presentation}: ${i.variant.variant_option_values[0].presentation}`
              : ''
          )
          .join(', ') || '';
    } else {
      variantDescription =
        bundle_line_items
          .map((i) => {
            return i.variant.variant_option_values
              .map((v) => `${v.option_type_presentation} - ${v.presentation}`)
              .join(', ');
          })
          .join(', ') || '';
    }
  }

  return `${qty} x ${itemName} ` + (variantDescription ? `(${variantDescription})` : '');
};
