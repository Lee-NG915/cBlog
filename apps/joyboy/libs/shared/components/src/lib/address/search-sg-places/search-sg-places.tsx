/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import { Autocomplete, AutocompleteOption, Typography, Link, Stack } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { useDebounce } from 'react-use';
import { AddressOptions, useSearchPlacesForSGQuery } from '@castlery/modules-user-domain';
import { genAddressOption } from './helper';

export interface SearchSgPlacesProps {
  defaultValue?: AddressOptions | null;
  onChange?: (value: AddressOptions | null) => void;
  onClick?: () => void;
  inline?: boolean;
}

export const SearchSgPlaces = ({
  defaultValue = null,
  onChange = () => ({}),
  onClick = () => {},
  inline = false,
}: SearchSgPlacesProps) => {
  const [inputValue, setInputValue] = useState('');
  const [params, setParams] = useState('');
  const [,] = useDebounce(
    () => {
      setParams(inputValue);
    },
    500,
    [inputValue]
  );

  const { currentData, isFetching } = useSearchPlacesForSGQuery(
    { query: params },
    {
      skip: !params,
    }
  );

  const options = currentData || [];

  return (
    <Stack spacing={2}>
      <Autocomplete
        sx={{
          width: '100%',
        }}
        clearOnBlur={false}
        options={options}
        defaultValue={defaultValue}
        onChange={(event, value, reason, details) => {
          if (value) {
            onChange(value);
          }
          if (reason === 'clear') {
            onChange(null);
          }
        }}
        variant={inline ? 'borderplain' : 'outlined'}
        startDecorator={inline ? null : <Search />}
        placeholder={inline ? 'Enter Your Address' : 'Search Your Location'}
        loading={isFetching}
        getOptionLabel={(option) => genAddressOption(option)}
        onInputChange={(event, value) => {
          if (event?.type === 'change') {
            setInputValue(value);
          }
        }}
        renderOption={(props, option, { selected }) => {
          return (
            <AutocompleteOption
              {...props}
              key={option.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {genAddressOption(option)}
            </AutocompleteOption>
          );
        }}
      />
      {!inline && (
        <Typography textAlign={'center'} component={Link} onClick={onClick}>
          Can't find your address?
        </Typography>
      )}
    </Stack>
  );
};

export default SearchSgPlaces;
