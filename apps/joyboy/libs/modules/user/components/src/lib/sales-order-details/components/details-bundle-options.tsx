import { FortressImage } from '@castlery/shared-components';
import { Box, useBreakpoints } from '@castlery/fortress';

interface DetailBundleOptionsProps {
  lineItem: any;
  sx?: any;
  size?: string;
}

const DetailsBundleOptions = (props: DetailBundleOptionsProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lineItem, sx, size } = props;
  const { mobile } = useBreakpoints();
  if (lineItem.product_type === 'bundle' && lineItem.product_layout !== 'bundle_overlay') {
    return (
      <Box sx={sx}>
        {lineItem.bundle_line_items.map((item: any) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'right',
                alignItems: 'center',
              }}
            >
              {item.variant.images[0] ? (
                <FortressImage
                  ratio={1.499}
                  src={item.variant.images[0].links?.large}
                  alt={item.variant.product_name}
                  imageWidth={size || '100px'}
                />
              ) : (
                <FortressImage ratio={1.499} src={''} imageWidth={size || '100px'} alt={item.variant.product_name} />
              )}
            </Box>
            <Box
              sx={{
                flex: 3,
                textAlign: 'left',
                paddingTop: '5px',
                paddingLeft: !mobile ? '10px' : '5px',
              }}
            >
              <p>
                {item.quantity} x {item.variant.product_name}
              </p>

              {item.variant.variant_option_values.map((v: any) => (
                <p
                  key={v.option_type_id}
                  style={{
                    color: '#888',
                  }}
                >
                  {v.option_type_presentation}: {v.presentation}
                </p>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    );
  } else {
    return null;
  }
};

export default DetailsBundleOptions;
