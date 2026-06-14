/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';
import classNames from 'classnames';
import { getFlattenedCategories, getSalePages } from 'pages';
import { daysToDate, isOutdated } from 'utils/time';
import lang from 'utils/lang';
import {
  RefinementListFilter,
  NumericRefinementListFilter,
  DynamicRangeFilter,
  RangeFilter,
  Panel,
  RangeSlider,
  BoolShould,
  MatchQuery,
  NestedQuery,
} from 'searchkit';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enableQuickShip, globalFeatureInUS, enableSustainableFilter } from 'config';
import InputFilter from './InputFilter';
import { FILTERS, LEAD_TIME_GROUP } from '../config';

import {
  AnimatedPanel,
  CheckboxOption,
  ColorOption,
  IntRangeSlider,
  SectionCheckboxItemList,
  OrderCheckboxItemList,
  QuickshipFilter,
  QuickshipSwitch,
} from '../searchkitComponents';

import style from './style.scss';

const searchQueryBuilder = (query) =>
  BoolShould([
    MatchQuery('name', query, {
      fuzziness: 1,
      prefix_length: 1,
    }),
    MatchQuery('name.stemmed', query),
    MatchQuery('name', query),
    NestedQuery(
      'taxons',
      MatchQuery('taxons.name', query, {
        fuzziness: 1,
        prefix_length: 1,
      })
    ),
    NestedQuery('taxons', MatchQuery('taxons.stemmed', query)),
    NestedQuery('taxons', MatchQuery('taxons.name', query)),
    {
      nested: {
        path: 'categories',
        query: {
          wildcard: {
            'categories.permalink': {
              value: `*${query}*`,
              boost: 1000.0,
            },
          },
        },
      },
    },
  ]);

const Filters = ({
  hasCategoryFilter,
  isAllCategory,
  collapsable,
  bufferedComponents,
  className,
  taxonomyPermalink,
}) => {
  const { desktop } = useBreakpoints();
  const flattenedCategories = uniqBy(getFlattenedCategories(), (c) => c.permalink);

  const leadtimeFilters = getSalePages()
    .filter((page) => !isOutdated(page.publishedAt, page.endedAt))
    .filter((page) => page.queryDeliverBefore?.length > 0)
    .map((page) => ({
      title: page.queryDeliverBefore?.[0]?.filterPresentation || page.name,
      from: 0,
      to: daysToDate(page.queryDeliverBefore?.[0]?.deadline),
    }));
  // remove duplicates

  const filters = uniqBy(leadtimeFilters, (filter) => filter.title);

  return (
    <div className={classNames(className, style.filters)}>
      {desktop && enableQuickShip && (
        <QuickshipFilter
          id="quickship"
          field="variants.in_stock_regions.raw"
          fieldOptions={{
            type: 'nested',
            options: {
              path: 'variants',
            },
          }}
          itemComponent={bufferedComponents.QuickshipSwitch || QuickshipSwitch}
        />
      )}
      {desktop && hasCategoryFilter && (
        <RefinementListFilter
          id="category"
          title="Category"
          size={flattenedCategories.length}
          field="categories.permalink"
          fieldOptions={{
            type: 'nested',
            options: {
              path: 'categories',
            },
          }}
          include={flattenedCategories.map((c) => c.permalink)}
          translations={flattenedCategories.reduce(
            (r, p) => ({
              ...r,
              [p.permalink]: p.name,
            }),
            {}
          )}
          operator="OR"
          showMore={false}
          itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
          listComponent={(props) => (
            <SectionCheckboxItemList {...props} isAllCategory={isAllCategory} taxonomyPermalink={taxonomyPermalink} />
          )}
          containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
        />
      )}
      <RefinementListFilter
        id="product_type"
        title="Mirror Type"
        field="variants.properties.product_type"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="shape"
        title="Mirror Shape"
        field="variants.properties.shape"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="tags"
        title="Featured"
        field="variants.tags"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        include={['new', 'sale', 'clearance']}
        translations={{
          new: 'New arrival',
          sale: globalFeatureInUS
            ? !isOutdated(null, '2022-11-28 00:00')
              ? 'Black Friday Sale'
              : !isOutdated('2022-11-28 00:00', '2022-12-05 00:00')
              ? 'Cyber Monday Sale'
              : 'Sale'
            : 'Sale',
          clearance: 'Clearance',
          midcentury: 'Mid-Century',
          double11: '11.11 Flash Sale',
          black_friday: 'Black Friday',
          double12: '12.12 Flash Sale',
          sofa_pairup: 'Sofa Pair Up',
          bed_pairup: 'Bed Pair Up',
          tables_pairup: 'Table Pair Up',
          homerefresh: 'Home Refresh Sale',
          bundleup: 'Bundle Up',
          midcenturymodern: 'Mid-Century Modern',
          modern: 'Modern',
          blackfriday: 'Black Friday',
          quickship: 'Quick Ship',
          bundlesale: 'Bundle Sale',
          web_ar: 'Web AR',
        }}
        operator="OR"
        itemComponent={(props) => {
          const BufferedCheckbox = bufferedComponents.CheckboxOption;
          const checkboxGroup = 'tags';
          return BufferedCheckbox ? (
            <BufferedCheckbox {...props} checkboxGroup={checkboxGroup} />
          ) : (
            <CheckboxOption {...props} checkboxGroup={checkboxGroup} />
          );
        }}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      {FILTERS.hasLeadTimeFilter && (
        <NumericRefinementListFilter
          id="lead_time"
          title={lang.t('common.dispatch')}
          showCount={false}
          multiselect
          field="variants.lead_time"
          fieldOptions={{
            type: 'nested',
            options: {
              path: 'variants',
            },
          }}
          options={[...filters, ...LEAD_TIME_GROUP]}
          itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
          containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
        />
      )}
      <RefinementListFilter
        id="material_filter"
        title="Material"
        field="variants.properties.material_filter"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <DynamicRangeFilter
        id="price"
        title="Price"
        field="variants.price"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        rangeComponent={bufferedComponents.IntRangeSlider || IntRangeSlider}
        rangeFormatter={(price) => `${lang.t('common.currency_symbol')}${price}`}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="color"
        title={lang.t('common.color')}
        field="variants.color"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.ColorOption || ColorOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <DynamicRangeFilter
        id="length"
        title={lang.t('common.length')}
        field="variants.properties.length"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        rangeComponent={bufferedComponents.IntRangeSlider || IntRangeSlider}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="bed_frame_size"
        title="Size"
        field="variants.option_values.bed_frame_size.value"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="upholstery"
        title="Upholstery"
        field="variants.properties.upholstery"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="bed_slat_height"
        title="Bed Slat Height"
        field="variants.properties.bed_slat_height"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="rug_size"
        title="Rug Size"
        field="variants.properties.rug_size"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        listComponent={(props) => <OrderCheckboxItemList {...props} orderProperty="rug_size" />}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="styles"
        title="Style"
        field="styles"
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RangeFilter
        id="overall_sit_rating"
        title="Seat Comfort"
        field="variants.properties.overall_sit_rating"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        rangeFormatter={(num) => ['Very relaxed', 'Relaxed', 'Medium', 'Upright', 'Very upright'][num - 1]}
        min={1}
        max={5}
        showHistogram={false}
        marks={{
          1: 'Relaxed',
          5: 'Upright',
        }}
        rangeComponent={bufferedComponents.RangeSlider || RangeSlider}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RangeFilter
        id="seat_depth_rating"
        title="Seat Depth"
        field="variants.properties.seat_depth_rating"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        min={1}
        max={5}
        rangeFormatter={(num) => ['Very shallow', 'Shallow', 'Medium', 'Deep', 'Very deep'][num - 1]}
        showHistogram={false}
        marks={{
          1: 'Shallow',
          5: 'Deep',
        }}
        rangeComponent={bufferedComponents.RangeSlider || RangeSlider}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RangeFilter
        id="seat_height_rating"
        title="Seat Height"
        field="variants.properties.seat_height_rating"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        min={1}
        max={5}
        rangeFormatter={(num) => ['Very low', 'Low', 'Medium', 'High', 'Very high'][num - 1]}
        showHistogram={false}
        marks={{
          1: 'Low',
          5: 'High',
        }}
        rangeComponent={bufferedComponents.RangeSlider || RangeSlider}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RangeFilter
        id="seat_softness_rating"
        title="Seat Softness"
        field="variants.properties.seat_softness_rating"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'variants',
          },
        }}
        min={1}
        max={5}
        rangeFormatter={(num) => ['Very soft', 'Soft', 'Medium', 'Firm', 'Very firm'][num - 1]}
        showHistogram={false}
        marks={{
          1: 'Soft',
          5: 'Firm',
        }}
        rangeComponent={bufferedComponents.RangeSlider || RangeSlider}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      {!desktop && hasCategoryFilter && (
        <RefinementListFilter
          id="category"
          title="Category"
          size={flattenedCategories.length}
          field="categories.permalink"
          fieldOptions={{
            type: 'nested',
            options: {
              path: 'categories',
            },
          }}
          include={flattenedCategories.map((c) => c.permalink)}
          translations={flattenedCategories.reduce(
            (r, p) => ({
              ...r,
              [p.permalink]: p.name,
            }),
            {}
          )}
          operator="OR"
          showMore={false}
          itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
          listComponent={(props) => (
            <SectionCheckboxItemList {...props} isAllCategory={isAllCategory} taxonomyPermalink={taxonomyPermalink} />
          )}
          containerComponent={collapsable ? <AnimatedPanel collapsable={false} /> : <Panel />}
        />
      )}
      <InputFilter
        title="name"
        id="q"
        queryBuilder={searchQueryBuilder}
        placeholder="Search names"
        searchOnChange={false}
        queryFields={['name']}
      />
      <RefinementListFilter
        id="fabric_feature"
        title="Fabric Feature"
        field="swatches.properties.fabric_feature"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'swatches',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        listComponent={(props) => <OrderCheckboxItemList {...props} orderProperty="fabric_feature" />}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      <RefinementListFilter
        id="fabric_type"
        title="Fabric Type"
        field="swatches.properties.fabric_type"
        fieldOptions={{
          type: 'nested',
          options: {
            path: 'swatches',
          },
        }}
        operator="OR"
        itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
        listComponent={(props) => <OrderCheckboxItemList {...props} orderProperty="fabric_type" />}
        containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
      />
      {enableSustainableFilter && (
        <RefinementListFilter
          id="sustainability_feature"
          title="Sustainability Feature"
          field="variants.properties.sustainability_feature"
          fieldOptions={{
            type: 'nested',
            options: {
              path: 'variants',
            },
          }}
          operator="OR"
          itemComponent={bufferedComponents.CheckboxOption || CheckboxOption}
          listComponent={(props) => <OrderCheckboxItemList {...props} orderProperty="sustainability_feature" />}
          containerComponent={collapsable ? <AnimatedPanel collapsable defaultCollapsed={false} /> : <Panel />}
        />
      )}
    </div>
  );
};

Filters.propTypes = {
  hasCategoryFilter: PropTypes.bool,
  isAllCategory: PropTypes.bool,
  collapsable: PropTypes.bool,
  bufferedComponents: PropTypes.object,
  className: PropTypes.string,
  taxonomyPermalink: PropTypes.string,
};

Filters.contextTypes = {
  searchkit: PropTypes.object,
};

Filters.defaultProps = {
  hasCategoryFilter: false,
  collapsable: false,
  bufferedComponents: {},
};

export default Filters;
