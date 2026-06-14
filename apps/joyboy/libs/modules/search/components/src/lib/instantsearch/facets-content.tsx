import { RefinementListProps } from 'react-instantsearch';
import { PanelGroup } from './panel';
import { NestedCategoriesRefinement } from './nested-categories-refinement';
import { RangeSlider } from './range-slider';
import { CustomRefinementList } from './refinement-list';
import { ColorRefinementList } from './color-refinement-list';
import { CustomNumericMenu } from './custom-number-menu';
import {
  getLeadTimeGroups,
  isLeadTimeFilterEnabled,
  SIT_COMFORT_MAPPINGS,
  SEAT_DEPTH_MAPPINGS,
  SEAT_HEIGHT_MAPPINGS,
  SEAT_SOFTNESS_MAPPINGS,
  TAG_MAPPINGS,
  createUnderscoreTransformItems,
  convertUnderscoreToSpace,
} from '../config';
import { formatCurrencyClient } from '@castlery/monorepo-i18n';
import { FACET_ATTRIBUTE } from '../config/facet-attributes.config';
import { useFacetHeader } from '../config/facet-display.config';
import { useLeadTimeItems } from '../config/search-context';
import { RefinementPanel, RangePanel, NumericMenuPanel } from './can-refine-panel';
import { useFilterOrdersData } from '../config/search-context';
import { useMemo } from 'react';
import { FeatureManager, FeatureName } from '@castlery/monorepo-features';

// import { CurrentRefinements } from './current-refinements'; // Commented out due to import error

// TODO 这里还是有问题  没思考好怎么处理 如果显式要求的tags
const tagsTransformItems: RefinementListProps['transformItems'] = (items) => {
  return items
    .filter((item) => TAG_MAPPINGS[item.value])
    .map((item) => {
      // First check if there's a specific mapping for this tag
      const mappedLabel = TAG_MAPPINGS[item.value];
      if (mappedLabel) {
        return {
          ...item,
          label: mappedLabel,
        };
      }

      // If no mapping exists and the label contains underscores, convert to space-separated
      if (item.label.includes('_')) {
        return {
          ...item,
          label: convertUnderscoreToSpace(item.label),
        };
      }

      // Otherwise use the original label
      return {
        ...item,
        label: item.label,
      };
    });
};

// Transform function for converting underscore-separated values to title case
const underscoreTransformItems = createUnderscoreTransformItems();

// Custom sort function for tags to prioritize selected items first, then priority tags
const tagsSortBy = (
  a: { name: string; count: number; isRefined: boolean },
  b: { name: string; count: number; isRefined: boolean }
) => {
  const priorityTags = ['new', 'sale', 'clearance'];

  // First priority: selected items come first
  if (a.isRefined && !b.isRefined) {
    return -1;
  }
  if (!a.isRefined && b.isRefined) {
    return 1;
  }

  // If both are selected or both are not selected, then sort by priority
  const aPriority = priorityTags.indexOf(a.name);
  const bPriority = priorityTags.indexOf(b.name);

  // If both are priority tags, maintain their order
  if (aPriority !== -1 && bPriority !== -1) {
    return aPriority - bPriority;
  }

  // If only a is priority, a comes first
  if (aPriority !== -1) {
    return -1;
  }

  // If only b is priority, b comes first
  if (bPriority !== -1) {
    return 1;
  }

  // If neither is priority, maintain original order
  return 0;
};

interface FacetsContentProps {
  categoryFilter?: string[]; // 分类筛选器：要显示的分类permalink列表，undefined表示隐藏分类筛选
}
const MAX_FACETS_LIMIT = 999;
const LIMIT = 8;

export function FacetsContent({ categoryFilter }: FacetsContentProps) {
  const getFacetHeader = useFacetHeader();
  const filterOrdersData = useFilterOrdersData();
  const leadTimeItems = useLeadTimeItems();

  // Check if sustainability feature is enabled for current channel/region
  const featureManager = FeatureManager.getInstance();
  const isSustainabilityFeatureEnabled = featureManager.isFeatureEnabled(FeatureName.SUSTAINABILITY_FEATURE);

  // 使用 useMemo 缓存排序函数，避免重复渲染
  const sortByFunctions = useMemo(() => {
    const createSortFunction = (facetAttribute: string) => {
      const orderValues = filterOrdersData?.[facetAttribute];
      if (!orderValues?.length) return undefined;

      return (
        a: { name: string; count: number; isRefined: boolean },
        b: { name: string; count: number; isRefined: boolean }
      ) => {
        // 按照 filterOrdersData 中的顺序排序
        const aIndex = orderValues.indexOf(a.name);
        const bIndex = orderValues.indexOf(b.name);

        // 如果都在排序数组中，按数组顺序排序
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // 在排序数组中的排在前面
        if (aIndex !== -1 && bIndex === -1) return -1;
        if (aIndex === -1 && bIndex !== -1) return 1;
        // 都不在排序数组中，保持原顺序
        return 0;
      };
    };

    return {
      [FACET_ATTRIBUTE.rug_size]: createSortFunction(FACET_ATTRIBUTE.rug_size),
      [FACET_ATTRIBUTE.fabric_type]: createSortFunction(FACET_ATTRIBUTE.fabric_type),
      [FACET_ATTRIBUTE.fabric_feature]: createSortFunction(FACET_ATTRIBUTE.fabric_feature),
    };
  }, [filterOrdersData]);
  return (
    <>
      <PanelGroup>
        {categoryFilter !== undefined && (
          <NestedCategoriesRefinement
            header={getFacetHeader(FACET_ATTRIBUTE.category)}
            attribute={FACET_ATTRIBUTE.category}
            categoryFacetFilter={categoryFilter}
          />
        )}

        <RefinementPanel
          header={getFacetHeader(FACET_ATTRIBUTE.material_filter)}
          attribute={FACET_ATTRIBUTE.material_filter}
        >
          {/* Material */}
          <CustomRefinementList
            attribute={FACET_ATTRIBUTE.material_filter}
            limit={LIMIT}
            showMoreLimit={MAX_FACETS_LIMIT}
            showMore
            transformItems={underscoreTransformItems}
          />
        </RefinementPanel>

        <RangePanel header={getFacetHeader(FACET_ATTRIBUTE.length)} attribute={FACET_ATTRIBUTE.length}>
          {/* Length */}
          <RangeSlider attribute={FACET_ATTRIBUTE.length} />
        </RangePanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.color)} attribute={FACET_ATTRIBUTE.color}>
          {/* Color */}
          <ColorRefinementList attribute={FACET_ATTRIBUTE.color} limit={MAX_FACETS_LIMIT} />
        </RefinementPanel>

        <RefinementPanel
          header={getFacetHeader(FACET_ATTRIBUTE.bed_frame_size)}
          attribute={FACET_ATTRIBUTE.bed_frame_size}
        >
          {/* Bed Frame Size  */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.bed_frame_size} transformItems={underscoreTransformItems} />
        </RefinementPanel>

        <RangePanel header={getFacetHeader(FACET_ATTRIBUTE.price)} attribute={FACET_ATTRIBUTE.price}>
          {/* Price */}
          <RangeSlider
            attribute={FACET_ATTRIBUTE.price}
            formatMinMaxLabels={(value) => formatCurrencyClient(value)}
            sliderProps={{
              getAriaValueText: (value) => formatCurrencyClient(value),
              valueLabelFormat: (value) => formatCurrencyClient(value),
            }}
          />
        </RangePanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.tags)} attribute={FACET_ATTRIBUTE.tags}>
          {/* Featured */}
          <CustomRefinementList
            attribute={FACET_ATTRIBUTE.tags}
            transformItems={tagsTransformItems}
            sortBy={tagsSortBy}
            limit={3}
            showMoreLimit={MAX_FACETS_LIMIT}
            showMore
            hideShowMoreBtn
          />
        </RefinementPanel>

        <RefinementPanel
          header={getFacetHeader(FACET_ATTRIBUTE.fabric_feature)}
          attribute={FACET_ATTRIBUTE.fabric_feature}
        >
          {/* Fabric Feature */}
          <CustomRefinementList
            attribute={FACET_ATTRIBUTE.fabric_feature}
            transformItems={underscoreTransformItems}
            sortBy={sortByFunctions[FACET_ATTRIBUTE.fabric_feature]}
          />
        </RefinementPanel>

        <RangePanel
          header={getFacetHeader(FACET_ATTRIBUTE.seat_depth_rating)}
          attribute={FACET_ATTRIBUTE.seat_depth_rating}
        >
          {/* Seat Depth */}
          <RangeSlider
            attribute={FACET_ATTRIBUTE.seat_depth_rating}
            formatMinMaxLabels={(value, isMin) => (isMin ? 'Shallow' : 'Deep')}
            sliderProps={{
              getAriaValueText: (value, index) => SEAT_DEPTH_MAPPINGS[index],
              valueLabelFormat: (value) => SEAT_DEPTH_MAPPINGS[value],
            }}
          />
        </RangePanel>

        <RangePanel
          header={getFacetHeader(FACET_ATTRIBUTE.seat_softness_rating)}
          attribute={FACET_ATTRIBUTE.seat_softness_rating}
        >
          {/* Seat Softness */}
          <RangeSlider
            attribute={FACET_ATTRIBUTE.seat_softness_rating}
            formatMinMaxLabels={(value, isMin) => (isMin ? 'Soft' : 'Firm')}
            sliderProps={{
              getAriaValueText: (value, index) => SEAT_SOFTNESS_MAPPINGS[index],
              valueLabelFormat: (value) => SEAT_SOFTNESS_MAPPINGS[value],
            }}
          />
        </RangePanel>

        <RangePanel
          header={getFacetHeader(FACET_ATTRIBUTE.overall_sit_rating)}
          attribute={FACET_ATTRIBUTE.overall_sit_rating}
        >
          {/* Seat Comfort  */}
          <RangeSlider
            attribute={FACET_ATTRIBUTE.overall_sit_rating}
            formatMinMaxLabels={(value, isMin) => (isMin ? 'Relaxed' : 'Upright')}
            sliderProps={{
              getAriaValueText: (value, index) => SIT_COMFORT_MAPPINGS[index],
              valueLabelFormat: (value) => SIT_COMFORT_MAPPINGS[value],
            }}
          />
        </RangePanel>

        <RangePanel
          header={getFacetHeader(FACET_ATTRIBUTE.seat_height_rating)}
          attribute={FACET_ATTRIBUTE.seat_height_rating}
        >
          {/* Seat Height */}
          <RangeSlider
            attribute={FACET_ATTRIBUTE.seat_height_rating}
            formatMinMaxLabels={(value, isMin) => (isMin ? 'Low' : 'High')}
            sliderProps={{
              getAriaValueText: (value, index) => SEAT_HEIGHT_MAPPINGS[index],
              valueLabelFormat: (value) => SEAT_HEIGHT_MAPPINGS[value],
            }}
          />
        </RangePanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.fabric_type)} attribute={FACET_ATTRIBUTE.fabric_type}>
          {/* Fabric Type */}
          <CustomRefinementList
            attribute={FACET_ATTRIBUTE.fabric_type}
            transformItems={underscoreTransformItems}
            sortBy={sortByFunctions[FACET_ATTRIBUTE.fabric_type]}
          />
        </RefinementPanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.product_type)} attribute={FACET_ATTRIBUTE.product_type}>
          {/* Mirror Type */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.product_type} transformItems={underscoreTransformItems} />
        </RefinementPanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.shape)} attribute={FACET_ATTRIBUTE.shape}>
          {/* Mirror Shape */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.shape} transformItems={underscoreTransformItems} />
        </RefinementPanel>
        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.styles)} attribute={FACET_ATTRIBUTE.styles}>
          {/* Styles */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.styles} transformItems={underscoreTransformItems} />
        </RefinementPanel>
        <RefinementPanel
          header={getFacetHeader(FACET_ATTRIBUTE.bed_slat_height)}
          attribute={FACET_ATTRIBUTE.bed_slat_height}
        >
          {/* Bed Slat Height */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.bed_slat_height} transformItems={underscoreTransformItems} />
        </RefinementPanel>
        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.upholstery)} attribute={FACET_ATTRIBUTE.upholstery}>
          {/* Upholstery */}
          <CustomRefinementList attribute={FACET_ATTRIBUTE.upholstery} transformItems={underscoreTransformItems} />
        </RefinementPanel>

        <RefinementPanel header={getFacetHeader(FACET_ATTRIBUTE.rug_size)} attribute={FACET_ATTRIBUTE.rug_size}>
          {/* Rug Size */}
          <CustomRefinementList
            attribute={FACET_ATTRIBUTE.rug_size}
            transformItems={underscoreTransformItems}
            sortBy={sortByFunctions[FACET_ATTRIBUTE.rug_size]}
          />
        </RefinementPanel>

        {isLeadTimeFilterEnabled &&
          (() => {
            // leadTimeItems 已经在 getLeadTimeItemsData 中排序好了，直接使用即可
            const effectiveLeadTimeItems = leadTimeItems || getLeadTimeGroups();

            return (
              <NumericMenuPanel
                header={getFacetHeader(FACET_ATTRIBUTE.lead_time)}
                attribute={FACET_ATTRIBUTE.lead_time}
                items={effectiveLeadTimeItems}
              >
                {/* Lead Time */}
                <CustomNumericMenu attribute={FACET_ATTRIBUTE.lead_time} items={effectiveLeadTimeItems} />
              </NumericMenuPanel>
            );
          })()}

        {isSustainabilityFeatureEnabled && (
          <RefinementPanel
            header={getFacetHeader(FACET_ATTRIBUTE.sustainability_feature)}
            attribute={FACET_ATTRIBUTE.sustainability_feature}
          >
            {/* Sustainability Feature */}
            <CustomRefinementList
              attribute={FACET_ATTRIBUTE.sustainability_feature}
              transformItems={underscoreTransformItems}
            />
          </RefinementPanel>
        )}
      </PanelGroup>
    </>
  );
}
