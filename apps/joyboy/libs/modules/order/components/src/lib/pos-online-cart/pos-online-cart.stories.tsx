/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { PosOnlineCart } from './pos-online-cart';
// import PosOnlineCartContent from './pos-online-cart-content';
import { Box } from '@castlery/fortress';
import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof PosOnlineCart> = {
  component: PosOnlineCart,
  title: 'module/order/PosPosOnlineCart',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1998-10552&mode=dev',
      // https://github.com/vercel/next.js/discussions/50068
      // nextjs: {
      //   appDirectory: true,
      // },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosOnlineCart>;

export const Primary: Story = {
  args: {
    onlineOrderGetter: () => ({
      id: 1854502,
      number: 'R743845034',
      state: 'address',
      currency: 'USD',
      store_id: 2,
      item_count: 2,
      total: '4211.37',
      created_at: '2024-03-18T03:02:35.756-07:00',
      updated_at: '2024-03-18T04:26:02.283-07:00',
      create_type: null,
      zipcode: '90024',
      country_state: 'CA',
      city: 'Los Angeles',
      guest_token: 'TDhbB4CYJhLGVKOomz_FMw',
      item_total: '3996.0',
      adjustment_total: '215.37',
      shipment_total: '0.0',
      promo_total: '-150.0',
      additional_tax_total: '365.37',
      included_tax_total: '0.0',
      tax_total: '365.37',
      payment_total: '0.0',
      warranty_total: '0.0',
      estimated_shipment_total: {
        original_amount: 0,
        actual_amount: 0,
        promotion_amount: 0,
      },
      fulfillment_order_id: false,
      line_items: [
        {
          id: 2569545,
          quantity: 2,
          list_name: null,
          list_position: null,
          price: '1998.0',
          currency: 'USD',
          amount: '3996.0',
          total: '4361.37',
          is_free_item: false,
          manual_discount_total: '0.0',
          is_gift: false,
          visited_in_offline: false,
          variant: {
            id: 21287,
            name: 'Jonathan Sofa, Performance Creamy White',
            sku: 'AS-000198-PT4001',
            price: '1998.0',
            list_price: '1998.0',
            max_sale_qty: 1000,
            assembly_type: 'fully_assembled',
            product_id: 2440,
            product_slug: 'jonathan-sofa',
            min_sale_qty: 1,
            qty_increments: 1,
            product_name: 'Jonathan Sofa',
            is_customized: false,
            lead_time: null,
            available_channels: ['web', 'pos'],
            images: [
              {
                id: 41570,
                position: 4,
                type: 'base',
                links: {
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
              },
              {
                id: 41577,
                position: 12,
                type: 'base',
                links: {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Angle-1683801320.jpg',
                },
              },
              {
                id: 41578,
                position: 13,
                type: 'base',
                links: {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801321/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Side-1683801319.jpg',
                },
              },
              {
                id: 41579,
                position: 14,
                type: 'base',
                links: {
                  mini: 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  small:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  medium:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  large:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  mini_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  small_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  medium_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  large_x2:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  mini_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  small_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_420/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  medium_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_750/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  large_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  mini_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_560/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  small_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_840/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  medium_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1500/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  large_x2_gray:
                    'https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1995/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                  feed: 'https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Back-1683801319.jpg',
                },
              },
            ],
            variant_option_values: [
              {
                option_value_id: 430,
                name: 'twill_creamy_white',
                presentation: 'Performance Creamy White',
                option_type_id: 9,
                option_type_name: 'material',
                option_type_presentation: 'Material',
              },
            ],
            is_clearance: false,
            product_taxons: [
              {
                id: 11020,
                name: 'Category',
                permalink: 'Category',
                position: 110,
                level: 0,
                value: 'Category',
                ancestors: [],
              },
              {
                id: 11021,
                name: 'Sofa \u0026 Armchairs',
                permalink: 'sofa-armchairs',
                position: 17,
                level: 1,
                value: 'Sofa \u0026 Armchairs',
                ancestors: ['Category'],
              },
              {
                id: 11018,
                name: '3 Seater Sofas',
                permalink: 'sofa-armchairs/3-seater-sofas',
                position: 3,
                level: 2,
                value: '3 Seater Sofas',
                ancestors: ['Category', 'Sofa \u0026 Armchairs'],
              },
              {
                id: 11022,
                name: 'Collections',
                permalink: 'collections',
                position: 472,
                level: 0,
                value: 'Collections',
                ancestors: [],
              },
              {
                id: 11019,
                name: 'Jonathan Collection',
                permalink: 'jonathan-collection',
                position: 4,
                level: 1,
                value: 'Jonathan Collection',
                ancestors: ['Collections'],
              },
            ],
            tags: [
              'match \u0026 save',
              'all products',
              'modular_sofas',
              'style_moderncontemporary',
              'minimalist_furniture',
              'cozy_furniture',
              'low_profile_pieces',
              'rounded_furniture',
              'all_sofa',
            ],
          },
          lead_time_presentation: 'Within Mar 25 - Mar 31',
          delivery_lead_time_presentation: 'Within Mar 26 - Apr  2',
          adjustment_total: '365.37',
          additional_tax_total: '365.37',
          promo_total: '0.0',
          included_tax_total: '0.0',
          warranty_items: null,
          product_type: 'configurable',
          product_layout: 'configurable',
          bundle_line_items: [],
          is_price_outdated: false,
          is_region_outdated: false,
          preferred_self_collection: false,
          is_swatch: false,
          show_leadtime_explanation: false,
          pair_up_info: null,
          lead_time: 7,
          stock_state: 'IN_STOCK',
          warehouse_name: 'Los Angeles',
          delivery_lead_time: 8,
        },
      ],
      payments: [],
      addon_service_line_items: [],
      warranty_line_items: [{}],
      shipments: [
        {
          id: 4073657,
          estimated_dispatch_date_presentation: 'Within Mar 25 - Mar 31',
          estimated_delivery_date_presentation: 'Within Mar 26 - Apr  2',
          selected_service_type: {
            type: 'standard_service',
          },
          basic_shipping_fee: '0.0',
          service_fee: '0.0',
          free_shipping_threshold: '999.0',
          waive_service_fee: false,
          warehouse_name: 'Los Angeles',
          manifest: [2569545],
          line_items: [
            {
              id: 2569545,
              quantity: 2,
              sku: 'AS-000198-PT4001',
              line_item: {
                id: 2569545,
                variant_id: 21287,
                order_id: 1854502,
                quantity: 2,
                price: '1998.0',
                created_at: '2024-03-18T03:02:50.736-07:00',
                updated_at: '2024-03-18T04:26:02.244-07:00',
                cost_price: null,
                tax_category_id: 3,
                adjustment_total: '365.37',
                additional_tax_total: '365.37',
                promo_total: '0.0',
                included_tax_total: '0.0',
                data: {
                  warranty_items: {},
                },
                is_free_item: false,
                preferred_stock_location_id: null,
                sell_price: '3846.0',
                manual_discount_total: '0.0',
                on_sale: false,
                original_price: '1998.0',
                list_name: null,
                list_position: null,
                preferred_self_collection: false,
                visited_in_offline: false,
              },
            },
          ],
          estimated_delivery_date_start: '2024-03-26T00:00:00.000-07:00',
          estimated_delivery_date_end: '2024-04-02T00:00:00.000-07:00',
          estimated_dispatch_date: '2024-03-25T00:00:00.000-07:00',
          default_estimated_dispatch_date: '2024-03-25T00:00:00.000-07:00',
          default_estimated_delivery_date: '2024-03-26T00:00:00.000-07:00',
          min_dispatch_date: '2024-03-25T00:00:00.000-07:00',
          max_dispatch_date: '2024-09-25T00:00:00.000-07:00',
          min_delivery_date: null,
          max_delivery_date: null,
          messages: [],
          available_service_products: [],
          selected_service_products: [],
        },
      ],
      free_shipping_threshold: '999.0',
      promotions: [
        {
          name: 'Match \u0026 Save',
          description: '$150 off $2,500 or $400 off $4,500. Not applicable on Furniture Sets.',
          amount: '-150.0',
          adjustable_type: 'order',
        },
      ],
      delivery_option_manager: {
        can_merge: false,
        can_split: false,
        delivery_date_shipment_id: 4073657,
      },
      warning_messages: [],
      first_purchase: true,
      available_assembly_preferences: [],
      selected_assembly_preferences: [],
      exchange_order_number: null,
      available_gift_promotions: [],
    }),
    cancel: () => {
      alert('cancel');
    },
    confirm: (result: number[]) => {
      alert('confirm' + JSON.stringify(result));
    },
  },
  render: ({ ...args }) => {
    return <PosOnlineCart {...args} />;
  },
};
