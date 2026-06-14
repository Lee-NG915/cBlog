import { SearchkitManager } from 'searchkit';
import { get as getShippingLocation } from 'utils/shippingLocation';
import ApiClient from 'helpers/ApiClient';
import { set as setCookie, get as getCookie } from 'helpers/Cookie';
import { getHistory } from 'helpers/History';

import {
  filterVaraintsFromHit,
  pickupSearchFromSalePage,
  formatSKresult,
  sortHitsBySkus,
  getRankingParams,
} from './utils';

export default class EnhancedSearchkitManager extends SearchkitManager {
  constructor(host, options = {}, initialState = {}) {
    super(host, options, initialState);
  }

  /**
   * handle search from search input
   */
  listenToHistory() {
    this._unlistenHistory = this.history.listen((location) => {
      const { isFromSearch } = location.state || {};
      if (isFromSearch || location.action === 'POP') {
        this._searchWhenCompleted(location);
      }
    });
  }

  /**
   * modify SearchkitManager for story block sale page.
   */
  _searchWhenCompleted(location) {
    let { search } = location;
    if (!this.hasSetUpQueryFromPage) {
      search = pickupSearchFromSalePage(location);
      this.hasSetUpQueryFromPage = true;
    }
    let retryTimeout = null;
    this.registrationCompleted
      .then(() => {
        this.searchFromUrlQuery(search).then((data) => {
          if (data?.results === null) {
            retryTimeout = setTimeout(() => {
              this.searchFromUrlQuery(search);
              clearTimeout(retryTimeout);
              retryTimeout = null;
            }, 500);
          }
        });
      })
      .catch((e) => {
        console.error(
          JSON.stringify(
            {
              message: 'Error in SearchkitManager',
              error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e),
            },
            null,
            2
          )
        );
      });
  }

  setResults(results) {
    results.hits.hits.forEach((hit) => {
      filterVaraintsFromHit(hit, this._getOwnFilters());
    });

    // super.setResults(formatSKresult(results));

    // // if has sort or search, do not need to call dy api
    if (!this.isNeedToRanking() || __SERVER__) {
      super.setResults(formatSKresult(results));
    } else if (results?.hits?.hits?.length > 1) {
      this.rankingByDy({ results })
        .then(({ hits: newHits }) => {
          results.hits.hits = newHits;
          super.setResults(formatSKresult(results));
        })
        .catch((e) => {
          super.setResults(formatSKresult(results));
          console.log(e);
        });
    } else {
      super.setResults(formatSKresult(results) || {});
    }
  }

  isNeedToRanking() {
    const location = getHistory()?.getCurrentLocation() || {};
    const hasSort = location?.query?.sort && location?.query?.sort !== 'none';
    const hasSearch = location?.query?.q;
    const quickship = location?.query?.quickship;
    return Boolean(!hasSort && !hasSearch && !quickship);
  }

  /**
   *
   * @param {*} searchkitState = { results }
   * @returns {Promise} { searchkitState, hits }
   */
  rankingByDy(searchkitState) {
    const { hits } = searchkitState?.results?.hits || {};
    if (!hits || hits.length === 0) {
      return Promise.resolve({ searchkitState, hits: [] });
    }
    if (!this.isNeedToRanking()) {
      return Promise.resolve({ searchkitState, hits });
    }
    const pathname = getHistory()?.getCurrentLocation()?.pathname || '';
    const params = getRankingParams(hits, pathname);
    const client = new ApiClient();
    const url = __SERVER__
      ? 'https://dy-api.com/v2/serve/user/choose'
      : 'https://direct.dy-api.com/v2/serve/user/choose';

    return new Promise((resolve, reject) => {
      client
        .post(url, params)
        .then((res) => {
          const { choices, cookies } = res;
          if (__CLIENT__ && cookies && !getCookie('_dyid_server') && !getCookie('_dyjsession')) {
            setCookie('_dyid_server', cookies[0].value);
            setCookie('_dyjsession', cookies[1].value);
          }
          const skus = choices?.[0]?.variations[0]?.payload?.data?.slots?.map((slot) => slot.sku);
          if (skus) {
            const newHits = sortHitsBySkus(hits, skus);
            // add decisionId, variationId, slotId to hit
            newHits.forEach((hit, index) => {
              const decisionId = choices?.[0]?.decisionId || '';
              const variationId = choices?.[0]?.variations?.[0]?.id || '';
              const slot =
                choices?.[0]?.variations?.[0]?.payload?.data?.slots?.find(
                  (slot) => slot.sku === hit?._source?.variants?.[0].sku
                ) || '';
              newHits[index]._source = {
                ...hit?._source,
                decisionId,
                variationId,
                slotId: slot?.slotId,
              };
            });

            // const newSkus = newHits.map((hit) => hit?._source?.variants?.[0].sku);
            resolve({ searchkitState, hits });
          } else {
            hits.forEach((hit, index) => {
              const decisionId = choices?.[0]?.decisionId || '';
              hits[index]._source = {
                ...hit?._source,
                decisionId,
              };
            });
            resolve({ searchkitState, hits });
          }
        })
        .catch((err) => {
          console.log('ranking error', err);
          reject(err);
        });
    });
  }

  _getOwnFilters() {
    const { state } = this;
    const filters = [];
    const { inventoryRegionCode = '' } = getShippingLocation();

    Object.keys(state).forEach((key) => {
      if (key !== 'lead_time') {
        switch (key) {
          case 'quickship':
            return filters.push({
              fields: ['in_stock_regions'],
              method: 'term',
              value: Array.isArray(inventoryRegionCode) ? inventoryRegionCode : [inventoryRegionCode],
            });
          case 'color':
          case 'tags':
            return filters.push({
              fields: [key],
              method: 'term',
              value: state[key],
            });
          case 'firmness':
          case 'upholstery':
          case 'material_filter':
          case 'bed_slat_height':
          case 'rug_size':
          case 'sustainability_feature':
            return filters.push({
              fields: ['properties', key],
              method: 'term',
              value: state[key],
            });

          case 'bed_frame_size':
            return filters.push({
              fields: ['option_values', key, 'value'],
              method: 'term',
              value: state[key],
            });

          case 'mirror_type':
          case 'mirror_shape':
          case 'product_type':
          case 'shape':
          case 'category':
          case 'styles':
            return filters.push({
              fields: [],
            });

          case 'price':
            return filters.push({
              fields: [key],
              method: 'range',
              value: Object.keys(state[key]).length > 0 ? [state[key]] : [],
            });

          case 'length':
          case 'overall_sit_rating':
          case 'seat_height_rating':
          case 'seat_softness_rating':
          case 'seat_depth_rating':
            return filters.push({
              fields: ['properties', key],
              method: 'range',
              value: Object.keys(state[key]).length > 0 ? [state[key]] : [],
            });
          default:
        }
      } else {
        const value = [];
        state[key].forEach((l) => {
          const lArr = l.split('_');
          if (lArr.length > 1) {
            value.push({
              min: lArr[0],
              max: +lArr[1] - 1,
            });
          } else {
            value.push({
              min: lArr[0],
            });
          }
        });
        filters.push({
          fields: [key],
          method: 'range',
          value,
        });
      }
    });
    return filters;
  }
}
