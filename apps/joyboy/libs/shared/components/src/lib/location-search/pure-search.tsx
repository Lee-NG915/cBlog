'use client';
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  iconButtonClasses,
  Stack,
  Typography,
} from '@castlery/fortress';
import { ArrowRight, Close } from '@castlery/fortress/Icons';
import { useCallback, useReducer, useMemo, useRef, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { logger } from '@castlery/observability';
import { zipcodeFormattingUtils } from '@castlery/utils';
import { EcEnv } from '@castlery/config';

// Constants
const SEARCH_DEBOUNCE_MS = 600;
const MIN_ZIPCODE_LENGTH = 3;
const MIN_ADDRESS_LENGTH = 1;
const ADDRESS_NOT_FOUND_FALLBACK = 'address_not_found_fallback';

export enum LocationSearchType {
  ZIPCODE = 'zipcode',
  ADDRESS = 'address',
}

export interface SearchListOption {
  label: string;
  value: string;
  rawData?: unknown;
}

export interface ZipcodeResult {
  zipcode: string;
  city?: string;
  state?: string;
}

export type AddressResult = {
  zipcode?: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
} | null;

// State management
interface SearchState {
  open: boolean;
  loading: boolean;
  submitLoading: boolean;
  filterOptions: SearchListOption[];
  searchKeyWords: string;
  selectedOption: SearchListOption | null;
  submitPayload: Record<string, unknown> | null;
  inputValue: string;
}

type SearchAction =
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMIT_LOADING'; payload: boolean }
  | { type: 'SET_FILTER_OPTIONS'; payload: SearchListOption[] }
  | { type: 'SET_SEARCH_KEYWORDS'; payload: string }
  | { type: 'SET_SELECTED_OPTION'; payload: SearchListOption | null }
  | { type: 'SET_SUBMIT_PAYLOAD'; payload: Record<string, unknown> | null }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SEARCH_START'; payload: string }
  | { type: 'SEARCH_SUCCESS'; payload: SearchListOption[] };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, open: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SUBMIT_LOADING':
      return { ...state, submitLoading: action.payload };
    case 'SET_FILTER_OPTIONS':
      return { ...state, filterOptions: action.payload };
    case 'SET_SEARCH_KEYWORDS':
      return { ...state, searchKeyWords: action.payload };
    case 'SET_SELECTED_OPTION':
      return { ...state, selectedOption: action.payload };
    case 'SET_SUBMIT_PAYLOAD':
      return { ...state, submitPayload: action.payload };
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    case 'CLEAR_ALL':
      return {
        ...state,
        selectedOption: null,
        inputValue: '',
        searchKeyWords: '',
        filterOptions: [],
        submitPayload: null,
        open: false,
      };
    case 'SEARCH_START':
      return {
        ...state,
        loading: true,
        filterOptions: [],
        selectedOption: null,
        submitPayload: null,
        searchKeyWords: action.payload,
      };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        loading: false,
        filterOptions: action.payload,
        open: action.payload.length > 0,
      };
    default:
      return state;
  }
}
export interface PureLocationSearchProps {
  type: LocationSearchType;
  placeholder?: string;
  autoFocus?: boolean;
  searchHandler: (query: string) => Promise<SearchListOption[]>;
  onSelect: (option: SearchListOption) => Promise<Record<string, unknown> | null>;
  onSubmit: (payload: ZipcodeResult | AddressResult) => Promise<void>;
  errorHelperText?: string;
  onClear: () => void;
  parsedLoading?: boolean;
}

export function PureLocationSearch({
  type,
  placeholder,
  autoFocus = true,
  searchHandler,
  onSelect,
  onSubmit,
  errorHelperText,
  onClear,
  parsedLoading = false,
}: PureLocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // autoFocus via HTML attribute fails inside modal animations because the browser
  // drops the focus attempt while the dialog transition is still in progress.
  // Delay focus until after the opening animation (~300ms) to reliably grab it.
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const [state, dispatch] = useReducer(searchReducer, {
    open: false,
    loading: false,
    submitLoading: false,
    filterOptions: [],
    searchKeyWords: '',
    selectedOption: null,
    submitPayload: null,
    inputValue: '',
  });

  const { open, loading, submitLoading, filterOptions, searchKeyWords, selectedOption, submitPayload, inputValue } =
    state;

  // Helper function to check if search is ready
  const isReadyToSearch = useCallback(
    (value: string): boolean => {
      const minLength = type === LocationSearchType.ZIPCODE ? MIN_ZIPCODE_LENGTH : MIN_ADDRESS_LENGTH;
      return value?.length >= minLength;
    },
    [type]
  );

  const isSubmitDisabled = useMemo(() => {
    return !isReadyToSearch(inputValue);
  }, [inputValue, isReadyToSearch]);

  const isInputNotEmpty = useMemo(() => {
    return inputValue.length > 0;
  }, [inputValue]);

  // Check if an option is the fallback option
  const isFallbackOption = useCallback((option: SearchListOption): boolean => {
    return option.value === ADDRESS_NOT_FOUND_FALLBACK;
  }, []);

  // Submit handler with loading state management
  const submitHandler = useCallback(
    async (payload: ZipcodeResult | AddressResult | null) => {
      if (submitLoading || loading) return;
      dispatch({ type: 'SET_SUBMIT_LOADING', payload: true });
      try {
        await onSubmit(payload);
        dispatch({ type: 'SET_SELECTED_OPTION', payload: null });
      } finally {
        dispatch({ type: 'SET_SUBMIT_LOADING', payload: false });
      }
    },
    [submitLoading, loading, onSubmit]
  );

  // Handle Enter key press
  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLFormElement>) => {
      if (submitLoading || loading || event.key !== 'Enter') return;

      event.preventDefault();

      if (selectedOption && selectedOption.value) {
        const result = await onSelect(selectedOption);
        dispatch({ type: 'SET_SUBMIT_PAYLOAD', payload: result });
        await submitHandler(result);
      } else if (filterOptions.length >= 1) {
        // Auto-select the first option
        const firstOption = filterOptions[0];
        dispatch({ type: 'SET_OPEN', payload: false });

        // Handle fallback option - submit directly without updating input
        if (isFallbackOption(firstOption)) {
          await submitHandler(null);
          return;
        }

        // Update UI state for normal options
        dispatch({ type: 'SET_SELECTED_OPTION', payload: firstOption });
        dispatch({ type: 'SET_INPUT_VALUE', payload: firstOption.label });

        const result = await onSelect(firstOption);
        dispatch({ type: 'SET_SUBMIT_PAYLOAD', payload: result });
        await submitHandler(result);
      } else if (filterOptions.length === 0) {
        dispatch({ type: 'SET_OPEN', payload: false });
        await submitHandler(null);
      }
    },
    [submitLoading, loading, selectedOption, filterOptions, onSelect, submitHandler, isFallbackOption]
  );

  // Debounced search effect
  useDebounce(
    async () => {
      if (!searchKeyWords) return;

      dispatch({ type: 'SEARCH_START', payload: searchKeyWords });
      try {
        const result = await searchHandler(searchKeyWords);
        dispatch({ type: 'SEARCH_SUCCESS', payload: result });
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        logger.error('Search failed:', { error });
      }
    },
    SEARCH_DEBOUNCE_MS,
    [searchKeyWords]
  );

  const formatZipcode = useCallback((value: string) => {
    const Region = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase() as keyof typeof zipcodeFormattingUtils;
    return zipcodeFormattingUtils[Region](value);
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, value: string, reason: string) => {
      const newValue = type === LocationSearchType.ZIPCODE && reason === 'input' ? formatZipcode(value) : value;

      // Skip clearing when MUI resets input due to value prop change (reason='reset')
      // This preserves the search text after an option is selected and submitted
      if (newValue.length === 0 && reason !== 'reset') {
        dispatch({ type: 'CLEAR_ALL' });
        onClear();
        return;
      }

      // Only process input changes for non-empty values
      if (reason === 'input') {
        dispatch({ type: 'SET_INPUT_VALUE', payload: newValue });
        if (isReadyToSearch(newValue)) {
          dispatch({ type: 'SET_SEARCH_KEYWORDS', payload: newValue });
        }
      }
    },
    [type, isReadyToSearch, onClear, formatZipcode]
  );

  // Handle autocomplete selection
  const handleAutocompleteChange = useCallback(
    async (event: React.SyntheticEvent, value: SearchListOption | Array<SearchListOption> | null, reason: string) => {
      if (!value || Array.isArray(value) || reason !== 'selectOption') return;

      // Handle fallback option - submit directly without updating input
      if (isFallbackOption(value)) {
        dispatch({ type: 'SET_OPEN', payload: false });
        await submitHandler(null);
        return;
      }

      // Update UI state for normal options
      dispatch({ type: 'SET_SELECTED_OPTION', payload: value });
      dispatch({ type: 'SET_INPUT_VALUE', payload: value.label });
      dispatch({ type: 'SET_OPEN', payload: false });

      const result = await onSelect(value);
      dispatch({ type: 'SET_SUBMIT_PAYLOAD', payload: result || null });
      // After onSelect resolves (parsedLoading ends), auto-submit
      await submitHandler(result || null);
    },
    [onSelect, submitHandler, isFallbackOption]
  );

  // Handle blur event
  const handleBlur = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: false });
  }, []);

  // Handle focus event - reopen dropdown if there are existing results
  const handleFocus = useCallback(() => {
    if (filterOptions.length > 0 && !loading) {
      dispatch({ type: 'SET_OPEN', payload: true });
    }
  }, [filterOptions, loading]);

  // Handle clear action
  const handleClear = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    onClear();
  }, [onClear]);
  // Handle close
  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: false });
  }, []);

  // Handle submit button click
  const handleSubmitClick = useCallback(() => {
    submitHandler(submitPayload);
  }, [submitPayload, submitHandler]);

  // Check if option values are equal
  const isOptionEqualToValue = useCallback(
    (option: SearchListOption, value: SearchListOption) => option.value === value.value,
    []
  );

  // Pass through filter options without modification
  const filterOptionsHandler = useCallback((options: SearchListOption[]) => options, []);

  return (
    <Box position="relative" mb={0.5} sx={{ maxWidth: '100%' }}>
      <FormControl error={!!errorHelperText}>
        <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown} action="/">
          <Box position="relative">
            <Autocomplete
              variant="outlined"
              disableClearable
              openOnFocus
              open={open && !loading}
              onClose={handleClose}
              value={selectedOption || undefined}
              onChange={handleAutocompleteChange}
              clearOnBlur={false}
              forcePopupIcon={false}
              inputValue={inputValue}
              placeholder={placeholder}
              slotProps={{ input: { ref: inputRef } }}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              options={filterOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={isOptionEqualToValue}
              filterOptions={filterOptionsHandler}
              endDecorator={
                <Stack
                  direction="row"
                  gap={4}
                  alignItems="center"
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isInputNotEmpty && (
                    <IconButton
                      size="sm"
                      onClick={handleClear}
                      sx={{
                        width: 32,
                        height: 32,
                        animation: 'fadeIn 0.2s ease-in-out',
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'scale(0.8)' },
                          to: { opacity: 1, transform: 'scale(1)' },
                        },
                      }}
                    >
                      <Close />
                    </IconButton>
                  )}
                  {type !== LocationSearchType.ADDRESS && (
                    <IconButton
                      variant="primary"
                      size="sm"
                      loading={submitLoading}
                      disabled={isSubmitDisabled}
                      onClick={handleSubmitClick}
                      sx={{
                        width: 32,
                        height: 32,
                        [`& .${iconButtonClasses.loadingIndicator}`]: {
                          width: 20,
                        },
                      }}
                    >
                      <ArrowRight />
                    </IconButton>
                  )}
                </Stack>
              }
              sx={{
                pr: 16,
                minWidth: 300,
                height: 52,
                alignItems: 'center',
                background: 'transparent',
                [`& .${autocompleteClasses.endDecorator}`]: {
                  width: type === LocationSearchType.ADDRESS ? (isInputNotEmpty ? 32 : 0) : isInputNotEmpty ? 80 : 32,
                  height: 32,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  transition: 'width 0.2s ease-in-out',
                },
              }}
            />
            {parsedLoading && inputValue.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  right: type === LocationSearchType.ADDRESS ? 56 : 120,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <CircularProgress size="sm" color="neutral" thickness={2} sx={{ '--CircularProgress-size': '20px' }} />
              </Box>
            )}
          </Box>
        </form>
        {loading && (
          <Typography level="caption2" mt={1} pl={1}>
            Loading...
          </Typography>
        )}
        {!!errorHelperText && !loading && <FormHelperText>{errorHelperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
}

export default PureLocationSearch;
