import type { Meta, StoryObj } from '@storybook/react';
import { PLPListing } from './plp-listing';

const meta: Meta<typeof PLPListing> = {
  component: PLPListing,
  title: 'module/product/PLPListing',
  argTypes: {},
};
export default meta;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof PLPListing>;

export const Primary = {
  args: {
    list: [
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4892',
        _score: 1.3337239,
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
              lead_time_presentation: 'Within Apr 10 - Apr 17',
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
              lead_time_presentation: 'Within Aug 20 - Aug 27',
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
        sort: [1.3337239, 177.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4878',
        _score: 1.1968781,
        _source: {
          id: 4878,
          name: 'Jonathan Leather Sofa',
          slug: 'jonathan-leather-sofa',
          price: 1999.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 4.0,
          styles: [],
          taxons: [
            {
              name: 'Jonathan Collection',
              permalink: 'jonathan-collection',
              position: 12,
              level: 1,
              value: 'Jonathan Collection',
              ancestors: ['Collections'],
            },
            {
              name: '3 Seater Sofas',
              permalink: 'sofa-armchairs/3-seater-sofas',
              position: 7,
              level: 2,
              value: '3 Seater Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 914,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 26,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1359,
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
              id: 25745,
              name: 'Jonathan Leather Sofa, Caramel',
              sku: '54000027-LE4016',
              color: 'brown',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Genuine Top Grain Leather, Low-Profile',
              price: '2299.0',
              list_price: '2299.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'midcenturymodern',
                'modern_farmhouse',
                'modern_contemporary',
                'fall',
                'top_bestsellers',
                'all_sofa',
                'style_moderncontemporary',
                's3_event_tag',
                'cosy_furniture',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1626925044/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Brown-Front.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1626926298/crusader/variants/54000027-LE4016/Jonathan-3-Seater-Sofa-Leather-Brown-Lifestyle-Crop.jpg',
              },
              option_values: {
                material: {
                  value: 'caramel',
                  presentation: 'Caramel',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1626941764/crusader/variants/LE-4016/Jonathan-Sofa-Brown_1.jpg',
                },
              },
              properties: {
                general_dimensions: 'W225 x D100 x H70cm',
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                assembly_condition: 'Fully Assembled',
                material_filter: ['Leather'],
                length: 225,
                packaging_dimensions: '2 Boxes',
                product_weight: '63.8 kg',
                max_bearing_support: '2 x 150kg',
              },
            },
            {
              id: 25746,
              name: 'Jonathan Leather Sofa, Warm Taupe',
              sku: '54000027-LE4017',
              color: 'brown',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg', 'sg'],
              product_short_description: 'Genuine Top Grain Leather, Low-Profile',
              price: '2299.0',
              list_price: '2299.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'midcenturymodern',
                'modern_farmhouse',
                'modern_contemporary',
                'fall',
                'all_sofa',
                'style_moderncontemporary',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1626926337/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Front.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1626926452/crusader/variants/54000027-LE4017/Jonathan-3-Seater-Sofa-Taupe-Lifestyle-Crop.jpg',
              },
              option_values: {
                material: {
                  value: 'warm_taupe',
                  presentation: 'Warm Taupe',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1626941786/crusader/variants/LE-4017/Jonathan-Sofa-Taupe_1.jpg',
                },
              },
              properties: {
                general_dimensions: 'W225 x D100 x H70cm',
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                assembly_condition: 'Fully Assembled',
                material_filter: ['Leather'],
                length: 225,
                packaging_dimensions: '2 Boxes',
                product_weight: '63.8 kg',
                max_bearing_support: '2 x 150kg',
              },
            },
          ],
        },
        sort: [1.1968781, 4.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '5542',
        _score: 1.1968781,
        _source: {
          id: 5542,
          name: 'Marlow Armless Sofa',
          slug: 'marlow-armless-sofa',
          price: 2024.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 216.0,
          styles: [],
          taxons: [
            {
              name: 'Modular Armless Sofas',
              permalink: 'sofa-armchairs/modular-armless-sofas',
              position: 9,
              level: 2,
              value: 'Modular Armless Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1939,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 203,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Limited Edition Collection',
              permalink: 'limited edition collection',
              position: 5,
              level: 1,
              value: 'Limited Edition Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 1281,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Marlow Collection',
              permalink: 'marlow-collection',
              position: 7,
              level: 1,
              value: 'Marlow Collection',
              ancestors: ['Collections'],
            },
          ],
          category_count: 8,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
            },
            {
              name: 'Collections',
              permalink: 'collections',
            },
            {
              name: 'Limited Edition Collection',
              permalink: 'limited edition collection',
            },
            {
              name: 'Marlow Collection',
              permalink: 'marlow-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 32256,
              name: 'Marlow Armless Sofa, Chai Revival',
              sku: '50440861-TA4003',
              color: 'multi',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Channel Tufted, Curved Back, Chai',
              price: '2024.0',
              list_price: '2024.0',
              is_customized: false,
              available_quantity: 99,
              tags: ['limited edition', 'new'],
              badges: ['Limited Edition', 'new_arrival'],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1695628839/crusader/variants/50440861-TA4003/Marlow-Armless-Sofa-Chai-Revival-Front-1695628836.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'chai_revival',
                  presentation: 'Chai Revival',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1695625663/crusader/variants/TA-4003/Marlow-Armless-2-Seater-Sofa-Chai-Revival-Square-Det_2-1695625660.jpg',
                },
              },
              properties: {
                assembly_condition: 'Legs to be Fitted',
                max_bearing_support: '150 kg',
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                material_filter: ['Fabric'],
                general_dimensions: 'W88 x D98 x H76cm',
                product_weight: '23.8 kg',
                length: 88,
                packaging_dimensions: '1 Box',
              },
            },
          ],
        },
        sort: [1.1968781, 216.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '5541',
        _score: 1.1968781,
        _source: {
          id: 5541,
          name: 'Marlow Wedge Sofa',
          slug: 'marlow-wedge-sofa',
          price: 2024.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 217.0,
          styles: [],
          taxons: [
            {
              name: 'Modular Corner Sofas',
              permalink: 'sofa-armchairs/modular-corner-sofas',
              position: 12,
              level: 2,
              value: 'Modular Corner Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1940,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 204,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Limited Edition Collection',
              permalink: 'limited edition collection',
              position: 4,
              level: 1,
              value: 'Limited Edition Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 1280,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Marlow Collection',
              permalink: 'marlow-collection',
              position: 8,
              level: 1,
              value: 'Marlow Collection',
              ancestors: ['Collections'],
            },
          ],
          category_count: 8,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
            },
            {
              name: 'Collections',
              permalink: 'collections',
            },
            {
              name: 'Limited Edition Collection',
              permalink: 'limited edition collection',
            },
            {
              name: 'Marlow Collection',
              permalink: 'marlow-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 32254,
              name: 'Marlow Wedge Sofa, Chai Revival',
              sku: '50440860-TA4003',
              color: 'multi',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Channel Tufted, Curved Back, Chai',
              price: '2024.0',
              list_price: '2024.0',
              is_customized: false,
              available_quantity: 99,
              tags: ['limited edition', 'new'],
              badges: ['Limited Edition', 'new_arrival'],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1695628747/crusader/variants/50440860-TA4003/Marlow-Wedge-Sofa-Chai-Revival-Front-1695628744.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'chai_revival',
                  presentation: 'Chai Revival',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1695625663/crusader/variants/TA-4003/Marlow-Armless-2-Seater-Sofa-Chai-Revival-Square-Det_2-1695625660.jpg',
                },
              },
              properties: {
                assembly_condition: 'Legs to be Fitted',
                max_bearing_support: '150 kg',
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                material_filter: ['Fabric'],
                general_dimensions: 'W125 x D100 x H76cm',
                packaging_dimensions: '1 Box',
                length: 125,
                product_weight: '28 kg',
              },
            },
          ],
        },
        sort: [1.1968781, 217.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4853',
        _score: 1.1968781,
        _source: {
          id: 4853,
          name: 'Jonathan Armless Sofa',
          slug: 'jonathan-armless-sofa',
          price: 499.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 267.0,
          styles: [],
          taxons: [
            {
              name: 'Modular Armless Sofas',
              permalink: 'sofa-armchairs/modular-armless-sofas',
              position: 2,
              level: 2,
              value: 'Modular Armless Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Jonathan Collection',
              permalink: 'jonathan-collection',
              position: 2,
              level: 1,
              value: 'Jonathan Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 887,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 15,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1327,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
          ],
          category_count: 7,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
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
              id: 27456,
              name: 'Jonathan Armless Sofa, Performance Creamy White',
              sku: '54000094-PT4001',
              color: 'white',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Modular, Low-Profile',
              price: '569.0',
              list_price: '569.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'u_c_shaped_sofa',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801213/crusader/variants/54000094-PT4001/Jonathan-Armless-Sofa-Performance-Creamy-White-Front-1683801210.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'twill_creamy_white',
                  presentation: 'Performance Creamy White',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1683189280/crusader/variants/PT-4001/Jonathan-Side-Right-Chaise-Sofa-Creamy-White-Det_6-1683189277.jpg',
                },
              },
              properties: {
                assembly_condition: 'Fully Assembled',
                general_dimensions: 'W88 x D100 x H70cm',
                length: 88,
                material_filter: ['Fabric', 'Performance Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '1 Box',
                max_bearing_support: '150 kg',
                product_weight: '21.7 kg',
              },
            },
            {
              id: 25609,
              name: 'Jonathan Armless Sofa, Zenith Blue',
              sku: '54000014-GI4001',
              color: 'blue',
              lead_time: 140,
              lead_time_presentation: 'Within Aug 20 - Aug 27',
              in_stock_regions: [],
              product_short_description: 'Modular, Low-Profile',
              price: '549.0',
              list_price: '549.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'modern_contemporary',
                'fall',
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'u_c_shaped_sofa',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1623900723/crusader/variants/54000014-GI4001/Jonathan-Armless-Sofa-Zenith-Blue-Front.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'zenith_blue',
                  presentation: 'Zenith Blue',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1627541548/crusader/variants/GI-4001/Doris-Zenith-Blue_1.jpg',
                },
              },
              properties: {
                assembly_condition: 'Fully Assembled',
                general_dimensions: 'W88 x D100 x H70cm',
                length: 88,
                material_filter: ['Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '1 Box',
                max_bearing_support: '150 kg',
                product_weight: '21.7 kg',
              },
            },
            {
              id: 25610,
              name: 'Jonathan Armless Sofa, Dark Granite',
              sku: '54000014-GI4002',
              color: 'black',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Modular, Low-Profile',
              price: '549.0',
              list_price: '549.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'modern_contemporary',
                'fall',
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'u_c_shaped_sofa',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1623901026/crusader/variants/54000014-GI4002/Jonathan-Armless-Sofa-Dark-Granite-Front.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'dark_granite',
                  presentation: 'Dark Granite',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1627542183/crusader/variants/GI-4002/Dark-Granite_1.jpg',
                },
              },
              properties: {
                assembly_condition: 'Fully Assembled',
                general_dimensions: 'W88 x D100 x H70cm',
                length: 88,
                material_filter: ['Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '1 Box',
                max_bearing_support: '150 kg',
                product_weight: '21.7 kg',
              },
            },
          ],
        },
        sort: [1.1968781, 267.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4659',
        _score: 1.1968781,
        _source: {
          id: 4659,
          name: 'Ethan Corner Sofa',
          slug: 'ethan-corner-sofa',
          price: 549.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 285.0,
          styles: [],
          taxons: [
            {
              name: 'Modular Corner Sofas',
              permalink: 'sofa-armchairs/modular-corner-sofas',
              position: 1,
              level: 2,
              value: 'Modular Corner Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 1,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1151,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Ethan Collection',
              permalink: 'ethan-collection',
              position: 15,
              level: 1,
              value: 'Ethan Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 755,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
          ],
          category_count: 7,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
            },
            {
              name: 'Collections',
              permalink: 'collections',
            },
            {
              name: 'Ethan Collection',
              permalink: 'ethan-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 24649,
              name: 'Ethan Corner Sofa, Stone Grey',
              sku: '50440692-TE4004',
              color: 'grey',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Removable Cushion Covers, Tufted Seat',
              price: '499.0',
              list_price: '599.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'midcenturymodern',
                'removable_covers',
                'hideads',
                'bestseller_sale',
                'clearance_sale',
                'spring',
                'sale',
                'modular_sofas',
                'icu_list',
                'all_sofa',
                'minimalist_furniture',
                's3_event (do not use)',
                'all products',
                'clearance',
              ],
              badges: ['Sale', 'Clearance'],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1624964911/crusader/variants/50440692-TE4004/Ethan-Corner-Sofa-Stone-Grey-Angle.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'stone_grey',
                  presentation: 'Stone Grey',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1653637272/crusader/variants/TE-4004/Ethan-Armchair-Sofa-Stone-Grey-Square-Det_2-1653637269.jpg',
                },
              },
              properties: {
                seat_softness_rating: 3,
                general_dimensions: 'W94 x D94 x H82cm',
                assembly_condition: 'Legs to be Fitted',
                length: 94,
                material_filter: ['Fabric'],
                overall_sit_rating: 2,
                seat_height_rating: 3,
                seat_depth_rating: 4,
                packaging_dimensions: '1 Box',
              },
            },
          ],
        },
        sort: [1.1968781, 285.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '5191',
        _score: 1.1968781,
        _source: {
          id: 5191,
          name: 'Elias Corner Sofa',
          slug: 'elias-corner-sofa',
          price: 769.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 302.0,
          styles: [],
          taxons: [
            {
              name: 'Category',
              permalink: 'category',
              position: 1567,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Elias Collection',
              permalink: 'elias-collection',
              position: 5,
              level: 1,
              value: 'Elias Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 1090,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 78,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Modular Corner Sofas',
              permalink: 'sofa-armchairs/modular-corner-sofas',
              position: 5,
              level: 2,
              value: 'Modular Corner Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
          ],
          category_count: 7,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
            },
            {
              name: 'Collections',
              permalink: 'collections',
            },
            {
              name: 'Elias Collection',
              permalink: 'elias-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 26757,
              name: 'Elias Corner Sofa, Heron Grey',
              sku: '50420009-CI4001',
              color: 'grey',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Removable Seat Covers, Tufted Backrest',
              price: '699.0',
              list_price: '769.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'clearance_sale',
                'sale',
                'modular_sofas',
                'all_sofa',
                's3_event (do not use)',
                'all products',
                'clearance',
              ],
              badges: ['Sale', 'Clearance'],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1664511908/crusader/variants/50420009-CI4001/Elias-Corner-Sofa-Front-1664511905.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'heron_grey',
                  presentation: 'Heron Grey',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1670399082/crusader/variants/CI-4001/Elias-3-Seater-Sofa-Det_7-1670399080.jpg',
                },
              },
              properties: {
                overall_sit_rating: 3,
                seat_depth_rating: 3,
                seat_height_rating: 4,
                packaging_dimensions: '1 Box',
                assembly_condition: 'Legs to be Fitted',
                product_weight: '24.8kg',
                general_dimensions: 'W115 x D115 x H83cm',
                max_bearing_support: '130kg',
                seat_softness_rating: 3,
                length: 115,
                material_filter: ['Fabric', 'Wood'],
              },
            },
          ],
        },
        sort: [1.1968781, 302.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '5038',
        _score: 1.1968781,
        _source: {
          id: 5038,
          name: 'Dawson Extended Sofa',
          slug: 'dawson-extended-sofa',
          price: 2099.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 328.0,
          styles: [],
          taxons: [
            {
              name: 'Extended 3 Seater Sofas',
              permalink: 'sofa-armchairs/extended-3-seater-sofa',
              position: 2,
              level: 2,
              value: 'Extended 3 Seater Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 102,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1694,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 980,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Dawson Collection',
              permalink: 'dawson-collection',
              position: 7,
              level: 1,
              value: 'Dawson Collection',
              ancestors: ['Collections'],
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
              name: 'Dawson Collection',
              permalink: 'dawson-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 32044,
              name: 'Dawson Extended Sofa, Beach Linen',
              sku: 'AS-000375-NG4001',
              color: 'beige',
              lead_time: 28,
              lead_time_presentation: 'Within Apr 30 - May  7',
              in_stock_regions: [],
              product_short_description: 'Machine Washable Cover, Feather-filled',
              price: '2024.0',
              list_price: '2024.0',
              is_customized: false,
              available_quantity: 99,
              tags: ['all_sofa', 'style_moderncontemporary', 's3_event (do not use)', 'all products'],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1634717099/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-Beach-Linen-Front.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1634717258/crusader/variants/T50440987-NG4001/Dawson-Extended-Sofa-With-Ottoman-Beach-Linen-Square-Set_6.jpg',
              },
              option_values: {
                material: {
                  value: 'beach_linen',
                  presentation: 'Beach Linen',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1665460017/crusader/variants/NG-4001/Beach-Linen_1-1665460015.jpg',
                },
                frame_cover: {
                  value: 'removable',
                  presentation: 'Removable',
                  image_src: '',
                },
              },
              properties: {
                overall_sit_rating: 1,
                seat_height_rating: 4,
                seat_depth_rating: 4,
                seat_softness_rating: 1,
                general_dimensions: 'W321 x D114 x H81cm',
                length: 321,
                material_filter: ['Fabric', 'Feather'],
                assembly_condition: 'Fully Assembled',
                max_bearing_support: '3 x 150 kg',
                product_weight: '98.8 kg',
                packaging_dimensions: '3 Boxes',
              },
            },
          ],
        },
        sort: [1.1968781, 328.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4983',
        _score: 1.1968781,
        _source: {
          id: 4983,
          name: 'Dawson Armless Sofa',
          slug: 'dawson-armless-sofa',
          price: 649.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 369.0,
          styles: [],
          taxons: [
            {
              name: 'Collections',
              permalink: 'collections',
              position: 976,
              level: 0,
              value: 'Collections',
              ancestors: [],
            },
            {
              name: 'Dawson Collection',
              permalink: 'dawson-collection',
              position: 3,
              level: 1,
              value: 'Dawson Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Modular Armless Sofas',
              permalink: 'sofa-armchairs/modular-armless-sofas',
              position: 3,
              level: 2,
              value: 'Modular Armless Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 51,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1449,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
          ],
          category_count: 7,
          categories: [
            {
              name: 'Menu',
              permalink: 'menu',
            },
            {
              name: 'Chairs',
              permalink: 'chairs',
            },
            {
              name: 'Armchairs',
              permalink: 'chairs/armchairs',
            },
            {
              name: 'Sofas',
              permalink: 'sofas',
            },
            {
              name: 'Modular Sofas',
              permalink: 'sofas/modular-sofa',
            },
            {
              name: 'Collections',
              permalink: 'collections',
            },
            {
              name: 'Dawson Collection',
              permalink: 'dawson-collection',
            },
          ],
          images: [],
          variants: [
            {
              id: 32038,
              name: 'Dawson Armless Sofa, Beach Linen',
              sku: '54000140-NG4001',
              color: 'beige',
              lead_time: 28,
              lead_time_presentation: 'Within Apr 30 - May  7',
              in_stock_regions: [],
              product_short_description: 'Machine Washable Cover, Feather-filled',
              price: '2024.0',
              list_price: '2024.0',
              is_customized: false,
              available_quantity: 99,
              tags: ['all_sofa', 'style_moderncontemporary', 's3_event (do not use)', 'all products'],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1697706963/crusader/variants/54000140-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697706960.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'beach_linen',
                  presentation: 'Beach Linen',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1665460017/crusader/variants/NG-4001/Beach-Linen_1-1665460015.jpg',
                },
                frame_cover: {
                  value: 'removable',
                  presentation: 'Removable',
                  image_src: '',
                },
              },
              properties: {
                assembly_condition: 'Fully Assembled',
                overall_sit_rating: 1,
                seat_depth_rating: 4,
                seat_height_rating: 4,
                seat_softness_rating: 1,
                material_filter: ['Fabric', 'Feather'],
                general_dimensions: 'W93 x D114 x H81cm',
                length: 93,
                packaging_dimensions: '1 Box',
                max_bearing_support: '150 kg',
                product_weight: '27 kg',
              },
            },
            {
              id: 26097,
              name: 'Dawson Armless Sofa, Beach Linen',
              sku: '54000044-NG4001',
              color: 'beige',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Machine Washable Cover, Feather-filled',
              price: '799.0',
              list_price: '799.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'modern_farmhouse',
                'removable_covers',
                'fulfilling_home',
                'modern_contemporary',
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'u_c_shaped_sofa',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1697707062/crusader/variants/54000044-NG4001/Dawson-Armless-Sofa-Beach-Linen-Front-1697707059.jpg',
                },
              ],
              life_style_image: null,
              option_values: {
                material: {
                  value: 'beach_linen',
                  presentation: 'Beach Linen',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1665460017/crusader/variants/NG-4001/Beach-Linen_1-1665460015.jpg',
                },
                frame_cover: {
                  value: 'fixed',
                  presentation: 'Fixed',
                  image_src: '',
                },
              },
              properties: {
                assembly_condition: 'Fully Assembled',
                overall_sit_rating: 1,
                seat_depth_rating: 4,
                seat_height_rating: 4,
                seat_softness_rating: 1,
                material_filter: ['Fabric', 'Feather'],
                general_dimensions: 'W93 x D114 x H81cm',
                length: 93,
                packaging_dimensions: '1 Box',
                max_bearing_support: '150 kg',
                product_weight: '27 kg',
              },
            },
          ],
        },
        sort: [1.1968781, 369.0],
      },
      {
        _index: 'web_product_19e2dc96-ec65-416f-8b4f-645d90be66f9',
        _type: '_doc',
        _id: '4893',
        _score: 1.1968781,
        _source: {
          id: 4893,
          name: 'Jonathan Extended Sofa',
          slug: 'jonathan-extended-sofa',
          price: 1699.0,
          product_type: 'configurable',
          product_layout: 'configurable',
          rank: 388.0,
          styles: [],
          taxons: [
            {
              name: 'Extended 3 Seater Sofas',
              permalink: 'sofa-armchairs/extended-3-seater-sofa',
              position: 4,
              level: 2,
              value: 'Extended 3 Seater Sofas',
              ancestors: ['Category', 'Sofa \u0026 Armchairs'],
            },
            {
              name: 'Sofa \u0026 Armchairs',
              permalink: 'sofa-armchairs',
              position: 106,
              level: 1,
              value: 'Sofa \u0026 Armchairs',
              ancestors: ['Category'],
            },
            {
              name: 'Category',
              permalink: 'category',
              position: 1698,
              level: 0,
              value: 'Category',
              ancestors: [],
            },
            {
              name: 'Jonathan Collection',
              permalink: 'jonathan-collection',
              position: 7,
              level: 1,
              value: 'Jonathan Collection',
              ancestors: ['Collections'],
            },
            {
              name: 'Collections',
              permalink: 'collections',
              position: 892,
              level: 0,
              value: 'Collections',
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
              id: 27486,
              name: 'Jonathan Extended Sofa, Performance Creamy White',
              sku: 'AS-000199-PT4001',
              color: 'white',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Modular, Low-Profile',
              price: '2089.0',
              list_price: '2089.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'minimalist_furniture',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801334/crusader/variants/T50440979-PT4001/Jonathan-Extended-3-Seater-Sofa-Performance-Creamy-White-Front-1683801332.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683802663/crusader/variants/T50440979-PT4001/Jonathan-Extended-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802661.jpg',
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
                general_dimensions: 'W316 x D100 x H70cm',
                assembly_condition: 'Fully Assembled',
                length: 316,
                material_filter: ['Fabric', 'Performance Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '3 Boxes',
                product_weight: '79.3 kg',
                max_bearing_support: '3 x 150 kg',
              },
            },
            {
              id: 25813,
              name: 'Jonathan Extended Sofa, Zenith Blue',
              sku: 'AS-000199-GI4001',
              color: 'blue',
              lead_time: 140,
              lead_time_presentation: 'Within Aug 20 - Aug 27',
              in_stock_regions: [],
              product_short_description: 'Modular, Low-Profile',
              price: '1999.0',
              list_price: '1999.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'midcenturymodern',
                'fall',
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'rounded_furniture',
                'low_profile_pieces',
                'u_c_shaped_sofa',
                'minimalist_furniture',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1623898698/crusader/variants/T50440973-GI4001/Jonathan-Extended-3-Seater-Sofa-Zenith-Blue-Front.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1625423606/crusader/variants/T50440973-GI4001/Jonathan-Extended-Sofa-Zenith-Blue-Lifestyle-Crop.jpg',
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
                general_dimensions: 'W316 x D100 x H70cm',
                assembly_condition: 'Fully Assembled',
                length: 316,
                material_filter: ['Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '3 Boxes',
                product_weight: '79.3 kg',
                max_bearing_support: '3 x 150 kg',
              },
            },
            {
              id: 25814,
              name: 'Jonathan Extended Sofa, Dark Granite',
              sku: 'AS-000199-GI4002',
              color: 'black',
              lead_time: 8,
              lead_time_presentation: 'Within Apr 10 - Apr 17',
              in_stock_regions: ['sg'],
              product_short_description: 'Modular, Low-Profile',
              price: '1999.0',
              list_price: '1999.0',
              is_customized: false,
              available_quantity: 99,
              tags: [
                'midcenturymodern',
                'fall',
                'modular_sofas',
                'all_sofa',
                'style_moderncontemporary',
                'u_c_shaped_sofa',
                'minimalist_furniture',
                's3_event (do not use)',
                'all products',
              ],
              badges: [],
              images: [
                {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1623898923/crusader/variants/T50440973-GI4002/Jonathan-Extended-3-Seater-Sofa-Dark-Granite-Front.jpg',
                },
              ],
              life_style_image: {
                mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                small:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                medium:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                large:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                mini_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                small_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                medium_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                large_x2:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                mini_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                small_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                medium_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                large_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                mini_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                small_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                medium_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                large_x2_gray:
                  'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
                feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1625424339/crusader/variants/T50440973-GI4002/Jonathan-Extended-Sofa-Dark-Granite-Lifestyle-Crop.jpg',
              },
              option_values: {
                material: {
                  value: 'dark_granite',
                  presentation: 'Dark Granite',
                  image_src:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1627542183/crusader/variants/GI-4002/Dark-Granite_1.jpg',
                },
              },
              properties: {
                general_dimensions: 'W316 x D100 x H70cm',
                assembly_condition: 'Fully Assembled',
                length: 316,
                material_filter: ['Fabric'],
                overall_sit_rating: 2,
                seat_depth_rating: 4,
                seat_height_rating: 3,
                seat_softness_rating: 2,
                packaging_dimensions: '3 Boxes',
                product_weight: '79.3 kg',
                max_bearing_support: '3 x 150 kg',
              },
            },
          ],
        },
        sort: [1.1968781, 388.0],
      },
    ],
  },
};
