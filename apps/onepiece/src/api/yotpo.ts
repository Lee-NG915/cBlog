import { client } from 'helpers/ApiClient';
import type { Request } from 'superagent';

/**
 * API Doc
 * https://castlery.atlassian.net/wiki/x/8oGEog
 */

/**
 * @doc https://loyaltyapi.yotpo.com/reference/record-a-customer-action
 * @param payload
 * @returns
 */
export const earnYotpoPoints = (payload: {
  /**
   * @default 'CustomAction'
   */
  type?: string;
  customer_email: string;
  action_name: string;
}): Request | Promise<any> =>
  client.post('/yotpo/actions', {
    auth: 'strict',
    data: {
      ...payload,
      ...(!payload.type ? { type: 'CustomAction' } : {}),
    },
  }) as Request;
