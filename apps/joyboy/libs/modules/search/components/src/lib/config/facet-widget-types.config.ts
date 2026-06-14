import { FACET_ATTRIBUTE } from './facet-attributes.config';

/**
 * Facet widget types enum
 * Defines the different types of UI widgets used for facets
 */
export enum FacetWidgetType {
  REFINEMENT_LIST = 'refinement_list', // Standard checkbox/list filters
  RANGE = 'range', // Range sliders (price, length, etc.)
  NUMERIC_MENU = 'numeric_menu', // Predefined numeric ranges (lead_time)
}

/**
 * Facet widget type configuration
 * Maps each facet attribute to its corresponding widget type
 */
export const FACET_WIDGET_TYPE_CONFIG: Record<string, FacetWidgetType> = {
  // Refinement List (string-based filters)
  [FACET_ATTRIBUTE.category]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.tags]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.color]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.product_type]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.shape]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.material_filter]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.bed_frame_size]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.upholstery]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.bed_slat_height]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.rug_size]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.styles]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.fabric_type]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.fabric_feature]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.in_stock_regions]: FacetWidgetType.REFINEMENT_LIST,
  [FACET_ATTRIBUTE.sustainability_feature]: FacetWidgetType.REFINEMENT_LIST,

  // Range (numeric sliders)
  [FACET_ATTRIBUTE.price]: FacetWidgetType.RANGE,
  [FACET_ATTRIBUTE.length]: FacetWidgetType.RANGE,
  [FACET_ATTRIBUTE.overall_sit_rating]: FacetWidgetType.RANGE,
  [FACET_ATTRIBUTE.seat_depth_rating]: FacetWidgetType.RANGE,
  [FACET_ATTRIBUTE.seat_height_rating]: FacetWidgetType.RANGE,
  [FACET_ATTRIBUTE.seat_softness_rating]: FacetWidgetType.RANGE,

  // Numeric Menu (predefined ranges)
  [FACET_ATTRIBUTE.lead_time]: FacetWidgetType.NUMERIC_MENU,
} as const;

/**
 * Utility functions for facet widget types
 */
export const FacetWidgetTypeUtils = {
  /**
   * Get the widget type for a given attribute
   */
  getWidgetType: (attribute: string): FacetWidgetType | undefined => {
    return FACET_WIDGET_TYPE_CONFIG[attribute];
  },

  /**
   * Check if an attribute uses refinement list widget
   */
  isRefinementList: (attribute: string): boolean => {
    return FACET_WIDGET_TYPE_CONFIG[attribute] === FacetWidgetType.REFINEMENT_LIST;
  },

  /**
   * Check if an attribute uses range widget
   */
  isRange: (attribute: string): boolean => {
    return FACET_WIDGET_TYPE_CONFIG[attribute] === FacetWidgetType.RANGE;
  },

  /**
   * Check if an attribute uses numeric menu widget
   */
  isNumericMenu: (attribute: string): boolean => {
    return FACET_WIDGET_TYPE_CONFIG[attribute] === FacetWidgetType.NUMERIC_MENU;
  },

  /**
   * Get all attributes of a specific widget type
   */
  getAttributesByType: (widgetType: FacetWidgetType): string[] => {
    return Object.entries(FACET_WIDGET_TYPE_CONFIG)
      .filter(([, type]) => type === widgetType)
      .map(([attribute]) => attribute);
  },

  /**
   * Check if an attribute should be processed as URL array format
   * (NumericMenu attributes use special URL format like "3_15")
   */
  usesArrayUrlFormat: (attribute: string): boolean => {
    return FACET_WIDGET_TYPE_CONFIG[attribute] === FacetWidgetType.NUMERIC_MENU;
  },
} as const;

/**
 * Type-safe getters for specific widget types
 */
export const REFINEMENT_LIST_ATTRIBUTES = FacetWidgetTypeUtils.getAttributesByType(FacetWidgetType.REFINEMENT_LIST);
export const RANGE_ATTRIBUTES = FacetWidgetTypeUtils.getAttributesByType(FacetWidgetType.RANGE);
export const NUMERIC_MENU_ATTRIBUTES = FacetWidgetTypeUtils.getAttributesByType(FacetWidgetType.NUMERIC_MENU);
