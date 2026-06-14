import { useConnector } from 'react-instantsearch';
import connectAutocomplete from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';

import type {
  AutocompleteConnectorParams,
  AutocompleteWidgetDescription,
} from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
import { Autocomplete } from '@castlery/fortress';
import { Box } from '@castlery/fortress';
export type UseAutocompleteProps = AutocompleteConnectorParams;

// Connect the InstantSearch.js `connectAutocomplete` connector to your component
export function useAutocomplete(props?: UseAutocompleteProps) {
  return useConnector<AutocompleteConnectorParams, AutocompleteWidgetDescription>(connectAutocomplete, props);
}

// The props you can use in your component to interact with Autocomplete
export function CustomerAutocomplete(props: UseAutocompleteProps) {
  const { indices, currentRefinement, refine } = useAutocomplete(props);

  return (
    <Autocomplete
      // {...props}
      freeSolo
      options={indices[0]?.hits || []}
      renderOption={(props, option) => {
        return (
          <Box component="li" key={option.objectID}>
            {option.name}
          </Box>
        );
      }}
      inputValue={currentRefinement}
      onInputChange={(_, value) => refine(value)}
    />
  );
}
