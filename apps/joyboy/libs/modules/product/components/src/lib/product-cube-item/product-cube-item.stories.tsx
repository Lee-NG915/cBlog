import type { Meta, StoryObj } from '@storybook/react';
import { ProductCubeItem } from './product-cube-item';

const meta: Meta<typeof ProductCubeItem> = {
  component: ProductCubeItem,
  title: 'module/product/ProductCubeItem',
  argTypes: {},
};
export default meta;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof ProductCubeItem>;

export const Primary = {
  args: {
    _index: 'web_product_9d61ef34-c766-4396-8f00-fce9686a030f',
    _type: '_doc',
    _id: '4892',
    _score: 1.2416115,
    _source: {
      id: 4892,
      name: 'Jonathan Sofa',
      slug: 'jonathan-sofa',
      price: 1199.0,
      product_type: 'configurable',
      product_layout: 'configurable',
      rank: 177.0,
      styles: [],
      taxons: [
        {
          name: '3 Seater Sofas',
          permalink: 'sofa-armchairs/3-seater-sofas',
          position: 2,
          level: 2,
          value: '3 Seater Sofas',
          ancestors: ['Category', 'Sofa \u0026 Armchairs'],
        },
        {
          name: 'Jonathan Collection',
          permalink: 'jonathan-collection',
          position: 6,
          level: 1,
          value: 'Jonathan Collection',
          ancestors: ['Collections'],
        },
        {
          name: 'Collections',
          permalink: 'collections',
          position: 891,
          level: 0,
          value: 'Collections',
          ancestors: [],
        },
        {
          name: 'Sofa \u0026 Armchairs',
          permalink: 'sofa-armchairs',
          position: 19,
          level: 1,
          value: 'Sofa \u0026 Armchairs',
          ancestors: ['Category'],
        },
        {
          name: 'Category',
          permalink: 'category',
          position: 1331,
          level: 0,
          value: 'Category',
          ancestors: [],
        },
      ],
      category_count: 5,
      categories: [
        {
          name: 'Menu',
          permalink: 'menu',
        },
        {
          name: 'Sofas',
          permalink: 'sofas',
        },
        {
          name: '3 Seater Sofas',
          permalink: 'sofas/3-seater-sofas',
        },
        {
          name: 'Collections',
          permalink: 'collections',
        },
        {
          name: 'Jonathan Collection',
          permalink: 'jonathan-collection',
        },
      ],
      images: [],
      variants: [
        {
          id: 27480,
          name: 'Jonathan Sofa, Performance Creamy White',
          sku: 'AS-000198-PT4001',
          color: 'white',
          lead_time: 8,
          lead_time_presentation: 'Within Apr  9 - Apr 16',
          in_stock_regions: ['sg'],
          product_short_description: 'Modular, Low-Profile',
          price: '1569.0',
          list_price: '1569.0',
          is_customized: false,
          available_quantity: 99,
          tags: [
            'bestsellers',
            'modular_sofas',
            'all_sofa',
            'style_moderncontemporary',
            'rounded_furniture',
            'low_profile_pieces',
            'u_c_shaped_sofa',
            'cosy_furniture',
            'minimalist_furniture',
            's3_event (do not use)',
            'all products',
          ],
          badges: [],
          images: [
            {
              mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              small:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              medium:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              large:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              mini_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              small_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              medium_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              large_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              mini_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              small_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              medium_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              large_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              mini_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              small_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              medium_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              large_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
              feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
            },
          ],
          life_style_image: {
            mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            small:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            medium:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            large:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            mini_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            small_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            medium_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            large_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            mini_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            small_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            medium_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            large_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            mini_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            small_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            medium_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            large_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
            feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
          },
          option_values: {
            material: {
              value: 'twill_creamy_white',
              presentation: 'Performance Creamy White',
              image_src:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1683189280/crusader/variants/PT-4001/Jonathan-Side-Right-Chaise-Sofa-Creamy-White-Det_6-1683189277.jpg',
            },
          },
          properties: {
            general_dimensions: 'W228 x D100 x H70cm',
            assembly_condition: 'Fully Assembled',
            length: 228,
            material_filter: ['Fabric', 'Performance Fabric'],
            overall_sit_rating: 2,
            seat_depth_rating: 4,
            seat_height_rating: 3,
            seat_softness_rating: 2,
            packaging_dimensions: '2 Boxes',
            product_weight: '57.6 kg',
            max_bearing_support: '2 x 150 kg',
          },
        },
        {
          id: 25808,
          name: 'Jonathan Sofa, Zenith Blue',
          sku: 'AS-000198-GI4001',
          color: 'blue',
          lead_time: 140,
          lead_time_presentation: 'Within Aug 19 - Aug 26',
          in_stock_regions: [],
          product_short_description: 'Modular, Low-Profile',
          price: '1499.0',
          list_price: '1499.0',
          is_customized: false,
          available_quantity: 99,
          tags: [
            'midcenturymodern',
            'bestsellers',
            'modular_sofas',
            'all_sofa',
            'style_moderncontemporary',
            'u_c_shaped_sofa',
            'cosy_furniture',
            'minimalist_furniture',
            's3_event (do not use)',
            'all products',
          ],
          badges: [],
          images: [
            {
              mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              small:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              medium:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              large:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              mini_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              small_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              medium_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              large_x2:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              mini_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              small_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              medium_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              large_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              mini_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              small_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              medium_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              large_x2_gray:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
              feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1623898741/crusader/variants/T50440972-GI4001/Jonathan-3-Seater-Sofa-Zenith-Blue-Front.jpg',
            },
          ],
          life_style_image: {
            mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            small:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            medium:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            large:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            mini_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            small_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            medium_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            large_x2:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            mini_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            small_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            medium_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            large_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            mini_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            small_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            medium_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            large_x2_gray:
              'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
            feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1625423459/crusader/variants/T50440972-GI4001/Jonathan-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
          },
          option_values: {
            material: {
              value: 'zenith_blue',
              presentation: 'Zenith Blue',
              image_src:
                'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1627541548/crusader/variants/GI-4001/Doris-Zenith-Blue_1.jpg',
            },
          },
          properties: {
            general_dimensions: 'W228 x D100 x H70cm',
            assembly_condition: 'Fully Assembled',
            length: 228,
            material_filter: ['Fabric'],
            overall_sit_rating: 2,
            seat_depth_rating: 4,
            seat_height_rating: 3,
            seat_softness_rating: 2,
            packaging_dimensions: '2 Boxes',
            product_weight: '57.6 kg',
            max_bearing_support: '2 x 150 kg',
          },
        },
      ],
    },
    sort: [1.2416115, 177.0],
  },
};
