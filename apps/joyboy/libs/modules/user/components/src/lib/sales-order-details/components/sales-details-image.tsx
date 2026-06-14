import { Box, useBreakpoints } from '@castlery/fortress';
import { FortressImage, defaultImage } from '@castlery/shared-components';

interface SalesDetailsImageProps {
  lineItem: any;
  sx?: any;
}

const SalesDetailsImage = (props: SalesDetailsImageProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lineItem, sx } = props;
  const { desktop, mobile, sm, xl } = useBreakpoints();
  let imageComponent;
  if (lineItem.variant.images[0]) {
    // deal with bundle_overlay layout
    const overlays: {
      mini: any;
      mini_x2: any;
      small: any;
      small_x2: any;
      medium: any;
      medium_x2: any;
      large: any;
      large_x2: any;
    }[] = [
      // {
      //   large:
      //     'https://res.cloudinary.com/castlery/image/private/w_500,f_auto,q_auto/b_rgb:F3F3F3,c_fit/v1632822833/crusader/variants/PB-DR162/Theo-Round-Dining-Table-With-4-Joshua-Chairs-Pearl-Beige.jpg',
      // },
      // {
      //   large: 'https://img.castlery.sg/bundles/overlay_images/194874/large_overlay/Charcoal-Grey_2.png?1632822437',
      // } as any,
    ];
    if (lineItem.product_type === 'bundle' && lineItem.product_layout === 'bundle_overlay') {
      lineItem.bundle_line_items.forEach((i: any) => {
        if (i.bundle_option.bundle_option_type !== 'simple') {
          const overlay = i.variant.overlay;
          if (overlay) {
            const _links = overlay.links;
            overlays.push({
              mini: _links.mini_overlay,
              mini_x2: _links.mini_x2_overlay,
              small: _links.small_overlay,
              small_x2: _links.small_x2_overlay,
              medium: _links.medium_overlay,
              medium_x2: _links.medium_x2_overlay,
              large: _links.large_overlay,
              large_x2: _links.large_x2_overlay,
            });
          }
        }
      });
    }
    imageComponent = (
      <Box
        sx={{
          ...sx,
          padding: lineItem.product_type === 'swatch' ? '0 20px' : '',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {overlays.length > 0 ? (
          <Box
            sx={{
              flex: '1',
              position: 'relative',
              height: '100%',
              minWidth: mobile ? '90px' : sm ? '120px' : desktop ? '90px' : xl ? '120px' : '',
            }}
          >
            {[lineItem.variant.images[0].links, ...overlays].map((item) => {
              // {[...overlays].map((item) => {
              return (
                <FortressImage
                  ratio={lineItem.product_type === 'swatch' ? 1 : 1.499}
                  objectFit={lineItem.product_type === 'swatch' ? 'cover' : 'contain'}
                  src={item.large}
                  alt={lineItem.product_type === 'swatch' ? lineItem.variant.name : lineItem.variant.product_name}
                  imageWidth={mobile ? '90px' : sm ? '120px' : desktop ? '90px' : xl ? '120px' : ''}
                  lazy={false}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              );
            })}
          </Box>
        ) : (
          <FortressImage
            ratio={lineItem.product_type === 'swatch' ? 1 : 1.499}
            objectFit={lineItem.product_type === 'swatch' ? 'cover' : 'contain'}
            src={lineItem.variant.images[0].links?.large}
            alt={lineItem.product_type === 'swatch' ? lineItem.variant.name : lineItem.variant.product_name}
            imageWidth={mobile ? '90px' : sm ? '120px' : desktop ? '90px' : xl ? '120px' : ''}
            lazy={false}
            sx={{
              flex: '0 0 auto',
            }}
          />
        )}
      </Box>
    );
  } else {
    imageComponent = (
      <Box sx={sx}>
        <FortressImage ratio={1.499} src={defaultImage(700)} alt={lineItem.variant.product_name} imageWidth={'100px'} />
      </Box>
    );
  }
  return imageComponent;
};

export default SalesDetailsImage;
