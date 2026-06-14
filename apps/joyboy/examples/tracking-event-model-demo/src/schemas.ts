import { z } from 'zod';

const CurrencySchema = z.enum(['USD', 'SGD', 'AUD', 'CAD', 'GBP']);

export const AddToCartEventSchema = z.object({
  event_id: z.string().min(1),
  cart_id: z.string().min(1),
  source: z.enum(['pdp', 'plp', 'recommendation']),
  item: z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    currency: CurrencySchema,
  }),
});
export type AddToCartEvent = z.infer<typeof AddToCartEventSchema>;

export const OrderPurchasedEventSchema = z.object({
  event_id: z.string().min(1),
  order: z.object({
    id: z.string().min(1),
    number: z.string().min(1),
    summary: z.object({
      value: z.number().positive(),
      currency: CurrencySchema,
    }),
    items: z
      .array(
        z.object({
          sku: z.string().min(1),
          quantity: z.number().int().positive(),
          price: z.number().positive(),
        })
      )
      .min(1),
  }),
});
export type OrderPurchasedEvent = z.infer<typeof OrderPurchasedEventSchema>;

export const GAEcommerceItemSchema = z.object({
  item_id: z.string(),
  item_name: z.string().optional(),
  price: z.number(),
  quantity: z.number(),
});

export const GADataLayerPayloadSchema = z.object({
  event: z.string(),
  event_id: z.string(),
  ecommerce: z.object({
    currency: CurrencySchema,
    value: z.number(),
    transaction_id: z.string().optional(),
    items: z.array(GAEcommerceItemSchema).min(1),
  }),
});
export type GADataLayerPayload = z.infer<typeof GADataLayerPayloadSchema>;

export const MetaCapiPayloadSchema = z.object({
  event_name: z.enum(['AddToCart', 'Purchase']),
  event_id: z.string(),
  event_time: z.number().int().positive(),
  custom_data: z.object({
    value: z.number(),
    currency: CurrencySchema,
    order_id: z.string().optional(),
    content_ids: z.array(z.string()).min(1),
    contents: z
      .array(
        z.object({
          id: z.string(),
          quantity: z.number(),
          item_price: z.number(),
        })
      )
      .min(1),
  }),
});
export type MetaCapiPayload = z.infer<typeof MetaCapiPayloadSchema>;
