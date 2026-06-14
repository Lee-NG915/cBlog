import { basePageConfig, EcEnv } from '@castlery/config';

const base = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`;
const countryPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`;

export const checkoutSuccessUrl = `${base}${basePageConfig['checkout-success']}`;
export const homeUrl = `${base}${basePageConfig['home']}`;
export const orderHistoryUrl = `${base}${basePageConfig['orders']}`;
export const contactUsUrl = `${base}${basePageConfig['contact-us']}`;

export const checkoutSuccessPath = `${countryPath}${basePageConfig['checkout-success']}`;
export const homePath = `${countryPath}${basePageConfig['home']}`;
export const orderHistoryPath = `${countryPath}${basePageConfig['orders']}`;
export const contactUsPath = `${countryPath}${basePageConfig['contact-us']}`;
