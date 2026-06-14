/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import { Autocomplete, AutocompleteOption, Typography, Stack, Link } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { useDebounce } from 'react-use';
import {
  useLazyGetGoogleAddressesOptionsQuery,
  type GoogleAddressOption,
  type AddressOptions,
} from '@castlery/modules-user-domain';
import { formatGoogleAddress } from './helper';
import { useAppDispatch } from '@castlery/shared-redux-store';

export interface GooglePlaceValues extends AddressOptions {
  description?: string;
  google_place_id?: string;
}
export interface SearchGooglePlacesProps {
  onChange: (value: GooglePlaceValues | null) => void;
  onClick?: () => void;
  inline?: boolean;
  defaultValue: GooglePlaceValues | null;
}

export function SearchGooglePlaces({
  inline = false,
  defaultValue,
  onChange,
  onClick = () => {},
}: SearchGooglePlacesProps) {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useState('');
  const [currentData, setCurrentData] = useState<GoogleAddressOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [optionValue, setOptionValue] = useState<GoogleAddressOption | null | {}>(() => {
    return defaultValue ? {} : null;
  });

  const [getGoogleAddressesOptions] = useLazyGetGoogleAddressesOptionsQuery();

  useDebounce(
    async () => {
      if (!searchParams) {
        setCurrentData([]);
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      const res = await getGoogleAddressesOptions(searchParams);
      if (res.error) {
        setCurrentData([]);
        setIsFetching(false);
        return;
      }
      const result = res.data || [];
      setCurrentData(result);
      setIsFetching(false);
    },
    800,
    [searchParams]
  );

  useDebounce(
    async () => {
      if (!optionValue) {
        onChange(null);
        return;
      }
      if (optionValue && Object.keys(optionValue).length <= 0) {
        onChange(defaultValue);
        return;
      }
      if (Object.keys(optionValue).length && 'google_place_id' in optionValue) {
        const res = await dispatch(formatGoogleAddress(optionValue.google_place_id));
        if ('error' in res) return;
        const result = res.payload ? { ...res.payload, ...optionValue } : null;
        onChange(result);
      }
    },
    100,
    [optionValue, defaultValue, dispatch]
  );

  return (
    <Stack spacing={2}>
      <Autocomplete
        sx={{ width: '100%' }}
        options={currentData || []}
        // google place 类型，不设置defaultValue
        // defaultValue={defaultValue}
        onChange={(event, value, reason) => {
          if (value) {
            setOptionValue(value);
          }
          if (reason === 'clear') {
            setOptionValue(null);
          }
        }}
        clearOnBlur={false}
        variant={inline ? 'borderplain' : 'outlined'}
        startDecorator={inline ? null : <Search />}
        placeholder={inline ? 'Enter Your Address' : 'Search Your Location'}
        loading={isFetching}
        getOptionLabel={(option) => option?.description}
        onInputChange={(event, value) => {
          if (event?.type === 'change') {
            setSearchParams(value);
          }
        }}
        renderOption={(props, option) => {
          return (
            <AutocompleteOption
              {...props}
              key={option.google_place_id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {option.description}
            </AutocompleteOption>
          );
        }}
        filterOptions={(options: any) => options} // autocomplete 默认会筛选选项，这里不筛选，因为空格导致一些输入项匹配不到
      />
      {!inline && (
        <Typography textAlign={'center'} component={Link} onClick={onClick}>
          Can't find your address?
        </Typography>
      )}
    </Stack>
  );
}

export default SearchGooglePlaces;
