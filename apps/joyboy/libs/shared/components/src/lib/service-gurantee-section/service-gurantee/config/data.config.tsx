import { LocalShipping, VerifiedSecurity, Returns, CurrencyExchange } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';
import AU_CONFIG from './data.au';
import US_CONFIG from './data.us';
import SG_CONFIG from './data.sg';
import CA_CONFIG from './data.ca';
import UK_CONFIG from './data.uk';

type MarketType = 'AU' | 'US' | 'SG' | 'CA' | 'UK';

const MARKET = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase() as MarketType;

//services prd : https://castlery.atlassian.net/wiki/x/AQDasw => 8.网站服务展示

const DELIVERY_MAP: Record<MarketType, { title: string; description: string; guideLinkRichText: JSX.Element }> = {
  AU: AU_CONFIG.DELIVERY_DATA,
  US: US_CONFIG.DELIVERY_DATA,
  SG: SG_CONFIG.DELIVERY_DATA,
  CA: CA_CONFIG.DELIVERY_DATA,
  UK: UK_CONFIG.DELIVERY_DATA,
};
const WARRANTY_MAP: Record<MarketType, { title: string; description: string; guideLinkRichText: JSX.Element }> = {
  AU: AU_CONFIG.WARRANTY_DATA,
  US: US_CONFIG.WARRANTY_DATA,
  SG: SG_CONFIG.WARRANTY_DATA,
  CA: CA_CONFIG.WARRANTY_DATA,
  UK: UK_CONFIG.WARRANTY_DATA,
};
const RETURNS_MAP: Record<MarketType, { title: string; description: string; guideLinkRichText: JSX.Element }> = {
  AU: AU_CONFIG.RETURN_DATA,
  US: US_CONFIG.RETURN_DATA,
  SG: SG_CONFIG.RETURN_DATA,
  CA: CA_CONFIG.RETURN_DATA,
  UK: UK_CONFIG.RETURN_DATA,
};
const FUNDING_MAP: Record<MarketType, { title: string; description: string; guideLinkRichText: JSX.Element }> = {
  AU: AU_CONFIG.FUNDING_DATA,
  US: US_CONFIG.FUNDING_DATA,
  SG: SG_CONFIG.FUNDING_DATA,
  CA: CA_CONFIG.FUNDING_DATA,
  UK: UK_CONFIG.FUNDING_DATA,
};

const DELIVERY = {
  ...DELIVERY_MAP[MARKET],
  titleIcon: (
    <LocalShipping
      sx={{
        color: (theme) => theme.palette.text.primary,
        width: 32,
        height: 32,
      }}
    />
  ),
};
const WARRANTY = {
  ...WARRANTY_MAP[MARKET],
  titleIcon: (
    <VerifiedSecurity
      sx={{
        color: (theme) => theme.palette.text.primary,
        width: 32,
        height: 32,
      }}
    />
  ),
};

const RETURNS = {
  ...RETURNS_MAP[MARKET],
  titleIcon: (
    <Returns
      sx={{
        color: (theme) => theme.palette.text.primary,
        width: 32,
        height: 32,
      }}
    />
  ),
};

const FUNDING = {
  ...FUNDING_MAP[MARKET],
  titleIcon: (
    <CurrencyExchange
      sx={{
        color: (theme) => theme.palette.text.primary,
        width: 32,
        height: 32,
      }}
    />
  ),
};

export const SERVICE_GUARANTEES_CONFIG = [DELIVERY, WARRANTY, RETURNS, FUNDING];
