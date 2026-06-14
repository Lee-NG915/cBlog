import { EcEnv } from '@castlery/config';

export const accessToken = 'access_token';
export const guestToken = 'guest_token';
export const wishItemGuestToken = `x-${
  EcEnv.NEXT_PUBLIC_APPLICATION_ENV.indexOf('test') > -1 ? 'test' : 'prod'
}-${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}-new-guest-token`;
export const userInfo = 'server_user_info';
