import { client } from 'helpers/ApiClient';
import type { Request } from 'superagent';

export const getValidateResetPasswordToken = (secret: string): Request | Promise<any> => {
  const url = `/users/validate_reset_password_token/${secret}`;
  return client.get(url) as Request;
};
