import { featureManager, FeatureName } from '@castlery/monorepo-features';
import { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';
import { RefinementListProps } from 'react-instantsearch';

// Export sort options configuration
export * from './sort-options.config';
export * from './facet-attributes.config';

// Utility function to convert underscore-separated text to space-separated text
export const convertUnderscoreToSpace = (text: string): string => {
  return text.replace(/_/g, ' ');
};

// Generic transform function for refinement lists
export const createUnderscoreTransformItems: () => RefinementListProps['transformItems'] = () => (items: any) => {
  return items.map((item: any) => ({
    ...item,
    label: convertUnderscoreToSpace(item.label),
  }));
};

// Rating value mappings
export const SIT_COMFORT_MAPPINGS = ['', 'Very relaxed', 'Relaxed', 'Medium', 'Upright', 'Very upright'];
export const SEAT_DEPTH_MAPPINGS = ['', 'Very shallow', 'Shallow', 'Medium', 'Deep', 'Very deep'];
export const SEAT_HEIGHT_MAPPINGS = ['', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
export const SEAT_SOFTNESS_MAPPINGS = ['', 'Very soft', 'Soft', 'Medium', 'Firm', 'Very firm'];

// Mapping of tag keys to display labels
export const TAG_MAPPINGS: Record<string, string> = {
  new: 'New arrival',
  sale: 'Sale',
  clearance: 'Clearance',
  // midcentury: 'Mid-Century',
  // double11: '11.11 Flash Sale',
  // black_friday: 'Black Friday',
  // double12: '12.12 Flash Sale',
  // sofa_pairup: 'Sofa Pair Up',
  // bed_pairup: 'Bed Pair Up',
  // tables_pairup: 'Table Pair Up',
  // homerefresh: 'Home Refresh Sale',
  // bundleup: 'Bundle Up',
  // midcenturymodern: 'Mid-Century Modern',
  // modern: 'Modern',
  // blackfriday: 'Black Friday',
  // quickship: 'Quick Ship',
  // bundlesale: 'Bundle Sale',
  // web_ar: 'Web AR',
};

// Get lead time configuration from feature manager
export const getLeadTimeConfig = () => {
  const payload = featureManager.getFeatureFlagPayload(FeatureName.LEAD_TIME_FILTER);
  return payload || null;
};

// Check if lead time filter should be displayed
export const isLeadTimeFilterEnabled = featureManager.isFeatureEnabled(FeatureName.LEAD_TIME_FILTER);
// Get lead time groups for current region
export const getLeadTimeGroups = (): NumericMenuConnectorParamsItem[] => {
  const config = getLeadTimeConfig();
  return config?.leadTimeGroups || [];
};

// Legacy export for backward compatibility (deprecated)
export const LEAD_TIME_GROUP = getLeadTimeGroups();
