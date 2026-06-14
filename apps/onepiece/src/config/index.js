const COUNTRIES = [
  {
    key: 'us',
    code: 'US',
    route: '/us',
    name: 'United States',
    display: 'U.S.',
    icon: 'us-flag',
    lang: 'en-US',
  },
  {
    key: 'sg',
    code: 'SG',
    route: '/sg',
    name: 'Singapore',
    display: 'Singapore',
    icon: 'sg-flag',
    lang: 'en-SG',
  },
  {
    key: 'au',
    code: 'AU',
    route: '/au',
    name: 'Australia',
    display: 'Australia',
    icon: 'au-flag',
    lang: 'en-AU',
  },
  {
    key: 'ca',
    code: 'CA',
    route: '/ca',
    name: 'Canada',
    display: 'Canada',
    icon: 'ca-flag',
    lang: 'en-CA',
  },
  {
    key: 'uk',
    code: 'UK',
    route: '/uk',
    name: 'United Kingdom',
    display: 'UK',
    icon: 'uk-flag',
    lang: 'en-GB',
  },
];
const PHONE_VALIDATORS = {
  SG: /^(\+?65(\s|-)?)?\d{4}(\s|-)?\d{4}$/,
  AU: /^(?:\+?61|0)[ -]?[2-478](?:[ -]?\d){8}$/,
  US: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  CA: /^(\+1\s?)?(\(?[23456789]{1}[0-9]{2}\)?)[\s-]?\d{3}[\s-]?\d{4}$/,
  UK: /^(?:\+44[\s-]?|0)(?:\d[\s-]?){9,10}$/,
};

const POSTAL_CODE_VALIDATORS = {
  SG: /^\d{6}$/,
  AU: /^\d{4}$/,
  US: /^\d{5}(-?\d{4})?$/,
  CA: /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z]\s?[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/,
  UK: '', // uk使用第三方库
};

const STATES = {
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

const TAX_RATES = {
  SG: 7,
  AU: 10,
  US: undefined, // set US TAX_RATE as undefined explicitly
  CA: undefined, // set US TAX_RATE as undefined explicitly
  UK: undefined, // set US TAX_RATE as undefined explicitly
};

const DEFAULT_CITY = {
  SG: {
    city: 'SINGAPORE',
    state: '01',
  },
  AU: {
    city: 'SYDNEY',
    state: 'NSW',
    zipcode: '2000',
  },
  US: {
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90024',
  },
  CA: {
    city: 'Toronto',
    state: 'ON',
    zipcode: 'M5H 2N1',
  },
  UK: {
    city: 'London',
    state: 'Greater London',
    zipcode: 'WC1A 1AA',
  },
};

const REGION_ID_MAP = {
  US: {
    901234: {
      zipcode: '10002',
      city: 'New York',
      state: 'NY',
    },
    901235: {
      zipcode: '30306',
      city: 'Atlanta',
      state: 'GA',
    },
    801234: {
      zipcode: '90001',
      city: 'Los Angeles',
      state: 'CA',
    },
    801235: {
      zipcode: '98101',
      city: 'Seattle',
      state: 'WA',
    },
  },
  AU: {},
  SG: {},
  CA: {},
  UK: {},
};

const KNIGHT_HOSTS = {
  SG: `https://knight.castlery.sg/spree/admin`,
  AU: `https://knight.castlery.com.au/spree/admin`,
  US: `https://knight.castlery.co/spree/admin`,
  CA: `https://knight.castlery.co/spree/admin`,
};

const isProd = __APPLICATION_ENV__.includes('prod') || __APPLICATION_ENV__.includes('uat');
const isUat = __APPLICATION_ENV__.includes('uat');
const privateCloudinaryBasePath = 'castlery';
const cloudinaryRoot = 'https://res.cloudinary.com/castlery/image/upload';
const videoCloudinaryRoot = 'https://res.cloudinary.com/castlery/video/upload';
const privateCloudinaryRoot = `https://res.cloudinary.com/${privateCloudinaryBasePath}/image/private`;
const privateVideoCloudinaryRoot = `https://res.cloudinary.com/${privateCloudinaryBasePath}/video/private`;
// TODO: brand refesh url test
const hostUrl = `${__HOST__}${__DEVELOPMENT__ ? `:${__PORT__}` : ''}`;
// const hostUrl = __HOST__;
const DESIGNERS = [
  {
    key: 'charles-wilson',
    name: 'Charles Wilson',
    country: 'Australia',
    image: `${cloudinaryRoot}/static/designer-community/charles.jpg`,
  },
  {
    key: 'krystian-kowalski',
    name: 'Krystian Kowalski',
    country: 'Poland',
    image: `${cloudinaryRoot}/static/designer-community/krystian.jpg`,
  },
  {
    key: 'paolo-cappello',
    name: 'Paolo Cappello',
    country: 'Italy',
    image: `${cloudinaryRoot}/static/designer-community/paolo.jpg`,
  },
  {
    key: 'daniel-emma',
    name: 'Daniel Emma',
    country: 'Australia',
    image: `${cloudinaryRoot}/static/designer-community/daniel.jpg`,
    disabled: true,
  },
  {
    key: 'james-harrison',
    name: 'James Harrison',
    country: 'United Kingdom',
    image: `${cloudinaryRoot}/static/designer-community/james.jpg`,
  },
  {
    key: 'marcel-sigel',
    name: 'Marcel Sigel',
    country: 'Australia',
    image: `${cloudinaryRoot}/static/designer-community/marcel.jpg`,
    disabled: __COUNTRY__ === 'AU' || __COUNTRY__ === 'US',
  },
  {
    key: 'phil-procter',
    name: 'Phil Procter',
    country: 'Netherland',
    image: `${cloudinaryRoot}/static/designer-community/phil.jpg`,
    disabled: true,
  },
  {
    key: 'yonoh-studio',
    name: 'Yonoh Studio',
    country: 'Spain',
    image: `${cloudinaryRoot}/static/designer-community/yonoh.jpg`,
    disabled: true,
  },
];
const FRESHCHAT_BUSINESS_HOURS = {
  SG: {
    Weekdays: {
      from: '10:00 AM',
      to: '10:00 PM',
    },
    Weekends: {
      from: '10:00 AM',
      to: '10:00 PM',
    },
  },
  AU: {
    Weekdays: {
      from: '09:30 AM',
      to: '05:00 PM',
    },
    Weekends: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  US: {
    Weekdays: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  CA: {
    Weekdays: {
      from: '10:00 AM',
      to: '06:00 PM',
    },
  },
  UK: {
    Weekdays: {
      from: '8:00 AM',
      to: '8:00 PM',
    },
  },
};

const PRICE_BREAK_CAMPAIGN = {
  SG: [
    {
      startDate: '2023-07-31 00:00',
      endDate: '2023-08-05 00:00',
      link: '/sale/national-day-sale',
      campaignName: 'National Day Sale',
      discounts: [
        {
          limit: 1500,
          label: '$80 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$180 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$450 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
    {
      startDate: '2023-08-05 00:00',
      endDate: '2023-08-14 00:00',
      link: '/sale/national-day-sale',
      campaignName: 'National Day Sale',
      discounts: [
        {
          limit: 1500,
          label: '$100 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$230 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$550 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
    {
      startDate: '2023-08-14 00:00',
      endDate: '2023-08-21 00:00',
      link: '/sale/national-day-sale',
      campaignName: 'National Day Sale',
      discounts: [
        {
          limit: 1500,
          label: '$80 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$180 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$450 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
  ],
  AU: [
    // {
    //   startDate: '2022-08-01 00:00',
    //   endDate: '2022-08-22 00:00',
    //   link: '/winter-sale',
    //   campaignName: 'Winter Storewide Sale',
    //   discountStrategy: {
    //     off: 100,
    //     increment: 1200,
    //     minLimit: 1200,
    //     maxLimit: 10800,
    //   },
    // },
    {
      startDate: '2023-08-21 00:00',
      endDate: '2023-09-11 00:00',
      link: '/sale/spring-storewide-sale',
      campaignName: 'Spring Storewide Sale',
      discounts: [
        {
          limit: 1500,
          label: '$100 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$200 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$450 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
  ],
  US: [
    // {
    //   startDate: '2022-08-22 00:00',
    //   endDate: '2022-09-13 00:00',
    //   link: '/sale/labor-day-sale',
    //   campaignName: 'Labor Day Sale',
    //   discountStrategy: {
    //     off: 100,
    //     increment: 1200,
    //     minLimit: 1200,
    //     maxLimit: 10800,
    //   },
    // },
    {
      startDate: '2023-08-21 00:00',
      endDate: '2023-09-11 00:00',
      link: '/sale/labor-day-sale',
      campaignName: 'Labor Day Sale',
      discounts: [
        {
          limit: 1200,
          label: '$100 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$250 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$550 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
  ],
  CA: [
    // {
    //   startDate: '2022-08-22 00:00',
    //   endDate: '2022-09-13 00:00',
    //   link: '/sale/labor-day-sale',
    //   campaignName: 'Labor Day Sale',
    //   discountStrategy: {
    //     off: 100,
    //     increment: 1200,
    //     minLimit: 1200,
    //     maxLimit: 10800,
    //   },
    // },
    {
      startDate: '2023-08-21 00:00',
      endDate: '2023-09-11 00:00',
      link: '/sale/labor-day-sale',
      campaignName: 'Labor Day Sale',
      discounts: [
        {
          limit: 1200,
          label: '$100 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 2500,
          label: '$250 off',
          icon: 'shop-cart-outline',
        },
        {
          limit: 4500,
          label: '$550 off',
          icon: 'shop-cart-outline',
        },
      ],
    },
  ],
};

// bedroom living dining bedroom
const FREE_FABRIC_ENABLED = {
  SG: true,
  AU: true,
  US: true,
  CA: true,
  UK: true,
};
const SERVICE_CONFIG_BASE = {
  standard_service: {
    support: [
      'Delivered to your building lobby or first dry-area of your house.',
      'Delivered via courier with signature required.',
    ],
    nonsupport: ['No unpacking, assembly or rubbish removal.'],
  },
  standard: {
    support: [
      'Delivered to ground floor at front entrance, lift lobby or foot of stairs.',
      'Delivered via courier with signature required.',
      'Tracking info provided.',
    ],
    nonsupport: ['No scheduling of delivery, carrying up of items, unpacking, assembly or rubbish removal.'],
  },
  room_of_choice: {
    most_popular: true,
    most_popular_label: 'Most popular',
    support: [
      'Delivered to your room of choice, including up to two flights of stairs.',
      'Delivered via courier with signature required.',
    ],
    nonsupport: ['No unpacking, assembly or rubbish removal.'],
  },
  white_glove: {
    support: [
      'Delivered to your room of choice, including up to two flights of stairs.',
      'Delivered via courier with signature required.',
      'Unpacking, assembly and rubbish removal. (excl. existing furniture)',
    ],
  },
};

const SERVICE_CONFIG_CA = {
  standard_service: {
    support: [
      'Delivered to ground floor at front entrance, lift lobby, or foot of stairs.',
      'Delivered via courier.',
      'Tracking information provided.',
    ],
    nonsupport: ['No carrying items upstairs, unpacking/assembly/garbage removal.'],
  },
  standard: {
    support: [
      'Delivered to ground floor at front entrance, lift lobby, or foot of stairs.',
      'Delivered via courier.',
      'Tracking information provided.',
    ],
    nonsupport: ['No carrying items upstairs, unpacking/assembly/garbage removal.'],
  },
  room_of_choice: {
    most_popular: true,
    most_popular_label: 'Most popular',
    support: [
      'Delivered to your chosen room (up to 2 flights of stairs).',
      'Delivered via courier (signature required).',
    ],
    nonsupport: ['No unpacking/assembly/garbage removal.'],
  },
  white_glove: {
    support: [
      'Delivered to your chosen room (up to 2 flights of stairs).',
      'Delivered via courier (signature required).',
      'Includes unpacking, assembly & garbage removal(Excludes existing furniture).',
    ],
  },
};

const SERVICE_CONFIG_REGION = {
  SG: SERVICE_CONFIG_BASE,
  AU: SERVICE_CONFIG_BASE,
  US: SERVICE_CONFIG_BASE,
  CA: SERVICE_CONFIG_CA,
  UK: Object.keys(SERVICE_CONFIG_BASE).reduce((acc, key) => {
    let item = SERVICE_CONFIG_BASE[key];
    if (item.most_popular) {
      item = {
        ...item,
        most_popular_label: 'Free upgrade',
      };
    }
    if (key === 'standard') {
      item.support = item.support.splice(0, 2);
    }
    return { ...acc, [key]: item };
  }, {}),
};

const SERVICE_CONFIG = SERVICE_CONFIG_REGION[__COUNTRY__];

const HULLA_EXPERIENCE_LABEL = {
  SG: 'room-builder-sg',
  AU: 'room-builder-aus',
  US: 'room-builder',
  CA: 'room-builder-ca',
  UK: 'room-builder-uk',
};

const EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const DY_RECS_URL = __SERVER__
  ? 'https://dy-api.com/v2/serve/user/choose'
  : 'https://direct.dy-api.com/v2/serve/user/choose';

const subscribeMap = new Map([
  ['SG', true],
  ['AU', true],
  ['US', true],
  ['CA', false],
  ['UK', false],
]);

const countrySubscribeInitalStatus = subscribeMap.get(__COUNTRY__);

const enableO2O = ['SG', 'AU'].includes(__COUNTRY__);
const enableUnifiedDataLayer = ['SG', 'AU', 'US', 'CA', 'UK'].includes(__COUNTRY__);

const isShippingServiceFeatureEnabled = ['US', 'AU', 'CA', 'UK'].includes(__COUNTRY__);

const enableAlert = ['US', 'CA', 'UK'].includes(__COUNTRY__);

const addressFeatureInSG = __COUNTRY__ === 'SG';
const addressFeatureInAU = __COUNTRY__ === 'AU';
const addressFeatureInUS = __COUNTRY__ === 'US';
const addressFeatureInCA = __COUNTRY__ === 'CA';

const globalFeatureInSG = __COUNTRY__ === 'SG';
const globalFeatureInAU = __COUNTRY__ === 'AU';
const globalFeatureInUS = __COUNTRY__ === 'US';
const globalFeatureInCA = __COUNTRY__ === 'CA';
const globalFeatureInUK = __COUNTRY__ === 'UK';

const zipcodeFormatUtils = {
  SG: (value) => value,
  AU: (value) => value,
  US: (value) => value,
  CA: (value) => {
    if (!value) return value;
    const upperCaseValue = value.toUpperCase();
    const str = upperCaseValue.replace(/\s/g, '');
    const match = str.match(/^(\w{3})(\w{3})$/);
    if (match) {
      const str = `${match[1]} ${match[2]}`;
      return str;
    }
    return upperCaseValue;
  },
  UK: (value) => {
    if (!value) return '';
    return value.toUpperCase();
  },
};

const zipcodeFormatForValidate = {
  SG: (value) => value,
  AU: (value) => value,
  US: (value) => value,
  CA: (value) => value,
  UK: (value) => {
    if (!value) return '';
    const postcode = value.replace(/\s+/g, '').toUpperCase();
    if (postcode.length < 5 || postcode.length > 7) return postcode;

    // 拆分成前缀和后缀（后三位始终为后缀）
    const outward = postcode.slice(0, postcode.length - 3);
    const inward = postcode.slice(-3);
    return `${outward} ${inward}`;
  },
};
const regionalZipcodeFormatForValidate = zipcodeFormatForValidate[__COUNTRY__];

const phoneNumberFormatUtils = {
  US: (value) => {
    if (!value) return '';
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },
  CA: (value) => {
    if (!value) return '';
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },
  SG: (value) => value,
  AU: (value) => value,
  UK: (value) => {
    if (!value) return '';

    const str = value.startsWith('44') ? value.replace('44', '+44 ') : value;
    const newStr = str.replaceAll(/\s{2,}/g, ' ');
    const reg = /^(?![+0])/; // 不以+或者0开头时，自动补充+44
    if (reg.test(newStr)) {
      return `+44 ${newStr}`;
    }
    return newStr;
  },
};
const zipcodeFormatUtil = zipcodeFormatUtils[__COUNTRY__];
const getCityByZipcodeEnabled = ['US', 'CA', 'UK'].includes(__COUNTRY__);
const enabledZipcodeFeature = __COUNTRY__ !== 'SG';
const enabledHardcodeFreeShipping = __COUNTRY__ === 'SG';
const sgFreeShippingThreshold = 500;

const autoSuggestSearchEnabled = ['SG', 'AU'].includes(__COUNTRY__);
const autoSuggestSearchZipcodeEnabled = ['SG', 'AU'].includes(__COUNTRY__);
const googlePlaceEnabledInSearchAddress = __COUNTRY__ !== 'SG';
const googlePlaceEnabledInSearchZipcode = ['US', 'CA', 'UK'].includes(__COUNTRY__);

const paypalClientIdRequired = __COUNTRY__ === 'AU' && __PAYPAL_CLIENT_ID__;
const enabledAfterPay = __COUNTRY__ === 'AU';

const showSalesTax = ['US', 'CA'].includes(__COUNTRY__);
const showTaxPolicy = ['US', 'CA', 'UK'].includes(__COUNTRY__);

const enabledShowEstimateShipping = __COUNTRY__ !== 'SG';

const enabledPostHog = false;
const enabledFreeshippingCookieForDY = __COUNTRY__ === 'US';

const enableGladlyChatContent = __COUNTRY__ !== 'SG';

const enableAmbassadorInFooter = ['US', 'CA', 'UK', 'AU'].includes(__COUNTRY__);

const enableAccessibilityTool = ['US', 'CA', 'UK'].includes(__COUNTRY__);

const enableCKYTool = ['US', 'CA', 'UK'].includes(__COUNTRY__) && __COOKIEYES_ENABLED__;

const cookieConsentLabels = {
  SG: '',
  AU: '',
  CA: 'Cookies',
  US: 'Do Not Sell or Share My Personal Information',
  UK: 'Cookies',
};
const cookieConsentLabel = cookieConsentLabels[__COUNTRY__];
const enableDisplayOriginAmount = __COUNTRY__ !== 'US';

const enableDisplayLeadtime = ['SG', 'AU', 'UK'].includes(__COUNTRY__);

const enableZipcodeUpdate = __COUNTRY__ !== 'SG';

const enableRegisteredAddress = ['SG', 'CA', 'UK'].includes(__COUNTRY__);

const enablePrivacyPolicy = ['SG', 'AU', 'CA', 'UK'].includes(__COUNTRY__);

const enableTermsOfUse = ['US'].includes(__COUNTRY__);

const enableSpecificPrivacyPolicy = ['CA', 'UK'].includes(__COUNTRY__);

const enableAccountPhoneValidate = __COUNTRY__ !== 'CA' || __COUNTRY__ !== 'UK';

const enableSpecializesSpell = ['US', 'CA'].includes(__COUNTRY__);

const enableDisplayBlueSofaLink = __COUNTRY__ !== 'US';

const enableQuickShip = ['US', 'CA'].includes(__COUNTRY__);

const enableDisplayItemsInA = __COUNTRY__ !== 'SG';

const enableShowroom = ['SG', 'AU'].includes(__COUNTRY__);

const enableDisplayProductShipping = __COUNTRY__ !== 'SG';

const enableDisplayContactText = ['US', 'CA', 'UK'].includes(__COUNTRY__);

const enableDisplayDataPrivacyText = __COUNTRY__ !== 'US';

const enableShowPONumberExplanation = __COUNTRY__ !== 'SG';

const enableIsOffLine = __COUNTRY__ === 'AU' || __COUNTRY__ === 'SG';

const enableDisplayContactNumber = __COUNTRY__ !== 'SG';

const enableDisplayNorthAmerica = ['US', 'CA'].includes(__COUNTRY__);

const enableHPMigrationTest = ['SG', 'AU'].includes(__COUNTRY__);

const enableDisplayStudioLink = __COUNTRY__ !== 'US';

const enableThirtyDaysReturn = ['SG', 'CA'].includes(__COUNTRY__);

const enableSpecialInSwatches = ['CA', 'UK'].includes(__COUNTRY__);

const enableHideGladly = ['CA'].includes(__COUNTRY__);

const enableReviewMainIntro = ['US', 'SG', 'AU'].includes(__COUNTRY__);

const enabledShowPreferredDeliveryButton = !['CA', 'US'].includes(__COUNTRY__); // Request For Preferred Delivery Period

const enabledShowFreeShippingTip = __COUNTRY__ === 'US';

const enabledShowECOTipOnTop = ['AU', 'US', 'UK', 'CA'].includes(__COUNTRY__); // ECO Tip required to be shown on top of the shipments when the market is not SG
const enableIndustryField = ['CA', 'UK'].includes(__COUNTRY__);
const enableReviewBtnInHome = ['SG', 'US', 'AU'].includes(__COUNTRY__);

const enableOurDesignersPage = ['SG', 'US', 'AU'].includes(__COUNTRY__);
const enableWarehouseFrom = ['SG', 'US', 'AU', 'CA'].includes(__COUNTRY__);

const enableUKSpecialInSwatches = ['UK'].includes(__COUNTRY__);

const enableCASpecialInSwatches = ['CA'].includes(__COUNTRY__);

const enableSpecialDeliveryReview = ['SG', 'US', 'CA', 'UK'].includes(__COUNTRY__);

const enableGuarantee = ['UK'].includes(__COUNTRY__);
const enableSustainabilityPage = ['SG', 'AU', 'US'].includes(__COUNTRY__);

const enabledConsentBlocked = ['CA', 'UK'].includes(__COUNTRY__);
const enablePostcode = ['AU', 'UK'].includes(__COUNTRY__);

const enableNewPromotion = ['CA', 'SG', 'US', 'AU', 'UK'].includes(__COUNTRY__);

const locationFormat = {
  AU: '{{zipcode}}, {{state}}',
  US: '{{city}} - {{zipcode}}',
  CA: '{{city}} - {{zipcode}}',
  SG: '{{city}} - {{zipcode}}',
};

const allGrantedConsent = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
};
const deniedAnlysOrAdConsent = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
};
/**
 * google consent type:
 * https://www.cookieyes.com/documentation/implementing-google-consent-mode-using-cookieyes/#Google_Con_8
 */
const defaultConsent = {
  SG: allGrantedConsent,
  AU: allGrantedConsent,
  US: allGrantedConsent,
  CA: deniedAnlysOrAdConsent,
  UK: deniedAnlysOrAdConsent,
};

const StripeIntlSettings = {
  AU: {
    currency: 'AUD',
    country: 'AU',
  },
  US: {
    currency: 'USD',
    country: 'US',
  },
  CA: {
    currency: 'CAD',
    country: 'CA',
  },
  UK: {
    currency: 'GBP',
    country: 'GB',
  },
  SG: {
    currency: 'SGD',
    country: 'SG',
  },
};

const addressFormFeatures = {
  SG: {
    formCityName: 'City/Town *',
    formStateName: 'State *',
    formZipcodeName: 'Postal Code *',
    enabledShowStateInAddressForm: true,
    useThirdPartyZipcodeValidator: false,
    zipcodeValidErrorMsg: 'Please enter a valid postal code',
  },
  AU: {
    formCityName: 'Suburb *',
    formStateName: 'State/Territory *',
    formZipcodeName: 'Postal Code *',
    enabledShowStateInAddressForm: true,
    useThirdPartyZipcodeValidator: false,
    zipcodeValidErrorMsg: 'Please enter a valid postal code',
  },
  US: {
    formCityName: 'City/Town *',
    formStateName: 'State *',
    formZipcodeName: 'Zip Code *',
    enabledShowStateInAddressForm: true,
    useThirdPartyZipcodeValidator: false,
    zipcodeValidErrorMsg: 'Please enter a valid zip code',
  },
  CA: {
    formCityName: 'City/Town *',
    formStateName: 'Province/Territory *',
    formZipcodeName: 'Zip Code *',
    enabledShowStateInAddressForm: true,
    useThirdPartyZipcodeValidator: false,
    zipcodeValidErrorMsg: 'Please enter a valid zip code',
  },
  UK: {
    formCityName: 'City/Town *',
    formStateName: '',
    formZipcodeName: 'Postcode *',
    enabledShowStateInAddressForm: false,
    useThirdPartyZipcodeValidator: true,
    zipcodeValidErrorMsg: 'Please enter a valid postcode',
  },
};
const showApartmentBeforeStreet = __COUNTRY__ === 'UK';
const enableFreeROC = __COUNTRY__ === 'UK';
const enableCAPIV2 = __COUNTRY__ !== 'US';

const enableHasShowroom = ['SG', 'US', 'AU', 'CA'].includes(__COUNTRY__);

const placeholderInCitySearchMap = {
  AU: 'Postcode/Suburb *',
  US: 'Zip Code',
  CA: 'Zip Code',
  SG: 'Zip Code',
  UK: 'Postcode',
};
const placeholderInCitySearch = placeholderInCitySearchMap[__COUNTRY__];
const enabledTrackProductViewedMoreThan3 = __COUNTRY__ !== 'CA';

const enableSustainableFilter = ['SG'].includes(__COUNTRY__);

const enableCasa = ['SG', 'US'].includes(__COUNTRY__);

module.exports = {
  // these configs are only used on client
  fbAppId: __FACEBOOK_CLIENT_ID__,
  googleMapApiKey: __GOOGLE_MAP_API_KEY__,
  currency: __CURRENCY__,
  sentryDSN: __SENTRY_DSN__,
  isProd,
  isUat,
  cloudinaryRoot,
  videoCloudinaryRoot,
  privateCloudinaryRoot,
  privateVideoCloudinaryRoot,
  daysInStock: 7,
  knightHost: KNIGHT_HOSTS[__COUNTRY__],
  outOfStockLeadTime: 9999,
  phoneRegExp: PHONE_VALIDATORS[__COUNTRY__],
  postalCodeRegExp: POSTAL_CODE_VALIDATORS[__COUNTRY__],
  states: STATES[__COUNTRY__],
  taxRate: TAX_RATES[__COUNTRY__],
  defaultCity: DEFAULT_CITY[__COUNTRY__],
  designers: DESIGNERS,
  fcBusinessHours: FRESHCHAT_BUSINESS_HOURS[__COUNTRY__],
  regionIdMap: REGION_ID_MAP[__COUNTRY__],
  hitsPerPage: 24,
  priceBreakCampaigns: PRICE_BREAK_CAMPAIGN[__COUNTRY__],
  freeFabricEnabled: FREE_FABRIC_ENABLED[__COUNTRY__],
  countries: COUNTRIES,
  emailRegExp: EMAIL,
  hostUrl,
  DY_RECS_URL,
  countrySubscribeInitalStatus,
  enableO2O,
  isShippingServiceFeatureEnabled,
  enableAlert,
  addressFeatureInSG,
  addressFeatureInAU,
  addressFeatureInUS,
  addressFeatureInCA,
  autoSuggestSearchEnabled,
  getCityByZipcodeEnabled,
  enabledZipcodeFeature,
  enabledHardcodeFreeShipping,
  sgFreeShippingThreshold,
  paypalClientIdRequired,
  enabledAfterPay,
  showSalesTax,
  showTaxPolicy,
  enabledShowEstimateShipping,
  enabledPostHog,
  enabledFreeshippingCookieForDY,
  locationFormat: locationFormat[__COUNTRY__],
  enableGladlyChatContent,
  enableAmbassadorInFooter,
  enableAccessibilityTool,
  globalFeatureInSG,
  globalFeatureInUS,
  globalFeatureInAU,
  globalFeatureInUK,
  globalFeatureInCA,
  enableCKYTool,
  enableDisplayOriginAmount,
  enableDisplayLeadtime,
  enableZipcodeUpdate,
  enableRegisteredAddress,
  enablePrivacyPolicy,
  enableTermsOfUse,
  enableSpecificPrivacyPolicy,
  enableAccountPhoneValidate,
  enableSpecializesSpell,
  enableDisplayBlueSofaLink,
  enableQuickShip,
  enableDisplayItemsInA,
  enableShowroom,
  enableDisplayProductShipping,
  enableDisplayContactText,
  enableDisplayDataPrivacyText,
  enableShowPONumberExplanation,
  enableIsOffLine,
  enableDisplayContactNumber,
  enableDisplayNorthAmerica,
  enableHPMigrationTest,
  enableDisplayStudioLink,
  enableUnifiedDataLayer,
  enableThirtyDaysReturn,
  enableSpecialInSwatches,
  enableHideGladly,
  serviceConfig: __COUNTRY__ === 'CA' ? SERVICE_CONFIG_CA : SERVICE_CONFIG,
  zipcodeFormatUtil,
  enableReviewMainIntro,
  enabledShowPreferredDeliveryButton,
  enabledShowFreeShippingTip,
  enabledShowECOTipOnTop,
  addressFormFeature: addressFormFeatures[__COUNTRY__],
  phoneNumberFormatUtil: phoneNumberFormatUtils[__COUNTRY__],
  stripeIntlConfig: StripeIntlSettings[__COUNTRY__],
  showApartmentBeforeStreet,
  enableSustainabilityPage,
  hullaExperienceLabel: HULLA_EXPERIENCE_LABEL[__COUNTRY__],
  enableFreeROC,
  enableCAPIV2,
  enableIndustryField,
  enableReviewBtnInHome,
  enableOurDesignersPage,
  enableWarehouseFrom,
  enableUKSpecialInSwatches,
  enableCASpecialInSwatches,
  enableSpecialDeliveryReview,
  enableGuarantee,
  cookieConsentLabel,
  regionalDefaultConsent: defaultConsent[__COUNTRY__],
  enabledConsentBlocked,
  cookieYesConsentAdsAttribute: {
    'data-cookieyes': 'cookieyes-advertisement',
  },
  enablePostcode,
  enableHasShowroom,
  placeholderInCitySearch,
  regionalZipcodeFormatForValidate,
  googlePlaceEnabledInSearchAddress,
  autoSuggestSearchZipcodeEnabled,
  googlePlaceEnabledInSearchZipcode,
  enabledTrackProductViewedMoreThan3,
  enableNewPromotion,
  enabledRemoveNameOfSignup: true,
  enabledIntegrationUTTByCode: ['UK', 'CA'].includes(__COUNTRY__) && __UTT_SCRIPT_URL__,
  enableSustainableFilter,
  enableCasa,
};
