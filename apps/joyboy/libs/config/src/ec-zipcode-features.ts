import { EcEnv } from './ec-env';
export const DEFAULT_CITY = {
  SG: {
    city: 'SINGAPORE',
    state: '01',
    zipcode: '',
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
export const BRISBANE_DEFAULT_CITY = {
  city: 'Brisbane',
  state: 'QLD',
  zipcode: '4000',
};

export const REGION_ID_MAP = {
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

export const currentDefaultCity = DEFAULT_CITY[EcEnv.NEXT_PUBLIC_COUNTRY];
export const currentRegionIdMap = REGION_ID_MAP[EcEnv.NEXT_PUBLIC_COUNTRY];
export const globalDefaultCity = DEFAULT_CITY['US'];
