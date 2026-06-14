import { EcEnv } from '@castlery/config';

export const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY;
export const __CURRENCY__ = EcEnv.NEXT_PUBLIC_CURRENCY;
export const __CURRENCY_SYMBOL__ = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;
export const __CLIENT__ = EcEnv.NEXT_PUBLIC_CHANNEL;

export const isPOS = EcEnv?.NEXT_PUBLIC_CHANNEL?.toUpperCase() === 'POS';
