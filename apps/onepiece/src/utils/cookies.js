import { set as setCookie, get as getCookie } from 'helpers/Cookie';

export function hasSubscribed() {
  return JSON.parse(getCookie('has_subscribed') || getCookie('is_subscribed') || false);
}

export function setSubscribed(day = 365) {
  setCookie('has_subscribed', JSON.stringify(true), day);
}
