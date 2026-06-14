import { EcEnv } from '@castlery/config';

export const isLoggedIn = 'is_logged_in';
export const isLoggedInKeyName = `${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.toLowerCase()}_${isLoggedIn}`;
