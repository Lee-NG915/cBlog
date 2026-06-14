import { client } from 'helpers/ApiClient';
import type { Request } from 'superagent';
import type { Address } from './types/Address';

interface AddressParams {
  userId: string;
  address: Address;
}
export const updateAddress = ({ address, userId }: AddressParams): Request | Promise<any> => {
  if (!userId) {
    console.error('userId is required');
    return Promise.reject(new Error('userId is required'));
  }
  const url = `/users/${userId}/addresses`;
  return client.post(url, {
    auth: 'strict',
    data: address,
  }) as Request;
};
