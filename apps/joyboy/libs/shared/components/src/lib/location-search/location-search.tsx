'use client';
import {
  searchPlacesForSG,
  searchZipcodeForAU,
  searchPlacesByGoogleApi,
  parseGoogleAddressByPlaceId,
} from '@castlery/modules-user-domain';
import { PureLocationSearch, SearchListOption, LocationSearchType, ZipcodeResult, AddressResult } from './pure-search';
import { useCallback, useMemo, useState } from 'react';
import { accessInSG, accessInAU, EcEnv } from '@castlery/config';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { v4 as uuidv4 } from 'uuid';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import { logger } from '@castlery/observability';

export { LocationSearchType, ZipcodeResult, AddressResult } from './pure-search';

export interface LocationSearchProps {
  type: LocationSearchType;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (result: ZipcodeResult | AddressResult) => Promise<void | Error>;
}

const DEFAULT_ERROR = 'Invalid zip code or not supported zip code';

export function LocationSearch({ type, placeholder = '', autoFocus, onSubmit }: LocationSearchProps) {
  const dispatch = useAppDispatch();
  const [backupValue, setBackupValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [parsedLoading, setParsedLoading] = useState<boolean>(false);

  // 会话令牌 - 缓存以保持整个搜索会话一致
  const sessionToken = useMemo(() => uuidv4(), []);

  // 缓存地址回退选项，避免每次渲染创建新对象
  const addressFallbackOption = useMemo<SearchListOption>(
    () => ({
      value: 'address_not_found_fallback',
      label: "Can't find your address?",
      rawData: null,
    }),
    []
  );

  const handleClear = useCallback(() => {
    setBackupValue('');
    setError('');
  }, []);

  const auZipcodeSearchHandler = useCallback(
    async (query: string): Promise<SearchListOption[]> => {
      const result = await dispatch(searchZipcodeForAU.initiate({ query }));
      if (result.error || !result.data) {
        return [];
      }
      return result.data.map((item) => ({
        label: `${item.city}, ${item.state} ${item.zipcode}`,
        value: item.id,
        rawData: item,
      }));
    },
    [dispatch]
  );

  const sgPlacesSearchHandler = useCallback(
    async (query: string): Promise<SearchListOption[]> => {
      const result = await dispatch(searchPlacesForSG.initiate({ query }));
      const defaultResult = type === LocationSearchType.ADDRESS ? [addressFallbackOption] : [];

      if (result.error || !result.data) {
        return defaultResult;
      }

      const list = result.data.map((item) => ({
        label: `${item.building_name ? item.building_name + ', ' : ''}${item.street_number} ${item.street}, ${
          item.zipcode
        }`,
        value: item.id,
        rawData: item,
      }));

      return [...list, ...defaultResult];
    },
    [dispatch, type, addressFallbackOption]
  );

  const googlePlacesSearchHandler = useCallback(
    async (query: string): Promise<SearchListOption[]> => {
      const payload = {
        query,
        sessiontoken: sessionToken,
        ...(type === LocationSearchType.ZIPCODE && { type }),
      };
      const result = await dispatch(searchPlacesByGoogleApi.initiate(payload));
      const defaultResult = type === LocationSearchType.ADDRESS ? [addressFallbackOption] : [];

      if (result?.error) {
        return defaultResult;
      }

      if (result?.data) {
        const list = result.data.map((item) => ({
          label: item.description,
          value: item.google_place_id,
          rawData: item,
        }));
        return [...list, ...defaultResult];
      }

      // 如果google api没有返回结果，则需要校验backupValue是否为有效的postcode
      if (type === LocationSearchType.ZIPCODE) {
        const countryCode = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase();
        const isValid = postcodeValidatorExistsForCountry(countryCode) ? postcodeValidator(query, countryCode) : true;
        if (isValid) {
          setBackupValue(query);
        }
      }

      return defaultResult;
    },
    [dispatch, type, sessionToken, addressFallbackOption]
  );

  const searchHandler = useCallback(
    async (query: string): Promise<SearchListOption[]> => {
      if (!query) return [];

      handleClear();

      let result: SearchListOption[];

      if (type === LocationSearchType.ZIPCODE && query.length >= 3) {
        // au 在查zipcode时，使用定制的API，sg无查询zipcode的场景，其他市场使用google api
        const search = accessInAU ? auZipcodeSearchHandler : googlePlacesSearchHandler;
        result = await search(query);
      } else {
        // sg查询地址使用定制API， 其他市场使用google api
        const search = accessInSG ? sgPlacesSearchHandler : googlePlacesSearchHandler;
        result = await search(query);
      }

      if (result.length === 0) {
        setError(DEFAULT_ERROR);
      }

      return result;
    },
    [type, auZipcodeSearchHandler, sgPlacesSearchHandler, googlePlacesSearchHandler, handleClear]
  );

  const onSelect = useCallback(
    async (option: SearchListOption): Promise<ZipcodeResult | AddressResult | undefined> => {
      if (!option.value) return undefined;

      let selectedOption = option.rawData;

      // 如果是Google地址，需要解析详细信息
      if (option.rawData?.google_place_id) {
        try {
          setParsedLoading(true);
          const res = await dispatch(
            parseGoogleAddressByPlaceId.initiate({ googlePlaceId: option.value, sessiontoken: sessionToken })
          );

          if (res.error) {
            logger.error('Parse address error:', { error: res.error });
            return undefined;
          }

          if (res.data) {
            selectedOption = {
              ...selectedOption,
              ...res.data,
            };
          }
        } catch (error) {
          logger.error('Parse address error:', { error });
          return undefined;
        } finally {
          setParsedLoading(false);
        }
      }

      // 根据类型返回不同的结果格式
      if (type === LocationSearchType.ZIPCODE) {
        return {
          zipcode: selectedOption?.zipcode ?? '',
          city: selectedOption?.city ?? '',
          state: selectedOption?.state ?? selectedOption?.state_name ?? '',
        };
      } else if (type === LocationSearchType.ADDRESS) {
        return {
          ...selectedOption,
        };
      }

      return undefined;
    },
    [dispatch, type, sessionToken]
  );

  const handleSubmit = useCallback(
    async (payload: ZipcodeResult | AddressResult | null): Promise<void> => {
      try {
        if (type === LocationSearchType.ZIPCODE) {
          const zipcodeResult: ZipcodeResult = (payload as ZipcodeResult) || {
            zipcode: backupValue,
            city: '',
            state: '',
          };

          if (!zipcodeResult.zipcode) {
            return;
          }

          await onSubmit(zipcodeResult);
        } else if (type === LocationSearchType.ADDRESS) {
          await onSubmit(payload);
        }
      } catch (error) {
        logger.error('LocationSearch handleSubmit error:', { error });
        // 当 error status是FETCH_ERROR时，不显示默认错误，直接返回
        // 错误可能被序列化为JSON字符串在error.message中，也可能在error.status或error.data?.status中
        let errorStatus: string | undefined;

        // 检查error.message是否是JSON字符串（cart-checkout-zipcode-selector会这样序列化错误）
        if (error instanceof Error && typeof error.message === 'string') {
          try {
            const parsedError = JSON.parse(error.message);
            errorStatus = parsedError?.status;
          } catch {
            // 如果不是JSON，继续检查其他位置
          }
        }

        // 如果message中没有找到，检查error.status或error.data?.status
        if (!errorStatus) {
          errorStatus = (error as any)?.status || (error as any)?.data?.status;
        }

        if (errorStatus === 'FETCH_ERROR') {
          return;
        }
        setError(DEFAULT_ERROR);
      }
    },
    [type, backupValue, onSubmit]
  );

  return (
    <PureLocationSearch
      type={type}
      placeholder={placeholder}
      autoFocus={autoFocus}
      searchHandler={searchHandler}
      onSelect={onSelect}
      onSubmit={handleSubmit}
      errorHelperText={error}
      onClear={handleClear}
      parsedLoading={parsedLoading}
    />
  );
}
