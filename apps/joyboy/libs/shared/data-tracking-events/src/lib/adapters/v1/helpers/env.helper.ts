import { EcEnv, accessInUS } from '@castlery/config';

export const EnvHelper = {
  currency: EcEnv.NEXT_PUBLIC_CURRENCY,
  country: EcEnv.NEXT_PUBLIC_COUNTRY,
  client: EcEnv.NEXT_PUBLIC_CHANNEL,
  isPOS: EcEnv?.NEXT_PUBLIC_CHANNEL?.toUpperCase() === 'POS',
  currencySymbol: EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL,
  accessInUS: accessInUS,
};
