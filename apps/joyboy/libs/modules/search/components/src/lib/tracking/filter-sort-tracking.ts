import { UiState } from 'instantsearch.js';
import { debounce } from 'instantsearch.js/es/lib/utils';

// Filter and sort tracking
let previousUiState: UiState | null = null;

export interface FilterTrackingData {
  attribute: string;
  action: string;
  label: string;
}

export interface SortTrackingData {
  attribute: string;
  action: string;
  label: string;
}

// Filter label mapping
const FILTER_LABEL_MAPPING: Record<string, string> = {
  category: 'Category Filter',
  tags: 'Featured Filter',
  lead_time: 'Leaves Warehouse Filter',
  material_filter: 'Material',
  color: 'Color Filter',
  price: 'Price Filter',
  length: 'Length Filter',
  bed_frame_size: 'Bed Frame Size Filter',
  overall_sit_rating: 'Seat Comfort Filter',
  seat_depth_rating: 'Seat Depth Filter',
  seat_height_rating: 'Seat Height Filter',
  seat_softness_rating: 'Seat Softness Filter',
  fabric_feature: 'Fabric Feature Filter',
  fabric_type: 'Fabric Type Filter',
};

// Sort label mapping
const SORT_LABEL_MAPPING: Record<string, string> = {
  web_product_price_asc: 'Price: Low to High',
  web_product_lead_asc: 'Fast Dispatch',
  web_product_price_desc: 'Price: High to Low',
  web_product: 'Recommendation',
};

function getSortLabel(sortBy: string | undefined): string {
  if (!sortBy) return SORT_LABEL_MAPPING.web_product;
  return SORT_LABEL_MAPPING[sortBy] || sortBy;
}

// Debounced tracking functions
const debouncedFilterTracking = debounce(
  (data: FilterTrackingData, trackingHandler: (attribute: string, action: string, label: string) => void) => {
    trackingHandler(data.attribute, data.action, data.label);
  },
  500
);

const debouncedSortTracking = debounce(
  (data: SortTrackingData, trackingHandler: (attribute: string, action: string, label: string) => void) => {
    trackingHandler(data.attribute, data.action, data.label);
  },
  500
);

export function handleFilterAndSortTracking(
  uiState: UiState,
  trackingHandler: (attribute: string, action: string, label: string) => Promise<void>
) {
  if (!previousUiState) {
    previousUiState = uiState;
    return;
  }

  const currentState = uiState;
  const prevState = previousUiState;

  // Track refinement list changes (filters)
  Object.keys(currentState).forEach((indexName) => {
    const currentIndexState = currentState[indexName];
    const prevIndexState = prevState[indexName];
    if (!currentIndexState || !prevIndexState) return;
    // Track refinement list filters
    const currentRefinements = currentIndexState.refinementList || {};
    const prevRefinements = prevIndexState.refinementList || {};
    // console.log('currentState', currentState, currentRefinements);

    Object.keys(currentRefinements).forEach((attribute, index) => {
      const currentValues = currentRefinements[attribute] || [];
      const prevValues = prevRefinements[attribute] || [];

      // Only track when new filters are added (not removed)
      if (currentValues.length > prevValues.length) {
        const newValue = currentValues[currentValues.length - 1];
        if (attribute !== 'in_stock_regions') {
          const trackingData: FilterTrackingData = {
            attribute,
            action: `${FILTER_LABEL_MAPPING[attribute] || attribute}`,
            label: newValue,
          };

          // debounce filter tracking
          debouncedFilterTracking(trackingData, trackingHandler);
        }
      }
    });
    // Tracking numericMenu filters
    const currentNumericMenu = currentIndexState.numericMenu || {};
    const prevNumericMenu = prevIndexState.numericMenu || {};

    Object.keys(currentNumericMenu).forEach((attribute) => {
      const currentNumericMenuValue = currentNumericMenu[attribute];
      const prevNumericMenuValue = prevNumericMenu[attribute];

      if (currentNumericMenuValue !== prevNumericMenuValue) {
        const trackingData: FilterTrackingData = {
          attribute,
          action: `${FILTER_LABEL_MAPPING[attribute] || attribute}`,
          label: currentNumericMenuValue?.replace(':', '-'),
        };
        debouncedFilterTracking(trackingData, trackingHandler);
      }
    });

    // Track range filters
    const currentRange = currentIndexState.range || {};
    const prevRange = prevIndexState.range || {};

    Object.keys(currentRange).forEach((attribute) => {
      const currentRangeValue = currentRange[attribute];
      const prevRangeValue = prevRange[attribute];

      if (currentRangeValue !== prevRangeValue) {
        const trackingData: FilterTrackingData = {
          attribute,
          action: `${FILTER_LABEL_MAPPING[attribute] || attribute}`,
          label: currentRangeValue?.replace(':', '-'),
        };

        debouncedFilterTracking(trackingData, trackingHandler);
      }
    });

    // Track sort changes
    if (currentIndexState.sortBy !== prevIndexState.sortBy) {
      const trackingData: SortTrackingData = {
        attribute: 'sort_by',
        action: 'Sort Filter',
        label: getSortLabel(currentIndexState.sortBy),
      };
      debouncedSortTracking(trackingData, trackingHandler);
    }
  });

  previousUiState = uiState;
}

export function cleanupTrackingFilterAndSort() {
  previousUiState = null;
}
