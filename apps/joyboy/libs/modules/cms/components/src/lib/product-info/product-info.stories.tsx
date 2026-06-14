'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { ProductInfo, ProductInfoProps } from './product-info';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { changeProduct, getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
import { useEffect } from 'react';
import { ProductInfoArgs, ProductInfoArgTypes } from './product-info.stories.args';
import { ProductInfoV2 } from '@castlery/modules-cms-domain';
import { Stack } from '@castlery/fortress';

const ProductInfoDecorator = (Story: () => any) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchData = async () => {
      const result = await dispatch(
        getProductByIdOrSlugThunk({
          idOrSlug: 'owen-chaise-sectional-sofa',
        })
      );
      dispatch(changeProduct(result?.payload));
    };

    fetchData();
  }, [dispatch]);

  return <Story />;
};

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'CMS/ProductInfo',
  component: ProductInfo,
  argTypes: ProductInfoArgTypes,
  decorators: [ProductInfoDecorator],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/rCAKNNDsMcov8XW9rtCbsP/%5BASH%5D-PLA-Revamp?node-id=1213-18658&m=dev',
    },
  },
} as Meta<ProductInfoProps>;
export default meta;

type Story = StoryObj<ProductInfoV2>;

// const mockProduct: Product = {
//   id: 1,
//   name: 'Test Sofa',
//   slug: 'test-sofa',
//   description: 'A comfortable test sofa',
//   product_type: 'configurable',
//   price: '999',
//   tags: [],
//   max_sale_qty: 10,
//   min_sale_qty: 1,
//   qty_increments: 1,
//   show_free_swatch: false,
//   product_layout: 'default',
//   warning_message: '',
//   meta_title: '',
//   meta_description: '',
//   meta_keywords: '',
//   available_on: '',
//   list_price: '0',
//   discontinued: false,
//   taxons: [],
//   option_types: [],
//   variants: [
//     {
//       id: 1,
//       images: [
//         {
//           links: {
//             feed: 'https://example.com/image.jpg',
//             large: '',
//             large_gray: '',
//           },
//           position: 0,
//           type: '',
//         },
//       ],
//       assets: [
//         {
//           type: 'lifestyle',
//           links: {
//             feed: 'https://res.cloudinary.com/castlery/image/upload/w_1995,f_auto,q_auto/v1731467616/PLA%20-%20UAT/Owen%20Chaise%20Sectional%20Sofa/1_Main%20Banner/Owen_MainBanner.png',
//             large: '',
//             large_gray: '',
//           },
//           position: 0,
//         },
//       ],
//       name: '',
//       overlay: {
//         links: {
//           large_overlay: '',
//           large_x2_overlay: '',
//           medium_overlay: '',
//           medium_x2_overlay: '',
//           mini_overlay: '',
//           mini_x2_overlay: '',
//           small_overlay: '',
//           small_x2_overlay: '',
//         },
//       },
//       sku: '',
//       product_id: 0,
//       price: '',
//       list_price: '',
//       product_slug: '',
//       product_name: '',
//       is_customized: false,
//       discontinued: false,
//       tags: [],
//       badges: [],
//       variant_properties: {
//         product_details: [],
//         product_dimensions: [],
//         delivery_returns: [],
//         comfort_ratings: [],
//       },
//       variant_option_values: [],
//       dimension_image: {
//         links: {
//           feed: 'https://example.com/dimension-image.jpg',
//           large: '',
//           large_gray: '',
//         },
//         position: 0,
//       },
//       threed_images: [],
//       assembly_files: [],
//     },
//   ],
//   breadcrumbs: [],
//   product_properties: {
//     product_details: [],
//     product_dimensions: [],
//     delivery_returns: [],
//     comfort_ratings: [],
//   },
//   related_products: [],
//   collections: [],
//   reviews: {
//     average_rating: 0,
//     reviews: [],
//     total_count: 0,
//   },
//   customizations: [],
// };

// const ProductInfoWrapper = (args: any) => {
//   const dispatch = useAppDispatch();
//   useEffect(() => {
//     const fetchData = async () => {
//       const result = await dispatch(
//         getProductByIdOrSlugThunk({
//           idOrSlug: 'owen-chaise-sectional-sofa',
//         })
//       );
//       dispatch(changeProduct(result?.payload));
//     };

//     fetchData();
//   }, [dispatch]);

//   return (
//     <Stack>
//       <ProductInfo {...args} />
//     </Stack>
//   );
// };

export const Primary: Story = {
  args: ProductInfoArgs,
  render: (args) => <ProductInfo blok={args as ProductInfoV2} />,
};
