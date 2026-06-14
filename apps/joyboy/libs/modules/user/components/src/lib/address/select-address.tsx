import * as React from 'react';
import { useSearchPlacesForSGQuery } from '@castlery/modules-user-domain';
import { useDebounce } from 'react-use';
import { Typography, Box, Autocomplete, AutocompleteOption } from '@castlery/fortress';

export const SelectAddress = ({
  afterChangedCustomer = () => {
    return;
  },
} = {}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [params, setParams] = React.useState('');
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
    <>
      {/* <Stack direction={'row'} justifyContent={'space-between'}>
        <Button variant="tertiary" startDecorator={<ArrowLeft />} onClick={afterChangedCustomer}>
          Back
        </Button>
      </Stack> */}

      <Box gap={3}>
        <Typography level="h3">Select Address</Typography>
        <Autocomplete
          sx={{
            width: '100%',
          }}
          // options={options.filter(({ type }) => type === 'product')}
          options={options}
          onChange={(event, value, reason, details) => {
            // if (value?.slug) {
            //   router.push(`/sg/discover/${value.slug}`);
            // }
            if (value) {
              console.log('🚀 ~ file: pos-select-customer.tsx:58 ~ value:', value);
              // dispatch(setCustomer(value));
              afterChangedCustomer();
            }
          }}
          variant="outlined"
          // startDecorator={<ArrowBackIosNew />}
          placeholder="Search address"
          loading={isFetching}
          getOptionLabel={(option) => option.building_name}
          onInputChange={(event, value) => {
            if (event.type === 'change') {
              setInputValue(value);
            }
          }}
          renderOption={(props, options, { selected }) => {
            return (
              <AutocompleteOption
                {...props}
                key={options.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>{`${options.building_name} ${options.street_number}`}</Typography>
              </AutocompleteOption>
            );
          }}
        />
      </Box>
    </>
  );
};
