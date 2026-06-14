import { FACET_ATTRIBUTE } from './facet-attributes.config';
import {
  TAG_MAPPINGS,
  SIT_COMFORT_MAPPINGS,
  SEAT_DEPTH_MAPPINGS,
  SEAT_HEIGHT_MAPPINGS,
  SEAT_SOFTNESS_MAPPINGS,
  getLeadTimeGroups,
} from './index';
import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';
import { RANGE_ATTRIBUTES as RANGE_ATTRS, FacetWidgetTypeUtils } from './facet-widget-types.config';

import { slugToName } from '@castlery/utils';
import { formatCurrencyClient, LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { EcEnv } from '@castlery/config';

// Type definitions for better type safety
export interface RefinementItem {
  label: string;
  value: string | number;
  attribute: string;
  operator?: string;
  type?: string;
}

export interface FacetDisplayConfig {
  attribute: string;
  header: string;
  transformLabel?: (label: string) => string;
}

// Configuration for numericMenu facets
export interface NumericMenuConfig {
  attribute: string;
  getItems: () => NumericMenuConnectorParamsItem[];
}

// NumericMenu configurations
export const NUMERIC_MENU_CONFIGS: NumericMenuConfig[] = [
  {
    attribute: FACET_ATTRIBUTE.lead_time,
    getItems: getLeadTimeGroups,
  },
  // 可以在这里添加更多的 numericMenu 配置
  // {
  //   attribute: FACET_ATTRIBUTE.some_other_attribute,
  //   getItems: getSomeOtherGroups,
  // },
];

// Re-export for backward compatibility
export const RANGE_ATTRIBUTES = RANGE_ATTRS;
export type RangeAttribute = (typeof RANGE_ATTRS)[number];

export const FACET_DISPLAY_CONFIG: Record<string, FacetDisplayConfig> = {
  [FACET_ATTRIBUTE.category]: {
    attribute: FACET_ATTRIBUTE.category,
    header: 'Category',
  },
  [FACET_ATTRIBUTE.color]: {
    attribute: FACET_ATTRIBUTE.color,
    header: 'color', // Will be translated in component
  },
  [FACET_ATTRIBUTE.material_filter]: {
    attribute: FACET_ATTRIBUTE.material_filter,
    header: 'Material',
  },
  [FACET_ATTRIBUTE.product_type]: {
    attribute: FACET_ATTRIBUTE.product_type,
    header: 'Mirror Type',
  },
  [FACET_ATTRIBUTE.shape]: {
    attribute: FACET_ATTRIBUTE.shape,
    header: 'Mirror Shape',
  },
  [FACET_ATTRIBUTE.styles]: {
    attribute: FACET_ATTRIBUTE.styles,
    header: 'Styles',
  },
  [FACET_ATTRIBUTE.bed_frame_size]: {
    attribute: FACET_ATTRIBUTE.bed_frame_size,
    header: 'Size',
  },
  [FACET_ATTRIBUTE.tags]: {
    attribute: FACET_ATTRIBUTE.tags,
    header: 'Featured',
    transformLabel: (label: string) => TAG_MAPPINGS[label] || label,
  },
  [FACET_ATTRIBUTE.fabric_feature]: {
    attribute: FACET_ATTRIBUTE.fabric_feature,
    header: 'Fabric Feature',
  },
  [FACET_ATTRIBUTE.upholstery]: {
    attribute: FACET_ATTRIBUTE.upholstery,
    header: 'Upholstery',
  },
  [FACET_ATTRIBUTE.bed_slat_height]: {
    attribute: FACET_ATTRIBUTE.bed_slat_height,
    header: 'Bed Slat Height',
  },
  [FACET_ATTRIBUTE.rug_size]: {
    attribute: FACET_ATTRIBUTE.rug_size,
    header: 'Rug Size',
  },
  [FACET_ATTRIBUTE.fabric_type]: {
    attribute: FACET_ATTRIBUTE.fabric_type,
    header: 'Fabric Type',
  },
  [FACET_ATTRIBUTE.price]: {
    attribute: FACET_ATTRIBUTE.price,
    header: 'Price',
  },
  [FACET_ATTRIBUTE.length]: {
    attribute: FACET_ATTRIBUTE.length,
    header: 'length', // Will be translated in component
  },
  [FACET_ATTRIBUTE.overall_sit_rating]: {
    attribute: FACET_ATTRIBUTE.overall_sit_rating,
    header: 'Seat Comfort',
  },
  [FACET_ATTRIBUTE.seat_depth_rating]: {
    attribute: FACET_ATTRIBUTE.seat_depth_rating,
    header: 'Seat Depth',
  },
  [FACET_ATTRIBUTE.seat_height_rating]: {
    attribute: FACET_ATTRIBUTE.seat_height_rating,
    header: 'Seat Height',
  },
  [FACET_ATTRIBUTE.seat_softness_rating]: {
    attribute: FACET_ATTRIBUTE.seat_softness_rating,
    header: 'Seat Softness',
  },
  [FACET_ATTRIBUTE.lead_time]: {
    attribute: FACET_ATTRIBUTE.lead_time,
    header: 'dispatch', // Will be translated in component
  },
  [FACET_ATTRIBUTE.in_stock_regions]: {
    attribute: FACET_ATTRIBUTE.in_stock_regions,
    header: 'In Stock Regions',
  },
  [FACET_ATTRIBUTE.sustainability_feature]: {
    attribute: FACET_ATTRIBUTE.sustainability_feature,
    header: 'Sustainability Feature',
  },
};

/**
 * Hook for getting facet header with translation support
 * This hook internally handles the translation, avoiding inconsistency issues
 * from passing translation function externally
 */
export const useFacetHeader = () => {
  // TODO 现在这里会导致 hydration error , 因为服务端渲染出的数据和客户端是不一样的
  const { t } = useTranslation(LocalesNamespace.SHARED, {
    keyPrefix: 'common',
  });

  return (attribute: string): string => {
    const config = FACET_DISPLAY_CONFIG[attribute];
    if (!config) return attribute;

    const header = config.header;
    if (EcEnv.NODE_ENV === 'development') {
      // 这里临时关闭翻译，避免 hydration error ,需要等 abby 来确认为啥这里无法i18n
      return header;
    }

    if (header === 'dispatch') {
      return t('dispatch');
    }
    if (header === 'length') {
      return t('length');
    }
    if (header === 'color') {
      return t('color');
    }
    return header;
  };
};

// Transform facet label - handles both single values and refinements arrays
export const transformFacetLabel = (
  attribute: string,
  label: string | number | RefinementItem[],
  t?: (key: string) => string
): string | null => {
  const config = FACET_DISPLAY_CONFIG[attribute];

  // Handle refinements array (for numericMenu and range)
  if (Array.isArray(label)) {
    const refinements = label as RefinementItem[];

    // Category: hierarchical structure, each refinement displayed independently
    if (attribute === FACET_ATTRIBUTE.category) {
      return null; // Return null to indicate each refinement should be processed individually
    }

    // numericMenu refinements: operator-based (>=, <=)
    if (FacetWidgetTypeUtils.isNumericMenu(attribute)) {
      const numericMenuConfig = NUMERIC_MENU_CONFIGS.find((config) => config.attribute === attribute);
      if (numericMenuConfig) {
        const items = numericMenuConfig.getItems();
        const transformedLabel = transformNumericMenuRefinements(refinements, items);
        if (transformedLabel) {
          return transformedLabel;
        }
      }
    }

    // range refinements (slider): check for range attributes with 2 refinements
    if (
      refinements.length === 2 &&
      (refinements.every((r) => r.type === 'numeric') || FacetWidgetTypeUtils.isRange(attribute))
    ) {
      const transformedLabel = transformRangeRefinements(
        refinements,
        (attr, val) => transformFacetLabel(attr, val, t) || ''
      );
      if (transformedLabel) {
        return transformedLabel;
      }
    }

    return null;
  }

  // Handle single value
  const labelStr = typeof label === 'number' ? label.toString() : label;

  // Handle category transformation
  if (attribute === FACET_ATTRIBUTE.category && typeof label === 'string') {
    return transformCategoryLabel(label);
  }

  // Handle rating mappings
  if (typeof label === 'number') {
    if (attribute === FACET_ATTRIBUTE.overall_sit_rating && label >= 0 && label < SIT_COMFORT_MAPPINGS.length) {
      return SIT_COMFORT_MAPPINGS[label];
    }
    if (attribute === FACET_ATTRIBUTE.seat_depth_rating && label >= 0 && label < SEAT_DEPTH_MAPPINGS.length) {
      return SEAT_DEPTH_MAPPINGS[label];
    }
    if (attribute === FACET_ATTRIBUTE.seat_height_rating && label >= 0 && label < SEAT_HEIGHT_MAPPINGS.length) {
      return SEAT_HEIGHT_MAPPINGS[label];
    }
    if (attribute === FACET_ATTRIBUTE.seat_softness_rating && label >= 0 && label < SEAT_SOFTNESS_MAPPINGS.length) {
      return SEAT_SOFTNESS_MAPPINGS[label];
    }
  }

  // Handle price formatting
  if (attribute === FACET_ATTRIBUTE.price && typeof label === 'number') {
    return formatCurrencyClient(label);
  }

  // Handle length formatting
  if (attribute === FACET_ATTRIBUTE.length && typeof label === 'number') {
    return label.toString();
  }

  // Handle lead time string parsing
  if (attribute === FACET_ATTRIBUTE.lead_time && typeof label === 'string') {
    if (label.includes(':')) {
      const [startStr, endStr] = label.split(':');
      const start = startStr ? parseInt(startStr) : undefined;
      const end = endStr ? parseInt(endStr) : undefined;

      const numericMenuConfig = NUMERIC_MENU_CONFIGS.find((config) => config.attribute === attribute);
      if (numericMenuConfig) {
        const items = numericMenuConfig.getItems();
        const leadTimeItem = items.find((item) => {
          if (start !== undefined && end !== undefined) {
            return item.start === start && item.end === end;
          } else if (start !== undefined && end === undefined) {
            return item.start === start && !item.end;
          } else if (start === undefined && end !== undefined) {
            return !item.start && item.end === end;
          }
          return false;
        });

        if (leadTimeItem) {
          return leadTimeItem.label;
        }
      }
    }
  }

  // Use custom transform function from config
  if (config?.transformLabel) {
    return config.transformLabel(labelStr);
  }

  // Default: replace hyphens and underscores with spaces
  return labelStr.replace(/[-_]/g, ' ');
};

/**
 * Generic helper function to transform numericMenu refinements
 * @param refinements Array of refinement items
 * @param items Array of NumericMenuConnectorParamsItem from configuration
 * @returns Transformed label or null if no match
 */
export const transformNumericMenuRefinements = (
  refinements: RefinementItem[],
  items: NumericMenuConnectorParamsItem[]
): string | null => {
  const minRefinement = refinements.find((r) => r.operator === '>=');
  const maxRefinement = refinements.find((r) => r.operator === '<=');

  if (minRefinement && maxRefinement) {
    const minValue = minRefinement.value as number;
    const maxValue = maxRefinement.value as number;
    const matchingGroup = items.find((group) => group.start === minValue && group.end === maxValue);
    return matchingGroup ? matchingGroup.label : `${minValue} - ${maxValue}`;
  } else if (minRefinement) {
    const minValue = minRefinement.value as number;
    const matchingGroup = items.find((group) => group.start === minValue && !group.end);
    return matchingGroup ? matchingGroup.label : `≥ ${minValue}`;
  } else if (maxRefinement) {
    const maxValue = maxRefinement.value as number;
    const matchingGroup = items.find((group) => !group.start && group.end === maxValue);
    return matchingGroup ? matchingGroup.label : `≤ ${maxValue}`;
  }

  return null;
};

/**
 * Generic helper function to transform range refinements
 * @param refinements Array of refinement items
 * @param transformSingleValue Function to transform individual values
 * @returns Transformed label or null if not a valid range
 */
export const transformRangeRefinements = (
  refinements: RefinementItem[],
  transformSingleValue: (attribute: string, value: string | number) => string
): string | null => {
  if (refinements.length === 2) {
    const [minRefinement, maxRefinement] = refinements;
    const minLabel = transformSingleValue(minRefinement.attribute, minRefinement.value);
    const maxLabel = transformSingleValue(maxRefinement.attribute, maxRefinement.value);
    return `${minLabel} - ${maxLabel}`;
  }
  return null;
};

/**
 * 转换分类标签的统一函数
 * 处理顶级分类和子分类的显示格式
 */
export const transformCategoryLabel = (categoryValue: string, isGroupHeader = false): string => {
  const parts = categoryValue.split('/');

  if (parts.length === 1) {
    const category = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase();
    return isGroupHeader ? category : `All ${category}`;
  } else {
    const subCategory = parts[parts.length - 1];
    return slugToName(subCategory);
  }
};

/**
 * 使用 categoriesData 转换分类标签的函数
 * 优先使用 categoriesData 中的 name，如果没有找到则回退到 transformCategoryLabel
 */
export const transformCategoryLabelWithData = (
  categoryValue: string,
  categoriesData?: { permalink: string; name: string }[],
  isGroupHeader = false
): string => {
  // 如果有 categoriesData，尝试查找对应的 name
  if (categoriesData && categoriesData.length > 0) {
    const categoryData = categoriesData.find((cat) => {
      return cat.permalink === categoryValue;
    });
    if (categoryData) {
      return categoryData.name;
    }
  }

  // 如果没有找到对应的数据，回退到原来的转换逻辑
  return transformCategoryLabel(categoryValue, isGroupHeader);
};
