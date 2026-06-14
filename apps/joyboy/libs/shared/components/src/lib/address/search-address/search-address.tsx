'use client';
import React from 'react';
import { SearchGooglePlaces, type GooglePlaceValues } from '../search-google-places/search-google-places';
import { SearchSgPlaces } from '../search-sg-places/search-sg-places';
import { checkoutFeatureService } from '@castlery/modules-checkout-services';

export type SearchAddressValue = GooglePlaceValues;
export interface SearchAddressProps {
  defaultValue?: GooglePlaceValues | null;
  onChange?: (value: GooglePlaceValues | null) => void;
  onClick?: () => void;
  inline?: boolean;
}

export function SearchAddress({
  inline = false,
  onChange = () => ({}),
  onClick = () => ({}),
  defaultValue = null,
}: SearchAddressProps) {
  return (
    <React.Fragment>
      {checkoutFeatureService.googlePlaceEnabledInSearchAddress ? (
        <SearchGooglePlaces inline={inline} defaultValue={defaultValue} onClick={onClick} onChange={onChange} />
      ) : (
        <SearchSgPlaces inline={inline} defaultValue={defaultValue} onClick={onClick} onChange={onChange} />
      )}
    </React.Fragment>
  );
}

export default SearchAddress;
