/* eslint-disable @typescript-eslint/no-shadow */
/**
 *
 * A superagent wrapper to handle all api requests
 *
 * the 'auth' has two modes, 'strict' and 'loose'
 *   strict: must have Authorization for this api request
 *   loose: Authorization is optional
 *
 */

import superagent from 'superagent';
import { isProd } from 'config';
import type { Response, Request } from 'superagent';
import { httpErrorCodeMap } from 'utils/httpErrorCodeMap';
import * as Cookie from './Cookie';

let getNamespace: (param: string) => any;
if (__SERVER__) {
  getNamespace = require('cls-hooked').getNamespace;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'del';

interface Options {
  params?: { readonly [props: string]: string };
  data?: Response;
  auth?: 'strict' | 'loose' | 'basic';
  credentials?: 'omit' | 'same-origin' | 'include';
  header?: { readonly [props: string]: string };
}

const methods: Method[] = ['get', 'post', 'put', 'patch', 'del'];

export function formatUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    // return original path if this is a third party api
    return path;
  }
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;

  const debugApiHost = !isProd && __CLIENT__ && localStorage?.getItem?.('castlery_debug_api');
  if (debugApiHost) {
    return debugApiHost + adjustedPath;
  }
  return __APIHOST__ + adjustedPath;
}

export default class ApiClient {
  [props: string]: (...params: any) => any;

  // FIXME The logic here should not be obtained in the constructor
  constructor() {
    methods.forEach((method) => {
      // transform 'get' to (path, {...}) => {}
      this[method] = (path: string, options: Options = {}) =>
        new Promise((resolve, reject) => {
          const { auth } = options;
          if (auth === 'strict') {
            const token = Cookie.get('access_token');
            if (!token) {
              const error: Error & { status: number } = new Error('unauthorised') as Error & { status: number };
              error.status = 401;
              reject(error);
              return;
            }
          }
          const request = this.createRequest(method, path, options);
          request.end((err, data: Partial<Response> = {}) => {
            const { body } = data;
            if (err) {
              if (typeof err === 'object') {
                console.log(
                  `[API][ERROR]: ${(method || '').toUpperCase()} ${path} ${err.status} ${err.message} timeout=${
                    err.timeout
                  }`
                );
              }
              if (httpErrorCodeMap.get('CONFLICT')?.code === err?.status) {
                // When the error code is 409, the field body is null, so the reject content is reset.
                reject({ status: err.status, errors: [{ code: err.status, detail: err.message }] });
              }
              if (httpErrorCodeMap.get('TOO_MANY_REQUESTS')?.code === err?.status) {
                // When the error code is 429, the field body is null, so the reject content is reset.
                reject({ status: err.status, errors: [{ code: err.status, detail: err.message }] });
              }
              if (auth === 'strict' || auth === 'loose') {
                if (err.status === 401) {
                  // token required and access_token expired
                  const token = Cookie.get('refresh_token');

                  if (token) {
                    superagent
                      .post(formatUrl('/oauth/token'))
                      .send({
                        grant_type: 'refresh_token',
                        refresh_token: token,
                      })
                      .end((refreshErr, data: Partial<Response> = {}) => {
                        const { body: refreshBody } = data;
                        if (refreshErr) {
                          if (refreshErr.status === 401 || refreshErr.status === 400) {
                            // refresh_token not valid, clear all tokens
                            Cookie.remove('access_token');
                            Cookie.remove('refresh_token');

                            if (auth === 'strict') {
                              reject(refreshBody);
                            } else {
                              const refreshRequest = this.createRequest(method, path, options);
                              // eslint-disable-next-line @typescript-eslint/no-shadow
                              refreshRequest.end((finalErr, data: any = {}) => {
                                const { body: finalBody = {} } = data;
                                if (finalErr) {
                                  reject(finalBody);
                                } else {
                                  resolve(finalBody);
                                }
                              });
                            }
                          } else {
                            reject(refreshBody);
                          }
                        } else if (refreshBody && refreshBody.access_token && refreshBody.refresh_token) {
                          // set cookie and send original request again
                          Cookie.set('access_token', refreshBody.access_token as string, 365);
                          Cookie.set('refresh_token', refreshBody.refresh_token as string, 365);

                          const refreshRequest = this.createRequest(method, path, options);
                          refreshRequest.end((finalErr, data: Partial<Response> = {}) => {
                            const { body: finalBody } = data;
                            if (finalErr) {
                              reject(finalBody);
                            } else {
                              resolve(finalBody);
                            }
                          });
                        } else {
                          reject(refreshBody);
                        }
                      });
                  } else {
                    // no refresh_token, clear access_token and reject
                    Cookie.remove('access_token');
                    reject(body);
                  }
                } else if (err.status === 403) {
                  // 403 stands for invalid token

                  // clear token cache
                  Cookie.remove('access_token');
                  Cookie.remove('refresh_token');

                  if (auth === 'loose') {
                    // continue doing request without passing token
                    const retryRequest = this.createRequest(method, path, options);
                    retryRequest.end((finalErr, data: Partial<Response> = {}) => {
                      const { body: finalBody } = data;
                      if (finalErr) {
                        reject(finalBody);
                      } else {
                        resolve(finalBody);
                      }
                    });
                  } else {
                    reject(body);
                  }
                } else {
                  reject(body);
                }
              } else {
                // expose HTTP status so callers can distinguish transient errors (5xx, 409)
                // from definitively-invalid resources (404, 410). See cart.js load catch.
                const rejection =
                  body && typeof body === 'object'
                    ? { ...body, status: body.status ?? err?.status }
                    : { status: err?.status, message: err?.message };
                reject(rejection);
              }
            } else {
              resolve(body);
            }
          });
        });
    });
  }

  createRequest = (
    method: Method,
    path: string,
    { params, data, auth, credentials, header = {} }: Options
  ): Request => {
    const request = superagent[method](formatUrl(path));
    const additionalHeader: { [props: string]: string } = {};
    const token = Cookie.get('access_token');

    if (!/^https?:\/\//.test(path)) {
      additionalHeader['X-Channel'] = 'web';
    }

    // If token is required, check cookie, reject if not available
    if ((auth === 'strict' || auth === 'loose') && token) {
      additionalHeader['X-Access-Token'] = token;
    }

    if (credentials === 'include') {
      request.withCredentials();
    }

    request.set({ ...header, ...additionalHeader });

    if (!__APPLICATION_ENV__.includes('prod') && auth === 'basic') {
      request.auth('castlery', 'cslr$T@g');
    }

    if (params) {
      request.query(params);
    }

    if (__SERVER__ && getNamespace('castlery')?.get('req')?.get('cookie')) {
      request.set('cookie', getNamespace('castlery').get('req').get('cookie') as string);
    }

    if (data) {
      request.send(data);
    }

    request.timeout({
      response: 30000, // 30 seconds
      deadline: 60000, // 1 minute
    });

    return request;
  };
}

// Singleton
// FIXME Since the token is now made in the constructor,
// do not use the singleton on the server side for now
export const client = new ApiClient();
