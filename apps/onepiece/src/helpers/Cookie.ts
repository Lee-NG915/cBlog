/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import Cookie from 'js-cookie';

let getNamespace: any;
if (__SERVER__) {
  getNamespace = require('cls-hooked').getNamespace;
}

export function get(name: string) {
  if (__SERVER__) {
    return getNamespace('castlery')?.get('req')?.cookies[name];
  }
  if (__CLIENT__) {
    return Cookie.get(name);
  }
}

export function set(
  name: string,
  value: string,
  day = 365,
  path = __BASE_ROUTE__,
  secure = true,
  httpOnly = false
): void {
  if (__SERVER__) {
    getNamespace('castlery').get('req').cookies[name] = value;
    getNamespace('castlery')
      .get('res')
      .cookie(name, value, {
        maxAge: day * 24 * 3600 * 1000,
        path,
        secure,
        httpOnly,
      });
  } else if (__CLIENT__) {
    Cookie.set(name, value, { expires: day, path, secure, httpOnly });
  }
}

export function remove(name: string, path = __BASE_ROUTE__) {
  if (__SERVER__) {
    getNamespace('castlery').get('res').clearCookie(name, {
      path,
    });
    // clear old cookie in castlery.com
    getNamespace('castlery').get('res').clearCookie(name);
  } else if (__CLIENT__) {
    Cookie.remove(name, {
      path,
    });
    // clear old cookie in castlery.com
    Cookie.remove(name);
  }
}
