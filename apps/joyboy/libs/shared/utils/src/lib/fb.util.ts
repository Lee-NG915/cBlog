import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

export function getFbUserLoginInfoFromPersistence(): { loginEmail: string; loginId: string } | null {
  const fbUserLoginInfo = makePersistenceHandles().fbUserLoginInfo.getItem();
  if (typeof fbUserLoginInfo === 'string') {
    return JSON.parse(fbUserLoginInfo);
  }
  return null;
}

export function setFbUserLoginInfoToPersistence(fbUserLoginInfo: { loginEmail: string; loginId: string }) {
  makePersistenceHandles().fbUserLoginInfo.setItem(JSON.stringify(fbUserLoginInfo));
}

export function removeFbUserLoginInfoFromPersistence() {
  makePersistenceHandles().fbUserLoginInfo.removeItem();
}

export function generateFbcFromClId(clId: string) {
  if (!clId) {
    return '';
  }
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
  const version = 'fb';
  const subdomainIndex = 1; //.castlery.com
  const creationTime = Date.now();

  // 请不要对clid做大小写或者编码处理
  return `${version}.${subdomainIndex}.${creationTime}.${clId}`;
}

export function getFbcFromUrlParamAndSetToPersistence() {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const _fbclid = urlParams.get('fbclid');
    if (_fbclid) {
      const _fbc = generateFbcFromClId(_fbclid);
      if (_fbc) {
        makePersistenceHandles().fbcFromClId.setItem(_fbc);
      }
    }
  }
}

// 从持久化中获取fbc或fbclid
export function getFbcFromPersistence() {
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
  // fbc is the facebook click id, it is a 16-character hexadecimal string
  // when the meta pixel(sdk) is loaded, the fbc will be set to the cookie
  // fbclid is also be the facebook click id, which is in the url
  const fbc = makePersistenceHandles().fbc.getItem();
  if (typeof fbc === 'string') {
    return fbc;
  }
  const fbcFromClId = makePersistenceHandles().fbcFromClId.getItem();
  if (typeof fbcFromClId === 'string') {
    return fbcFromClId;
  }
  return '';
}
