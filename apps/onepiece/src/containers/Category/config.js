import { getConfig, getConfigs } from 'utils/config';
import { isProd } from 'config';

const SORT_OPTIONS_CONFIGS = [
  {
    common: {
      label: 'Recommendation',
      fields: [
        { field: '_score', options: { order: 'desc' } },
        { field: 'rank', options: { order: 'asc' } },
      ],
      defaultOption: true,
      enabled: true,
    },
  },
  {
    common: {
      label: 'Fast Dispatch',
      fields: [
        {
          field: 'variants.lead_time',
          options: {
            order: 'asc',
            mode: 'min',
            nested_path: 'variants',
          },
        },
      ],
      key: 'lead_asc',
      enabled: true,
    },
    US: {
      enabled: false,
    },
  },
  {
    common: {
      label: 'Price: Low to High',
      fields: [
        {
          field: 'variants.price',
          options: {
            order: 'asc',
            mode: 'min',
            nested_path: 'variants',
          },
        },
      ],
      key: 'price_asc',
      enabled: true,
    },
  },
  {
    common: {
      label: 'Price: High to Low',
      fields: [
        {
          field: 'variants.price',
          options: {
            order: 'desc',
            mode: 'min',
            nested_path: 'variants',
          },
        },
      ],
      key: 'price_desc',
      enabled: true,
    },
  },
];

const FILTERS_CONFIG = {
  US: {
    hasLeadTimeFilter: false,
  },
  common: {
    hasLeadTimeFilter: true,
  },
};

const LEAD_TIME_GROUP_CONFIG = {
  SG: [
    { title: 'in 2 working days', from: 0, to: 3 },
    { title: '1 - 2 weeks', from: 3, to: 15 },
    { title: '3 - 5 weeks', from: 15, to: 36 },
    { title: '6 - 8 weeks', from: 36, to: 57 },
    { title: '9 weeks +', from: 57 },
  ],
  common: [
    { title: 'Ready To Ship', from: 0, to: 15 },
    { title: 'in 2 business days', from: 0, to: 3 },
    { title: 'in 1 week', from: 3, to: 8 },
    { title: '1 - 2 weeks', from: 8, to: 15 },
    { title: '2 - 3 weeks', from: 15, to: 22 },
    { title: '3 - 4 weeks', from: 22, to: 29 },
    { title: '4 - 6 weeks', from: 29, to: 43 },
    { title: '7 - 9 weeks', from: 43, to: 64 },
    { title: '10 weeks +', from: 64 },
  ],
};

export const getHost = () => {
  const debugApiHost = !isProd && __CLIENT__ && localStorage?.getItem?.('castlery_debug_api');
  const apiHost = debugApiHost || __APIHOST__;
  return `${apiHost}/product`;
};

export const SORT_OPTIONS = getConfigs(SORT_OPTIONS_CONFIGS).filter((config) => config.enabled);

export const FILTERS = getConfig(FILTERS_CONFIG);
export const LEAD_TIME_GROUP = LEAD_TIME_GROUP_CONFIG[__COUNTRY__] || LEAD_TIME_GROUP_CONFIG.common;

export const getLabelBySortKey = (sortKey) => {
  let key = sortKey;
  if (!key) {
    key = 'none';
  }
  const sortConfig = SORT_OPTIONS.find((config) => config.key === key);
  return sortConfig ? sortConfig.label : '';
};

export const needSubFilter = ['sofas', 'tables', 'chairs', 'beds', 'storage', 'outdoor', 'accessories'];
