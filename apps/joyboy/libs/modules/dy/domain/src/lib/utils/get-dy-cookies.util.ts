import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { accessInServer } from '@castlery/config';
import type { CookieContext } from '../entity';

export function getDyCookies(cookieContext?: CookieContext) {
  if (accessInServer && !cookieContext) {
    throw new Error('~file: get-dy-cookies.util.ts:7 ~ getDyCookies ~ cookieContext is required');
  }
  const cookiesOptions = cookieContext || {};
  return {
    dyid: makePersistenceHandles().dyid.getItem(cookiesOptions),
    dyidServer: makePersistenceHandles().dyidServer.getItem(cookiesOptions),
    dyNewUser: makePersistenceHandles().dyNewUser.getItem(cookiesOptions),
    dySession: makePersistenceHandles().dySession.getItem(cookiesOptions),
    dyPageLocation: makePersistenceHandles().dyPageLocation.getItem(cookiesOptions),
    dyGlobalControlGroup: makePersistenceHandles().dyGlobalControlGroup.getItem(cookiesOptions),
    dyIp: makePersistenceHandles().ipAddress.getItem(cookiesOptions),
  };
}
