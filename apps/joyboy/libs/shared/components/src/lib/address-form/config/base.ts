import { CustomerAddressEntity, CustomerAddressEntity_V2 } from '@castlery/types';

export {
  PhoneFormatRegexMapping,
  phoneNumberFormattingUtils,
  validatePhoneNumber,
  validatePostcode,
} from '@castlery/utils';

export type AddressFormTranslationKey =
  | 'firstname'
  | 'lastname'
  | 'phone'
  | 'alternativePhone'
  | 'address1'
  | 'address2'
  | 'street'
  | 'streetNumber'
  | 'buildingType'
  | 'buildingName'
  | 'floorUnitCheckbox'
  | 'level'
  | 'flat'
  | 'country'
  | 'stateName'
  | 'city'
  | 'zipcode'
  | 'company';

export type AddressFormFieldKey =
  | AddressFormTranslationKey
  | 'street_number'
  | 'building_type'
  | 'building_name'
  | 'state_name';

export const formItemLayout = {
  oneColumn: {
    gridColumn: { xs: 'span 12', lg: 'span 12' },
  },
  twoColumn: {
    gridColumn: { xs: 'span 12', lg: 'span 6' },
  },
};

export interface AddressFormField {
  key: AddressFormFieldKey;
  translationKey: AddressFormTranslationKey;
  type: 'input' | 'select' | 'checkbox';
  label?: string;
  placeholder?: string;
  value?: string;
  required: boolean;
  options?: {
    value: string;
    label: string;
  }[];
  validation?:
    | {
        minLength?: number;
        maxLength?: number;
      }
    | {
        validate: (value: string) => boolean | string;
      }
    | {
        pattern: RegExp;
      };
  formatter?: (value: string) => string;
  layoutStyle: {
    gridColumn: {
      xs: string;
      lg: string;
    };
  };
  disabled?: boolean;
  defaultValueReWrite?: (defaultAddress: CustomerAddressEntity | CustomerAddressEntity_V2) => string;
}

export const STATES = {
  US: {
    AL: 'Alabama',
    AK: 'Alaska',
    AS: 'American Samoa',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District Of Columbia',
    FM: 'Federated States Of Micronesia',
    FL: 'Florida',
    GA: 'Georgia',
    GU: 'Guam',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MH: 'Marshall Islands',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    MP: 'Northern Mariana Islands',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PW: 'Palau',
    PA: 'Pennsylvania',
    PR: 'Puerto Rico',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VI: 'Virgin Islands',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  },
  AU: {
    ACT: 'Australian Capital Territory',
    NSW: 'New South Wales',
    NT: 'Northern Territory',
    QLD: 'Queensland',
    SA: 'South Australia',
    TAS: 'Tasmania',
    VIC: 'Victoria',
    WA: 'Western Australia',
  },
  CA: {
    AB: 'Alberta',
    BC: 'British Columbia',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador',
    NS: 'Nova Scotia',
    ON: 'Ontario',
    PE: 'Prince Edward Island',
    QC: 'Quebec',
    SK: 'Saskatchewan',
    NT: 'Northwest Territories',
    NU: 'Nunavut',
    YT: 'Yukon',
  },
};

export const getStateOptions = (region: 'AU' | 'US' | 'CA') => {
  const target = STATES[region];
  if (!target) return [];
  const stateOptions = Object.entries(target).map(([key, value]) => ({
    label: value,
    value: key,
  }));
  return stateOptions || [];
};

/**
 * prd: https://castlery.atlassian.net/wiki/x/lwEds
 * 创建/编辑时不显示，展示地址内容使用此字段，例如address list, delivery/payment页面address的展示
 * street_number + street + level + flat + unit 拼接, all market use this field
 * @param defaultAddress
 * @returns
 */
export const address1DefaultValueReWrite = (defaultAddress: CustomerAddressEntity | CustomerAddressEntity_V2) => {
  if (!defaultAddress) return '';
  if ('address1' in defaultAddress) {
    return defaultAddress.address1 ? defaultAddress.address1.trim() : '';
  }
  const { streetNumber, street_number, street, level, flat, unit } = defaultAddress;
  return `${streetNumber ?? street_number ?? ''}${street ?? ''}${level ?? ''}${flat ?? ''}${unit ?? ''}`.trim();
};

export const companyDefaultValueReWrite = (defaultAddress: CustomerAddressEntity | CustomerAddressEntity_V2) => {
  if (!defaultAddress) return '';
  return defaultAddress.company ?? '';
};

export const getNewVersionAddressFormValues = (addressData: CustomerAddressEntity_V2 | CustomerAddressEntity) => {
  return {
    firstname: addressData?.firstname || undefined,
    lastname: addressData?.lastname || undefined,
    phone: addressData?.phone || undefined,
    alternativePhone:
      (addressData as CustomerAddressEntity_V2)?.alternativePhone ||
      (addressData as CustomerAddressEntity)?.alternative_phone ||
      undefined,
    address1: addressData?.address1?.trim() || undefined,
    address2: addressData?.address2 || undefined,
    street: addressData?.street || undefined,
    streetNumber:
      (addressData as CustomerAddressEntity_V2)?.streetNumber ||
      (addressData as CustomerAddressEntity)?.street_number ||
      undefined,
    level: addressData?.level || undefined,
    flat: addressData?.flat || undefined,
    buildingType:
      (addressData as CustomerAddressEntity_V2)?.buildingType ||
      (addressData as CustomerAddressEntity)?.building_type ||
      undefined,
    buildingName:
      (addressData as CustomerAddressEntity_V2)?.buildingName ||
      (addressData as CustomerAddressEntity)?.building_name ||
      undefined,
    country: addressData?.country || undefined,
    zipcode: addressData?.zipcode || undefined,
    stateName:
      (addressData as CustomerAddressEntity_V2)?.stateName ||
      (addressData as CustomerAddressEntity)?.state_name ||
      undefined,
    city: addressData?.city || undefined,
    company: addressData?.company || undefined,
    unit: addressData?.unit || undefined,
  };
};
