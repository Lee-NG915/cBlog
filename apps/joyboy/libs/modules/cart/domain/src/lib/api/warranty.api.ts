import { api } from '@castlery/shared-redux-services';
import type { LineItemSchema } from '@castlery/types';
import { X_CART_TOKEN, accessInPos } from '@castlery/config';
import type { CartWarrantyPayload } from '../entity/atc.entity';

/**
 * [保险接入] Cart V2 保险增删 API（Web + POS 共用 endpoint 形态）
 * - POST body: Guardsman → { cartItemId, warranty: { vendor, offerId } }
 *              Mulberry  → { cartItemId, warrantyOfferId }
 * - DELETE: { cartItemId } — 移除行上已有保险
 * - 调用方: WarrantyInlineButton / WarrantyRemoveButton
 */
export const warrantyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addWarranty: builder.mutation<
      { data: any },
      {
        cartItemId: LineItemSchema['id'];
        warranty?: CartWarrantyPayload;
        warrantyOfferId?: string | number;
      }
    >({
      query: ({ cartItemId, warranty, warrantyOfferId }) => {
        const offerId = warranty?.offerId || (warrantyOfferId ? `${warrantyOfferId}` : '');
        const guardsmanWarranty =
          warranty?.vendor === 'guardsman' && offerId
            ? {
                ...warranty,
                offerId,
              }
            : null;
        const body = guardsmanWarranty
          ? {
              cartItemId,
              warranty: guardsmanWarranty,
            }
          : offerId
          ? {
              cartItemId,
              warrantyOfferId: offerId,
            }
          : {
              cartItemId,
            };

        return {
          url: accessInPos ? '/api/v1/pos/cart/warranty' : '/api/v1/cart/warranty',
          method: 'POST',
          headers: {
            [X_CART_TOKEN]: 'true',
          },
          body,
        };
      },
    }),
    removeWarranty: builder.mutation<{ data: any }, { cartItemId: LineItemSchema['id'] }>({
      query: ({ cartItemId }) => ({
        url: accessInPos ? '/api/v1/pos/cart/warranty' : '/api/v1/cart/warranty',
        method: 'DELETE',
        headers: {
          [X_CART_TOKEN]: 'true',
        },
        body: {
          cartItemId,
        },
      }),
    }),
  }),
});
export const { useAddWarrantyMutation, useRemoveWarrantyMutation } = warrantyApi;
export const { addWarranty, removeWarranty } = warrantyApi.endpoints;
