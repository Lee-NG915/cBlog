/* eslint-disable array-callback-return */
import { Box } from '@castlery/fortress';

interface DetailLineOptionsProps {
  lineItem: any;
  sx?: any;
}

const DetailsLineOptions = (props: DetailLineOptionsProps) => {
  const { lineItem, sx } = props;
  if (lineItem.product_type !== 'bundle' && lineItem.product_type !== 'swatch') {
    return (
      <Box sx={sx}>
        {lineItem.variant.variant_option_values.map((v: any) => (
          <p key={v.option_value_id}>
            {v.option_type_presentation}: {v.presentation}
          </p>
        ))}
      </Box>
    );
  } else if (lineItem.product_type === 'bundle' && lineItem.product_layout === 'bundle_overlay') {
    return (
      <Box sx={sx}>
        {lineItem.bundle_line_items.map((i: any) => {
          if (i.bundle_option.bundle_option_type !== 'simple') {
            return (
              <p key={i.id}>
                {i.bundle_option.presentation}: {i.variant.variant_option_values[0].presentation}
              </p>
            );
          }
        })}
      </Box>
    );
  } else {
    return null;
  }
};

export default DetailsLineOptions;
