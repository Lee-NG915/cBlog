import { LocalStorageNames, SessionStorageNames } from 'config/storage-name';
import { get } from 'helpers/Cookie';

export const getFbUserInSession = () => {
  try {
    const fbUser = sessionStorage.getItem(LocalStorageNames.fbUser);
    return fbUser ? JSON.parse(fbUser) : null;
  } catch (error) {
    console.error('getFbUserInSession error', error);
    return null;
  }
};

export const setFbUserInSession = (email, fbLoginId) => {
  if (!email || !fbLoginId) {
    return;
  }
  try {
    sessionStorage.setItem(
      LocalStorageNames.fbUser,
      JSON.stringify({
        [LocalStorageNames.fbLoginEmail]: email,
        [LocalStorageNames.fbLoginId]: fbLoginId,
      })
    );
  } catch (error) {
    console.error('setFbUserInSession error', error);
  }
};

export const clearFbUserInSession = () => {
  sessionStorage.removeItem(LocalStorageNames.fbUser);
};

export const clearFbUserInLocalStorage = () => {
  localStorage.removeItem(LocalStorageNames.fbUser);
};

export const getFbUserInLocalStorage = () => {
  try {
    const fbUser = localStorage.getItem(LocalStorageNames.fbUser);
    return fbUser ? JSON.parse(fbUser) : null;
  } catch (error) {
    console.error('getFbUserInLocalStorage error', error);
    return null;
  }
};

export const setFbUserInLocalStorage = (email, fbLoginId) => {
  if (!email || !fbLoginId) {
    return;
  }
  try {
    localStorage.setItem(
      LocalStorageNames.fbUser,
      JSON.stringify({
        [LocalStorageNames.fbLoginEmail]: email,
        [LocalStorageNames.fbLoginId]: fbLoginId,
      })
    );
  } catch (error) {
    console.error('setFbUserInLocalStorage error', error);
  }
};

export function getFbcFromSessionStorage() {
  try {
    const _fbc = sessionStorage.getItem(SessionStorageNames.fbcFromClId);
    return _fbc ?? '';
  } catch (error) {
    console.error('getFbcFromSessionStorage error', error);
    return '';
  }
}

export function generateFbcFromClId(clId) {
  if (!clId) {
    return '';
  }
  // https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
  const version = 'fb';
  const subdomainIndex = 1;
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
        sessionStorage.setItem(SessionStorageNames.fbcFromClId, _fbc);
      }
    }
  }
}

export function getFbcFromLocal() {
  const fbc = get('_fbc');
  if (fbc) {
    return fbc;
  }
  const _fbc = getFbcFromSessionStorage();
  if (_fbc) {
    return _fbc;
  }
  return '';
}
