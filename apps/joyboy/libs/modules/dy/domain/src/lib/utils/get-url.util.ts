import { accessInServer } from '@castlery/config';

export const DY_BASE_URL = {
  CLIENT: 'https://direct.dy-api.com/v2/',
  SERVER: 'https://dy-api.com/v2/',
};
export function getDyApiUrl() {
  return `${accessInServer ? DY_BASE_URL.SERVER : DY_BASE_URL.CLIENT}serve/user/choose`;
}
