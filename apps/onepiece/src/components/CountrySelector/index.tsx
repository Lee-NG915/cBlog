import React from 'react';
import { set as setCookie } from 'helpers/Cookie';
import { countries } from 'config';
import Selector, { CountrySelectorProps } from './CountrySelectorUI';

export const CountrySelector = ({
  mode,
  sx = [],
  showIcon = true,
  size,
}: Pick<CountrySelectorProps, 'mode' | 'sx' | 'showIcon' | 'size'>) => (
  <Selector
    mode={mode}
    defaultValue={__BASE_ROUTE__}
    showIcon={showIcon}
    size={size}
    countries={countries}
    onClick={(event, value) => {
      const selectedCountry = countries.find(({ route }) => route === value);
      setCookie('castlery_shop', selectedCountry?.key as string, 365, '/');
    }}
    sx={sx}
  />
);
