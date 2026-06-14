'use client';

import React from 'react';
import Selector, { CountrySelectorProps } from './components/country-selector-ui/country-selector-ui';
import { EcEnv } from '@castlery/config';

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

export const CountrySelector = ({
  mode,
  sx = [],
  showIcon = true,
  size,
  inFooter = false,
}: Pick<CountrySelectorProps, 'mode' | 'sx' | 'showIcon' | 'size' | 'inFooter'>) => (
  <Selector
    mode={mode}
    defaultValue={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
    showIcon={showIcon}
    size={size}
    countries={COUNTRIES}
    inFooter={inFooter}
    onClick={(event, value) => {
      const selectedCountry = COUNTRIES.find(({ route }) => route === value);
      console.log('🚀 ~ selectedCountry:', selectedCountry);
      // setCookie('castlery_shop', selectedCountry?.key as string, 365, '/');
    }}
    sx={sx}
  />
);
