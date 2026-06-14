import type { Meta, StoryObj } from '@storybook/react';
import PosShipmentItem from './pos-shipment-item';

const meta: Meta<typeof PosShipmentItem> = {
  component: PosShipmentItem,
  title: 'module/checkout/PosShipmentItem',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2031-16537&mode=design&t=lEPUnQOjew5SqWSI-4',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosShipmentItem>;

export const Primary: Story = {
  args: {
    shipment: [
      {
        id: 3343883,
        estimated_dispatch_date_presentation: 'Within Mar 29 - Apr  4',
        estimated_delivery_date_presentation: 'Within Mar 30 - Apr  6',
        selected_service_type: {
          type: 'standard_service',
        },
        basic_shipping_fee: '0.0',
        service_fee: '0.0',
        free_shipping_threshold: '999.0',
        waive_service_fee: false,
        warehouse_name: 'Los Angeles',
        manifest: [2295107, 2295108, 2295109],
        line_items: [
          {
            id: 2295107,
            quantity: 1,
            sku: '50440763-MC4002',
            line_item: {
              id: 2295107,
              variant_id: 19974,
              order_id: 1655241,
              quantity: 1,
              price: '1899.0',
              created_at: '2024-03-21T20:49:04.584-07:00',
              updated_at: '2024-03-21T20:51:26.643-07:00',
              cost_price: null,
              tax_category_id: 3,
              adjustment_total: '166.47',
              additional_tax_total: '166.47',
              promo_total: '0.0',
              included_tax_total: '0.0',
              data: {
                warranty_items: {},
              },
              is_free_item: false,
              preferred_stock_location_id: null,
              sell_price: '1752.27',
              manual_discount_total: '0.0',
              on_sale: false,
              original_price: '1899.0',
              list_name: null,
              list_position: null,
              preferred_self_collection: false,
              visited_in_offline: false,
            },
          },
          {
            id: 2295108,
            quantity: 1,
            sku: 'TPB-000090',
            line_item: {
              id: 2295108,
              variant_id: 19823,
              order_id: 1655241,
              quantity: 1,
              price: '1359.0',
              created_at: '2024-03-21T20:49:38.470-07:00',
              updated_at: '2024-03-21T20:51:26.653-07:00',
              cost_price: null,
              tax_category_id: 3,
              adjustment_total: '119.13',
              additional_tax_total: '119.13',
              promo_total: '0.0',
              included_tax_total: '0.0',
              data: {
                warranty_items: {
                  duration_months: '36',
                  warranty_discount: '-0.0',
                  warranty_offer_id: '6bb7bf2c-7603-4deb-a23b-866ea7eba588',
                  warranty_offer_price: '114.99',
                },
              },
              is_free_item: false,
              preferred_stock_location_id: null,
              sell_price: '1254.0',
              manual_discount_total: '0.0',
              on_sale: true,
              original_price: '1434.0',
              list_name: null,
              list_position: null,
              preferred_self_collection: false,
              visited_in_offline: false,
              bundle_options: [
                {
                  bundle_option_id: 240,
                  bundle_option_variant_id: 19348,
                },
                {
                  bundle_option_id: 241,
                  bundle_option_variant_id: 19348,
                },
                {
                  bundle_option_id: 242,
                  bundle_option_variant_id: 19348,
                },
              ],
            },
          },
          {
            id: 2295109,
            quantity: 1,
            sku: 'PB-000912-AM4001',
            line_item: {
              id: 2295109,
              variant_id: 22040,
              order_id: 1655241,
              quantity: 1,
              price: '1919.0',
              created_at: '2024-03-21T20:50:31.260-07:00',
              updated_at: '2024-03-21T20:51:26.663-07:00',
              cost_price: null,
              tax_category_id: 3,
              adjustment_total: '168.22',
              additional_tax_total: '168.22',
              promo_total: '0.0',
              included_tax_total: '0.0',
              data: {
                warranty_items: {},
              },
              is_free_item: false,
              preferred_stock_location_id: null,
              sell_price: '1770.73',
              manual_discount_total: '0.0',
              on_sale: true,
              original_price: '2024.0',
              list_name: null,
              list_position: null,
              preferred_self_collection: false,
              visited_in_offline: false,
            },
          },
        ],
        estimated_delivery_date_start: '2024-03-30T00:00:00.000-07:00',
        estimated_delivery_date_end: '2024-04-06T00:00:00.000-07:00',
        estimated_dispatch_date: '2024-03-29T00:00:00.000-07:00',
        default_estimated_dispatch_date: '2024-03-29T00:00:00.000-07:00',
        default_estimated_delivery_date: '2024-03-30T00:00:00.000-07:00',
        min_dispatch_date: '2024-03-29T00:00:00.000-07:00',
        max_dispatch_date: '2024-09-29T00:00:00.000-07:00',
        min_delivery_date: null,
        max_delivery_date: null,
        messages: [],
        available_service_products: [],
        selected_service_products: [],
      },
    ][0],
    AdditionalServices: null,
    DeliveryServices: null,
    itemGetter: (id) => {
      return {
        id: 2295107,
        variant: {
          images: [
            {
              links: {
                small_x2:
                  'https://castlery.imgix.net/images/variant/2295107/1/50440763-MC4002.jpg?auto=format&fit=max&ixlib=react-9.0.0&h=88&w=88',
              },
            },
          ],
        },
        preferred_stock_location: {
          name: 'Los Angeles',
        },
      };
    },
  },

  render: (args) => {
    return <PosShipmentItem {...args} />;
  },
};
