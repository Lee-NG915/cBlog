import {
  FilterBasedAccessor,
  ValueState,
  TermQuery,
  TermsBucket,
  CardinalityMetric,
  // SelectedFilter,
  FilterBucket,
  FieldContextFactory,
} from 'searchkit';

import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import { get as getShippingLocation } from 'utils/shippingLocation';

// refer: https://github.com/searchkit/searchkit/blob/e0df076a956ab4776b093a57b51ab1f27928d5d8/packages/searchkit/src/core/accessors/FacetAccessor.ts
export default class QuickshipAccessor extends FilterBasedAccessor {
  state = new ValueState();

  constructor(key, options) {
    super(key, options.id);
    this.options = options;
    this.defaultSize = options.size;
    this.options.facetsPerPage = this.options.facetsPerPage || 50;
    this.size = this.defaultSize;
    this.loadAggregations = isUndefined(this.options.loadAggregations) ? true : this.options.loadAggregations;
    if (options.translations) {
      this.translations = { ...this.translations, ...options.translations };
    }
    this.options.fieldOptions = this.options.fieldOptions || {
      type: 'embedded',
    };
    this.options.fieldOptions.field = this.options.field;
    this.fieldContext = FieldContextFactory(this.options.fieldOptions);
  }

  getOrder() {
    if (this.options.orderKey) {
      const orderDirection = this.options.orderDirection || 'asc';
      return { [this.options.orderKey]: orderDirection };
    }
  }

  buildSharedQuery(query) {
    const filter = this.state.getValue();
    const { inventoryRegionCode } = getShippingLocation();
    if (filter && inventoryRegionCode) {
      const filterTerm = this.fieldContext.wrapFilter(TermQuery(this.options.field, inventoryRegionCode));
      // const selectedFilters = map(filters, (filter) => ({
      //   name: this.options.title || this.translate(this.options.field),
      //   value: this.translate(filter),
      //   id: this.options.id,
      //   remove: () => (this.state = this.state.remove(filter)),
      // }));
      if (filterTerm) {
        // eslint-disable-next-line no-param-reassign
        query = query.addFilter(this.uuid, filterTerm);
        // .addSelectedFilters(selectedFilters);
      }
    }

    return query;
  }

  buildOwnQuery(query) {
    if (!this.loadAggregations) {
      return query;
    }
    return query.setAggs(
      FilterBucket(
        this.uuid,
        query.getFiltersWithoutKeys(undefined),
        ...this.fieldContext.wrapAggregations(
          TermsBucket(
            this.options.field,
            this.options.field,
            omitBy(
              {
                size: this.size,
                order: this.getOrder(),
                include: this.options.include,
                exclude: this.options.exclude,
                min_doc_count: this.options.min_doc_count,
              },
              isUndefined
            )
          ),
          CardinalityMetric(`${this.options.field}_count`, this.options.field)
        )
      )
    );
  }
}
