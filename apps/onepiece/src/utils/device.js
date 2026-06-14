import { get as getCookie } from 'helpers/Cookie';

/**
 * @notes only return user device, not return device by window size
 * support server side rendering
 * setting in userAgentMiddleware
 * @returns {string} device
 */
export function getUserDevice() {
  return getCookie('device');
}
