import { get as getCookie, set as setCookie } from 'helpers/Cookie';

export function set(city) {
  setCookie('user_city', JSON.stringify(city));
}

export function get() {
  if (getCookie('user_city')) {
    return JSON.parse(getCookie('user_city'));
  }
  return {};
}

export function init(geolocation) {
  set(geolocation);
}
