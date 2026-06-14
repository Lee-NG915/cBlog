import { EcEnv, accessInServer } from '@castlery/config';

export function getDyApiHeader() {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'dy-api-key': accessInServer ? EcEnv.DY_SERVER_API_KEY : EcEnv.NEXT_PUBLIC_DY_CLIENT_API_KEY,
  };
}
