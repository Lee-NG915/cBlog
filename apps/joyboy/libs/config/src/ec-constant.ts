import { EcEnv } from './ec-env';

/**
 * 	
 * PosBaseReq {
    SalesID       string `header:"X-Sales-ID"`        // 销售id
    Source        string `header:"X-Source,optional"` // 来源
    UserID        string `header:"X-UID,optional"`    // 用户id
    RetailStoreID int32  `header:"X-Retail-Store-ID"` // 门店id
  }
 */

export const X_CHANNEL = 'X-Channel';
export const WEB_CHANNEL = 'web';
export const POS_CHANNEL = 'pos';
export const INTL_LOCALE = EcEnv.NEXT_PUBLIC_LOCALE;
export const INTL_CURRENCY = EcEnv.NEXT_PUBLIC_CURRENCY;
export const X_ACCESS_TOKEN = 'X-Access-Token';
export const X_CART_TOKEN = 'X-Cart-Token';
export const X_SALES_ID = 'X-Sales-ID';
export const X_RETAIL_STORE_ID = 'X-Retail-Store-ID';
export const X_CART_SOURCE = 'X-Cart-Source';
export const X_UID = 'X-UID'; // user id
export const X_EMAIL = 'X-Email'; // user email
export const X_CHECKOUT_TOKEN = 'X-Checkout-Token';
export const X_WAREHOUSE_CODE_STOCK = 'X-WarehouseCode-Stock'; // location_type:stock
export const X_WAREHOUSE_CODE_DISPLAY = 'X-WarehouseCode-Display'; // location_type: display;
export const CUSTOMER_DEFAULT_FIRSTNAME = 'Castlery';
export const CUSTOMER_DEFAULT_LASTNAME = 'Customer';

export const accessInSG = EcEnv.NEXT_PUBLIC_COUNTRY === 'SG';
export const accessInUS = EcEnv.NEXT_PUBLIC_COUNTRY === 'US';
export const accessInAU = EcEnv.NEXT_PUBLIC_COUNTRY === 'AU';
export const accessInCA = EcEnv.NEXT_PUBLIC_COUNTRY === 'CA';
export const accessInUK = EcEnv.NEXT_PUBLIC_COUNTRY === 'UK';
export const accessInSgAndAu = ['SG', 'AU'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
export const accessInSgAndAuAndCA = ['SG', 'AU', 'CA'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
export const accessInSgAndUS = ['SG', 'US'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
export const accessInAuAndUS = ['US', 'AU'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
export const accessInUSAndCA = ['US', 'CA'].includes(EcEnv.NEXT_PUBLIC_COUNTRY);
export const accessExcludeSG = EcEnv.NEXT_PUBLIC_COUNTRY !== 'SG';

export const accessInServer = EcEnv.NEXT_PUBLIC_IS_SERVER;
export const CATEGORY_MIDDLEWARE_REWRITE_PATHNAME = 'category-rewrite-pathname';

export const accessInPos = EcEnv.NEXT_PUBLIC_CHANNEL.toUpperCase() === POS_CHANNEL.toUpperCase();
export const accessInWeb = EcEnv.NEXT_PUBLIC_CHANNEL.toUpperCase() === WEB_CHANNEL.toUpperCase();

export const CountryMapping = {
  SG: 'Singapore',
  US: 'United States',
  AU: 'Australia',
  CA: 'Canada',
  UK: 'United Kingdom',
};

export const StripeAvailableCountriesCodesMapping = {
  SG: 'SG',
  US: 'US',
  AU: 'AU',
  CA: 'CA',
  UK: 'GB',
};

export const StripeAvailableCountryCode =
  StripeAvailableCountriesCodesMapping[EcEnv.NEXT_PUBLIC_COUNTRY as keyof typeof StripeAvailableCountriesCodesMapping];

export const CurrencyMapping = {
  SG: EcEnv.NEXT_PUBLIC_CURRENCY || 'SGD',
  US: EcEnv.NEXT_PUBLIC_CURRENCY || 'USD',
  AU: EcEnv.NEXT_PUBLIC_CURRENCY || 'AUD',
  UK: EcEnv.NEXT_PUBLIC_CURRENCY || 'GBP',
  CA: EcEnv.NEXT_PUBLIC_CURRENCY || 'CAD',
};

export const MarketCurrency = CurrencyMapping[EcEnv.NEXT_PUBLIC_COUNTRY as keyof typeof CurrencyMapping];

export const DY_CLIENT_BASE_URL = 'https://direct.dy-api.com/v2/';
export const DY_SERVER_BASE_URL = 'https://dy-api.com/v2/';

// server side 通过process.env获取环境变量
export const ONEPIECE_HOST = process.env['NEXT_PUBLIC_ONEPIECE_HOST'];

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const subscribeMap = new Map([
  ['SG', true],
  ['AU', true],
  ['US', true],
  ['CA', false],
  ['UK', false],
]);

export const countrySubscribeInitialStatus = subscribeMap.get(EcEnv.NEXT_PUBLIC_COUNTRY);
