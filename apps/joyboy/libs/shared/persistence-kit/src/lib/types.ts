import type { OptionsType, CookieValueTypes, DefaultOptions } from 'cookies-next/lib/types';

type SetCookie = (value: string, options?: OptionsType) => void;
type GetCookie = (options?: OptionsType) => CookieValueTypes;
type HasCookie = (options?: OptionsType) => boolean;
type DeleteCookie = (options?: OptionsType) => void;

export type CookiesHandle = {
  setItem: SetCookie;
  getItem: GetCookie;
  hasItem: HasCookie;
  removeItem: DeleteCookie;
};

export type MakeCookiesHandleType = (options?: OptionsType) => CookiesHandle;

export { OptionsType, DefaultOptions };
