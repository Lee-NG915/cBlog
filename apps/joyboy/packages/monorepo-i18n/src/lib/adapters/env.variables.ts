import { EcEnv, EC_COUNTRIES_ENUM, INTL_LOCALE } from '@castlery/config';

export const envVariables = {
  ecCountry: EcEnv.NEXT_PUBLIC_COUNTRY,
  ecRegionalFallbackLocale: INTL_LOCALE,
};

export { EC_COUNTRIES_ENUM };
