import { EcEnv } from '@castlery/config';

export type COUNTRY = 'SG' | 'US' | 'AU' | 'CA' | 'UK';

export const __COUNTRY__ = EcEnv.NEXT_PUBLIC_COUNTRY as COUNTRY;

export const countryNames = {
  SG: 'Singapore',
  US: 'United States',
  AU: 'Australia',
  CA: 'Canada',
  UK: 'United Kingdom',
};

export const layoutStyle = {
  one: {
    sliceWrapperJoyProps: {
      gridColumn: 'span 12',
    },
  },
  two: {
    sliceWrapperJoyProps: {
      gridColumn: { xs: 'span 12', lg: 'span 6' },
    },
  },
  three: {
    sliceWrapperJoyProps: {
      gridColumn: { xs: 'span 12', lg: 'span 4' },
    },
  },
};

export const statesMap = {
  SG: {},
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
  UK: {},
};
export const stateNameOptions =
  statesMap[__COUNTRY__] && Object.keys(statesMap[__COUNTRY__]).length > 0
    ? Object.entries(statesMap[__COUNTRY__]).map(([value, label]) => ({ value, label })) || []
    : [];

export const firstname = {
  key: 'firstname',
  label: 'First Name',
  type: 'input',
  subType: 'text',
};
export const lastname = {
  key: 'lastname',
  label: 'Last Name',
  type: 'input',
  subType: 'text',
};

export const company = {
  key: 'company',
  label: 'Company Name(Optional)',
  type: 'input',
  subType: 'text',
};

export const buildingName = {
  key: 'building_name',
  label: 'Building Name',
  type: 'input',
  subType: 'text',
};
export const street = {
  key: 'street',
  label: 'Street',
  type: 'input',
  subType: 'text',
};
export const streetNumber = {
  key: 'street_number',
  label: 'Block/House',
  type: 'input',
  subType: 'text',
};
export const level = {
  key: 'level',
  label: 'Floor',
  type: 'input',
  subType: 'text',
};
export const flat = {
  key: 'flat',
  label: 'Unit',
  type: 'input',
  subType: 'text',
};
export const buildingType = {
  key: 'building_type',
  label: 'Building Type',
  type: 'select',
  subType: 'single',
  options: [
    {
      value: 'HDB',
      label: 'HDB',
    },
    {
      // Unable to complain: be sure not to delete the spaces between /.
      // The backend will compare based on this string, otherwise it will not match.
      value: 'Condo / Apartment',
      label: 'Condo / Apartment',
    },
    {
      value: 'Landed',
      label: 'Landed',
    },
    {
      value: 'Commercial',
      label: 'Commercial',
    },
  ],
};

export const country = {
  key: 'country',
  label: 'Country',
  type: 'select',
  subType: 'single',
  options: Object.values(countryNames)?.map((value) => ({ value, label: value })) || [],
  joyProps: {
    disabled: true,
  },
};
export const zipcode = {
  key: 'zipcode',
  label: 'Postal Code',
  type: 'input',
  subType: 'text',
};
export const phone = {
  key: 'phone',
  label: 'Phone Number(no space or dash)',
  type: 'input',
  subType: 'tel',
};
export const alternativePhone = {
  key: 'alternative_phone',
  label: 'Alternative Phone',
  type: 'input',
  subType: 'tel',
};

export const apartment = {
  key: 'address2',
  label: 'Apartment, suite, etc',
  type: 'input',
  subType: 'text',
};
export const state = {
  key: 'state_name',
  label: 'State',
  type: 'select',
  subType: 'single',
  options: stateNameOptions,
  // joyProps: {
  //   disabled: true,
  // },
};
export const city = {
  key: 'city',
  label: 'City',
  type: 'input',
  subType: 'text',
};
