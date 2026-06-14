import { IndexUiState, UiState, StateMapping } from 'instantsearch.js';
import { FACET_ATTRIBUTE } from '../config';
import { isValidSortValue } from '../api/search/search-settings.config';

function getIndexStateWithoutConfigure<TIndexUiState extends IndexUiState>(
  uiState: TIndexUiState
): Omit<TIndexUiState, 'configure'> {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

// Updated singleIndexStateMapping to handle custom URL formats AND string ranges from UI state
export function singleIndexStateMapping<
  TIndexName extends string,
  TActualIndexUiState extends IndexUiState = IndexUiState,
  TUiState extends UiState & { [key in TIndexName]: TActualIndexUiState } = UiState & {
    [key in TIndexName]: TActualIndexUiState;
  }
>(indexName: TIndexName): StateMapping<TUiState, Record<string, any>> {
  return {
    $$type: 'ais.singleIndex',
    stateToRoute(uiState: TUiState): Record<string, any> {
      const indexState = getIndexStateWithoutConfigure(uiState[indexName] || ({} as TActualIndexUiState));
      const routeState: Record<string, any> = {};

      if (indexState.query) {
        routeState.q = indexState.query;
      }
      if (indexState.page && indexState.page > 1) {
        routeState.p = indexState.page;
      }
      if (indexState.sortBy) {
        // Transform sortBy from "{indexName}_price_desc" to "price_desc"
        const sortValue = indexState.sortBy.replace(new RegExp(`^${indexName}_`), '');
        // 只有当排序不是默认值时才添加到URL中，避免URL污染
        // 默认排序（indexName本身对应空字符串）不需要在URL中体现
        if (sortValue && sortValue !== '') {
          routeState.sort = sortValue;
        }
      }

      if (indexState.refinementList) {
        for (const attr in indexState.refinementList) {
          const values = indexState.refinementList[attr];
          if (values && values.length > 0) {
            // 特殊处理 in_stock_regions，转换为 quickship 参数
            if (attr === FACET_ATTRIBUTE.in_stock_regions) {
              // 检查是否包含特殊标记，如果是则转换为 quickship=true
              if (values.includes('__QUICKSHIP_ENABLED__')) {
                routeState.quickship = true;
              } else {
                // 如果是普通的 inventory region code，保持原样（向后兼容）
                routeState[attr] = values;
              }
            } else {
              routeState[attr] = values;
            }
          }
        }
      }

      if (indexState.range) {
        const rangeUiState = indexState.range as Record<string, { min?: number; max?: number } | string | undefined>;
        for (const attribute in rangeUiState) {
          const rawValue = rangeUiState[attribute];
          let minVal: number | undefined = undefined;
          let maxVal: number | undefined = undefined;

          if (typeof rawValue === 'string') {
            const parts = rawValue.split(':');
            const minStr = parts[0];
            const maxStr = parts.length > 1 ? parts[1] : undefined;
            if (minStr && minStr.trim().length > 0) {
              const parsed = parseFloat(minStr);
              if (!isNaN(parsed)) minVal = parsed;
            }
            if (maxStr && maxStr.trim().length > 0) {
              const parsed = parseFloat(maxStr);
              if (!isNaN(parsed)) maxVal = parsed;
            }
          } else if (typeof rawValue === 'object' && rawValue !== null) {
            if (rawValue.min != null) {
              const parsedMin = Number(rawValue.min);
              if (!isNaN(parsedMin)) minVal = parsedMin;
            }
            if (rawValue.max != null) {
              const parsedMax = Number(rawValue.max);
              if (!isNaN(parsedMax)) maxVal = parsedMax;
            }
          }

          const currentRangeForRoute: { min?: number; max?: number } = {};
          if (minVal !== undefined) currentRangeForRoute.min = minVal;
          if (maxVal !== undefined) currentRangeForRoute.max = maxVal;

          if (Object.keys(currentRangeForRoute).length > 0) {
            routeState[attribute] = currentRangeForRoute;
          }
        }
      }

      // Handle numericMenu state
      if (indexState.numericMenu) {
        for (const attribute in indexState.numericMenu) {
          const value = indexState.numericMenu[attribute];
          if (typeof value === 'string' && value.length > 0) {
            // Convert from InstantSearch format to custom URL format
            // InstantSearch format: "3:15", "57:", ":100"
            // Desired URL format: ["3_15"], ["57"], ["_100"]
            let transformedValue: string;
            if (value.endsWith(':')) {
              // Only start value: "57:" -> "57"
              transformedValue = value.slice(0, -1);
            } else if (value.startsWith(':')) {
              // Only end value: ":100" -> "_100"
              transformedValue = '_' + value.slice(1);
            } else {
              // Both start and end: "3:15" -> "3_15"
              transformedValue = value.replace(':', '_');
            }
            routeState[attribute] = [transformedValue];
          }
        }
      }

      if (indexState.toggle) {
        for (const attr in indexState.toggle) {
          if (indexState.toggle[attr] !== undefined) {
            routeState[attr] = indexState.toggle[attr];
          }
        }
      }

      return routeState;
    },

    routeToState(routeParams: Record<string, any> = {}): TUiState {
      const newIndexSpecificUiState: Partial<TActualIndexUiState> = {};

      if (routeParams.q !== undefined) {
        newIndexSpecificUiState.query = String(routeParams.q);
      }
      if (routeParams.p !== undefined) {
        newIndexSpecificUiState.page = Number(routeParams.p);
      }
      if (routeParams.sort !== undefined) {
        // Transform sort from "price_desc" back to "{indexName}_price_desc"
        const sortValue = String(routeParams.sort);

        // 🔧 SECURITY FIX: Validate sort value to prevent invalid index names
        // 使用统一配置验证，自动与 search-settings.config.ts 的 sorting 配置保持同步
        if (sortValue && isValidSortValue(sortValue)) {
          newIndexSpecificUiState.sortBy = `${indexName}_${sortValue}`;
        } else {
          // Invalid or unknown sort value - use default sorting
          console.warn(`Invalid sort parameter "${sortValue}" in URL, using default sorting`, {
            sortValue,
            indexName,
            context: 'url_routing_validation',
          });
          newIndexSpecificUiState.sortBy = indexName;
        }
      } else {
        // 当URL中没有sort参数时，明确设置默认排序值以确保服务端和客户端一致
        // 默认排序总是使用indexName本身（对应"Recommendation"）
        newIndexSpecificUiState.sortBy = indexName;
      }

      const refinementListState: Record<string, string[]> = {};
      const rangeStateForUi: Record<string, string> = {};
      const toggleState: Record<string, boolean> = {};
      const numericMenuState: Record<string, string> = {};
      // http://localhost:7780/sg/search?lead_time[0]=3_15
      for (const key in routeParams) {
        if (key === 'q' || key === 'p' || key === 'sort') continue;

        const value = routeParams[key];

        // 特殊处理 quickship 参数，转换为 in_stock_regions 的 refinement
        if (key === 'quickship') {
          if (String(value).toLowerCase() === 'true') {
            // 这里我们不直接设置 refinementListState，而是设置一个特殊标记
            // 实际的 inventory region 值会通过 ruleContexts 传递给后端处理
            refinementListState['in_stock_regions'] = ['__QUICKSHIP_ENABLED__'];
          }
          continue;
        }

        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          (Object.prototype.hasOwnProperty.call(value, 'min') || Object.prototype.hasOwnProperty.call(value, 'max'))
        ) {
          const minStr = value.min !== undefined ? String(value.min).trim() : '';
          const maxStr = value.max !== undefined ? String(value.max).trim() : '';

          if (minStr !== '' || maxStr !== '') {
            rangeStateForUi[key] = `${minStr}:${maxStr}`;
          }
        } else if (String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'false') {
          toggleState[key] = String(value).toLowerCase() === 'true';
        } else if (Array.isArray(value)) {
          const filteredValues = value.map(String).filter((v) => v && v.length > 0);
          if (filteredValues.length > 0) {
            // Check if this is a numericMenu by looking for the underscore format or pure numbers
            // This assumes numericMenu values contain underscores as separators or are pure numbers
            const isNumericMenu = filteredValues.some(
              (v) => (v.includes('_') && /^\d+(_\d*)?$|^(_\d+)$/.test(v)) || /^\d+$/.test(v) // Pure numbers like "57"
            );

            if (isNumericMenu) {
              // Convert from URL format back to InstantSearch format
              // URL format: ["3_15", "57", "_100"]
              // InstantSearch format: "3:15", "57:", ":100" (single string, not array)
              // For numericMenu, we only take the first value since it's single selection
              const urlValue = filteredValues[0];
              let transformedValue: string;
              if (urlValue.startsWith('_')) {
                // Only end value: "_100" -> ":100"
                transformedValue = ':' + urlValue.slice(1);
              } else if (urlValue.includes('_')) {
                // Both start and end: "3_15" -> "3:15"
                transformedValue = urlValue.replace('_', ':');
              } else {
                // Only start value: "57" -> "57:"
                transformedValue = urlValue + ':';
              }
              numericMenuState[key] = transformedValue;
            } else {
              // Regular refinementList
              refinementListState[key] = filteredValues;
            }
          }
        } else if (typeof value === 'string' && value.length > 0) {
          // Check if this is a single numericMenu value
          if ((value.includes('_') && /^\d+(_\d*)?$|^(_\d+)$/.test(value)) || /^\d+$/.test(value)) {
            // Convert from URL format back to InstantSearch format
            let transformedValue: string;
            if (value.startsWith('_')) {
              // Only end value: "_100" -> ":100"
              transformedValue = ':' + value.slice(1);
            } else if (value.includes('_')) {
              // Both start and end: "3_15" -> "3:15"
              transformedValue = value.replace('_', ':');
            } else {
              // Only start value: "57" -> "57:"
              transformedValue = value + ':';
            }
            numericMenuState[key] = transformedValue;
          } else {
            refinementListState[key] = [value];
          }
        }
      }

      if (Object.keys(refinementListState).length > 0) {
        newIndexSpecificUiState.refinementList = refinementListState;
      }
      if (Object.keys(rangeStateForUi).length > 0) {
        newIndexSpecificUiState.range = rangeStateForUi as Partial<TActualIndexUiState>['range'];
      }
      if (Object.keys(toggleState).length > 0) {
        newIndexSpecificUiState.toggle = toggleState as Partial<TActualIndexUiState>['toggle'];
      }
      if (Object.keys(numericMenuState).length > 0) {
        newIndexSpecificUiState.numericMenu =
          numericMenuState as unknown as Partial<TActualIndexUiState>['numericMenu'];
      }

      return {
        [indexName]: newIndexSpecificUiState as TActualIndexUiState,
      } as TUiState;
    },
  };
}
