'use client';
import { useState, useMemo, useCallback } from 'react';
import { Box, Autocomplete, FormControl, FormHelperText, IconButton, autocompleteClasses } from '@castlery/fortress';
import { ArrowRight, Close } from '@castlery/fortress/Icons';
import { useDebounce } from 'react-use';
import {
  GoogleAddressOption,
  useLazySearchPlacesByGoogleApiQuery,
  useLazyParseGoogleAddressByPlaceIdQuery,
} from '@castlery/modules-user-domain';
import { v4 as uuidv4 } from 'uuid';
import {
  LocationSearchZipcodeResult,
  CamelCaseParsedGoogleAddressEntity_V2,
  ParsedGoogleAddressEntity_V2,
  GoogleAddressEntity_V2,
} from './type';
// import { ParsedGoogleAddressEntity_V2, GoogleAddressEntity_V2, CamelCaseParsedGoogleAddressEntity_V2 } from '@castlery/types';

export enum LocationSearchType {
  ZIPCODE = 'zipcode',
  ADDRESS = 'address',
}

// 常量定义
const DEBOUNCE_DELAY = 1000;
const MIN_ZIPCODE_LENGTH = 3;
const ERROR_MESSAGES = {
  INVALID_ZIPCODE: 'Invalid zip code or not supported zip code',
  INVALID_ADDRESS: 'Invalid address',
  LOADING: 'Loading...',
} as const;

// 状态接口
interface SearchState {
  inputValue: string;
  searchKeywords: string;
  selectOption: GoogleAddressEntity_V2 | null;
  filteredSuggestions: GoogleAddressEntity_V2[];
  parsedSearchResult: ParsedGoogleAddressEntity_V2 | null;
  open: boolean;
}

interface LoadingState {
  search: boolean;
  parse: boolean;
  submit: boolean;
}

interface ErrorState {
  search: boolean;
  parse: boolean;
  submit: string;
}

export function LocationSearch({
  type,
  afterSubmit,
  onSubmit,
}: {
  type: LocationSearchType;
  afterSubmit?: (address?: CamelCaseParsedGoogleAddressEntity_V2) => void;
  onSubmit: (
    result: LocationSearchZipcodeResult | CamelCaseParsedGoogleAddressEntity_V2
  ) => Promise<{ error: string } | void>;
}) {
  // 合并相关状态
  const [searchState, setSearchState] = useState<SearchState>({
    inputValue: '',
    searchKeywords: '',
    selectOption: null,
    filteredSuggestions: [],
    parsedSearchResult: null,
    open: false,
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    search: false,
    parse: false,
    submit: false,
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    search: false,
    parse: false,
    submit: '',
  });

  // API hooks
  const [searchTrigger] = useLazySearchPlacesByGoogleApiQuery();
  const [parseGoogleAddressTrigger] = useLazyParseGoogleAddressByPlaceIdQuery();

  // 会话令牌
  const sessionToken = useMemo(() => uuidv4(), []);

  // 计算属性
  const enabledToSearch = useMemo(() => {
    const { searchKeywords } = searchState;
    return type === LocationSearchType.ZIPCODE
      ? searchKeywords?.length >= MIN_ZIPCODE_LENGTH
      : searchKeywords?.length > 0;
  }, [searchState, type]);

  const submitDisabled = useMemo(() => {
    return loadingState.search || loadingState.parse || loadingState.submit || !enabledToSearch;
  }, [loadingState, enabledToSearch]);

  const errorMessage = useMemo(() => {
    if (errorState.search) return ERROR_MESSAGES.INVALID_ZIPCODE;
    if (errorState.parse) return ERROR_MESSAGES.INVALID_ADDRESS;
    if (errorState.submit) return errorState.submit;
    return '';
  }, [errorState]);

  // 状态更新工具函数
  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateLoadingState = useCallback((updates: Partial<LoadingState>) => {
    setLoadingState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateErrorState = useCallback((updates: Partial<ErrorState>) => {
    setErrorState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetErrors = useCallback(() => {
    setErrorState({ search: false, parse: false, submit: '' });
  }, []);

  const resetForm = useCallback(() => {
    setSearchState({
      inputValue: '',
      searchKeywords: '',
      selectOption: null,
      filteredSuggestions: [],
      parsedSearchResult: null,
      open: false,
    });
    resetErrors();
  }, [resetErrors]);

  // 搜索建议获取
  const fetchSuggestions = useCallback(
    async (value: string): Promise<GoogleAddressOption[]> => {
      updateErrorState({ search: false });

      try {
        const res = await searchTrigger({
          query: value,
          sessiontoken: sessionToken,
          type: type === LocationSearchType.ZIPCODE ? type : '',
        });

        if (res?.error) {
          updateErrorState({ search: true });
          return [];
        }

        const result = Array.isArray(res?.data) ? res.data : [];
        if (result.length > 0) {
          updateSearchState({ open: true, filteredSuggestions: result });
        }
        return result;
      } catch (error) {
        console.error('Search suggestions error:', error);
        updateErrorState({ search: true });
        return [];
      }
    },
    [searchTrigger, sessionToken, updateErrorState, updateSearchState, type]
  );

  // 防抖搜索
  useDebounce(
    async () => {
      if (!enabledToSearch) return;
      updateLoadingState({ search: true });
      await fetchSuggestions(searchState.searchKeywords);
      updateLoadingState({ search: false });
    },
    DEBOUNCE_DELAY,
    [searchState.searchKeywords, enabledToSearch, fetchSuggestions]
  );

  // 解析搜索结果
  const parseSearchResult = useCallback(
    async (googlePlaceId: string): Promise<ParsedGoogleAddressEntity_V2 | null> => {
      if (!googlePlaceId) return null;

      updateErrorState({ parse: false });
      updateLoadingState({ parse: true });

      try {
        const res = await parseGoogleAddressTrigger({
          googlePlaceId: googlePlaceId,
          sessiontoken: sessionToken,
        });

        if (res?.error) {
          updateErrorState({ parse: true });
          return null;
        }

        return res?.data || null;
      } catch (error) {
        console.error('Parse address error:', error);
        updateErrorState({ parse: true });
        return null;
      } finally {
        updateLoadingState({ parse: false });
      }
    },
    [parseGoogleAddressTrigger, sessionToken, updateErrorState, updateLoadingState]
  );

  // 处理选择
  const handleSelect = useCallback(
    async (value: GoogleAddressEntity_V2) => {
      updateSearchState({
        selectOption: value,
        open: false,
      });

      try {
        const parsedResult = await parseSearchResult(value.google_place_id);
        if (parsedResult) {
          updateSearchState({ parsedSearchResult: parsedResult });
        }
      } catch (error) {
        console.error('Handle select error:', error);
      }
    },
    [parseSearchResult, updateSearchState]
  );

  // 更新购物车中的邮编
  const handleUpdateZipcode = useCallback(async () => {
    if (errorMessage) return;

    updateLoadingState({ submit: true });
    updateErrorState({ submit: '' });

    try {
      const { selectOption, parsedSearchResult, searchKeywords } = searchState;
      const data =
        selectOption && parsedSearchResult ? parsedSearchResult : { zipcode: searchKeywords, state: '', city: '' };

      if (!data) return;

      const res = await onSubmit({
        zipcode: data.zipcode,
        countryState: ('state' in data ? data.state : data.state_name) ?? '',
        city: data.city ?? '',
      });

      if (res?.error) {
        const errorMsg = JSON.stringify(res.error);
        updateErrorState({ submit: errorMsg });
      }
    } catch (error) {
      console.error('Update zipcode error:', error);
      updateErrorState({ submit: JSON.stringify(error) });
    } finally {
      updateLoadingState({ submit: false });
      afterSubmit?.();
    }
  }, [errorMessage, searchState, onSubmit, updateLoadingState, updateErrorState, afterSubmit]);

  // 格式化地址数据
  const formatAddressData = useCallback(
    (parsedResult: ParsedGoogleAddressEntity_V2): CamelCaseParsedGoogleAddressEntity_V2 => {
      return {
        address1: parsedResult.address1,
        city: parsedResult.city,
        zipcode: parsedResult.zipcode,
        stateName: parsedResult.state_name,
        street: parsedResult.street,
        streetNumber: parsedResult.street_number,
      };
    },
    []
  );

  // 处理提交
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      updateErrorState({ submit: '' });

      if (type === LocationSearchType.ZIPCODE) {
        handleUpdateZipcode();
      } else {
        const { parsedSearchResult } = searchState;
        if (!parsedSearchResult) return;

        const formattedAddress = formatAddressData(parsedSearchResult);
        onSubmit(formattedAddress);
      }
    },
    [type, searchState, handleUpdateZipcode, formatAddressData, onSubmit, updateErrorState]
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (submitDisabled) return;

        const { selectOption, filteredSuggestions } = searchState;
        if (!selectOption && filteredSuggestions[0]) {
          await handleSelect(filteredSuggestions[0]);
        }
        handleSubmit(e);
      }
    },
    [submitDisabled, searchState, handleSelect, handleSubmit]
  );

  // 处理输入变化
  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, value: string, reason: string) => {
      updateSearchState({ inputValue: value });
      if (reason === 'input') {
        updateSearchState({ searchKeywords: value });
      }
    },
    [updateSearchState]
  );

  // 处理自动完成变化
  const handleAutocompleteChange = useCallback(
    (event: React.SyntheticEvent, newValue: GoogleAddressEntity_V2 | null, reason: string) => {
      if (reason === 'selectOption' && newValue) {
        handleSelect(newValue);
      }
      if (reason === 'clear') {
        resetForm();
      }
    },
    [handleSelect, resetForm]
  );

  // 处理自动完成打开
  const handleAutocompleteOpen = useCallback(() => {
    const { filteredSuggestions, inputValue } = searchState;
    if (filteredSuggestions.length > 0 && inputValue.length > 0) {
      updateSearchState({ open: true });
    }
  }, [searchState, updateSearchState]);

  // 处理自动完成关闭
  const handleAutocompleteClose = useCallback(() => {
    updateSearchState({ open: false });
  }, [updateSearchState]);

  // 处理失焦
  const handleBlur = useCallback(() => {
    const { inputValue } = searchState;
    if (!inputValue) {
      updateSearchState({ filteredSuggestions: [] });
    }
  }, [searchState, updateSearchState]);

  return (
    <Box position="relative" mb={0.5} sx={{ maxWidth: 692 }}>
      <FormControl error={!!errorMessage}>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Autocomplete
            variant="borderplain"
            openOnFocus={false}
            open={searchState.open}
            onOpen={handleAutocompleteOpen}
            onClose={handleAutocompleteClose}
            loading={loadingState.search}
            noOptionsText=""
            value={searchState.selectOption}
            onChange={handleAutocompleteChange}
            clearIcon={
              <IconButton>
                <Close />
              </IconButton>
            }
            clearOnBlur={false}
            forcePopupIcon={false}
            inputValue={searchState.inputValue}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
            options={searchState.filteredSuggestions}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) => option.google_place_id === value.google_place_id}
            filterOptions={(options) => options}
            endDecorator={
              <IconButton
                variant="primary"
                size="sm"
                loading={loadingState.submit || loadingState.parse}
                disabled={submitDisabled}
                type="submit"
              >
                <ArrowRight />
              </IconButton>
            }
            sx={{
              pr: 16,
              height: 52,
              alignItems: 'center',
              background: 'transparent',
              [`& .${autocompleteClasses.endDecorator}`]: {
                width: 40,
                height: 40,
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                margin: 'auto',
              },
            }}
          />
        </form>
        <FormHelperText>{loadingState.search ? ERROR_MESSAGES.LOADING : errorMessage || null}</FormHelperText>
      </FormControl>
    </Box>
  );
}

export default LocationSearch;
