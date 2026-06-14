import { getPageByUrl } from 'pages';
import { getRealTimePayload, getCategoryContext } from 'utils/dy';

const COLOR_OPTION_LIMIT = 3;

export function _sortFilterVariantsByColor(variants) {
  // filter distinct variants based on material or other fields
  const selectProps = [];
  const selectLengths = [];
  const colorVariants = [];
  const noColorVariants = [];
  let lengthVariantsLength = 0;
  // indicate whether the first item is sale item
  let isSaleFirstInShown = false;
  let isSaleFirstInHidden = false;
  const optionsMap = {};
  variants.forEach((v) => {
    if (Object.keys(v.option_values).length > 0) {
      Object.keys(v.option_values).forEach((key) => {
        if (optionsMap[key]) {
          if (!optionsMap[key].includes(v.option_values[key].value)) {
            optionsMap[key].push(v.option_values[key].value);
          }
        } else if (['material', 'color_option', 'wood', 'leg_color', 'frame'].includes(key)) {
          optionsMap[key] = [];
          if (!optionsMap[key].includes(v.option_values[key].value)) {
            optionsMap[key].push(v.option_values[key].value);
          }
        }
      });
    }
  });
  let selectedOptionValue = 'material';
  if (Object.keys(optionsMap).length > 0) {
    if (optionsMap?.material?.length > 1) {
      selectedOptionValue = 'material';
    } else if (optionsMap?.color_option?.length > 1) {
      selectedOptionValue = 'color_option';
    } else if (optionsMap?.wood?.length > 1) {
      selectedOptionValue = 'wood';
    } else if (optionsMap?.leg_color?.length > 1) {
      selectedOptionValue = 'leg_color';
    } else if (optionsMap?.frame?.length > 1) {
      selectedOptionValue = 'frame';
    } else if (optionsMap?.material?.length === 1) {
      selectedOptionValue = 'material';
    } else if (optionsMap?.color_option?.length === 1) {
      selectedOptionValue = 'color_option';
    } else if (optionsMap?.wood?.length === 1) {
      selectedOptionValue = 'wood';
    } else if (optionsMap?.leg_color?.length === 1) {
      selectedOptionValue = 'leg_color';
    } else if (optionsMap?.frame?.length === 1) {
      selectedOptionValue = 'frame';
    }
  }
  variants.forEach((v) => {
    const targetOption = v.option_values[selectedOptionValue];
    // const targetOption = v.option_values.material || v.option_values.color_option || v.option_values.wood;
    if (targetOption) {
      const targetOptionValue = targetOption.value;
      if (selectProps.indexOf(targetOptionValue) === -1) {
        selectProps.push(targetOptionValue);
        if (!isSaleFirstInShown && v.tags.indexOf('Sale') > -1) {
          colorVariants.unshift(v);
          isSaleFirstInShown = true;
        } else {
          colorVariants.push(v);
        }
      }
    } else if (!isSaleFirstInHidden && v.tags.indexOf('Sale') > -1) {
      noColorVariants.unshift(v);
      isSaleFirstInHidden = true;
    } else {
      noColorVariants.push(v);
    }
    const lengthOption = v.option_values.length;
    if (lengthOption && selectLengths.indexOf(lengthOption.value) === -1) {
      selectLengths.push(lengthOption.value);
      lengthVariantsLength += 1;
    }
  });

  return {
    colorVariantsLength: colorVariants.length,
    lengthVariantsLength,
    variants: colorVariants.length ? colorVariants.slice(0, COLOR_OPTION_LIMIT) : noColorVariants.slice(0, 1),
    colorOptionLimit: COLOR_OPTION_LIMIT,
  };
}

export function filterVaraintsFromHit(hit, filters) {
  const product = hit._source;
  const { variants } = product;
  // filter variants based on filters provided
  product.variants = variants.filter((v) =>
    filters.every((filter) => {
      if (filter.fields.length === 0) {
        return true;
      }
      // get the target field value
      const targetValue = filter.fields.reduce((result, f) => {
        if (result) {
          return result[f];
        }
        return result;
      }, v);

      if (filter.method === 'term') {
        if (filter.value.length > 0) {
          return filter.value.some((p) => {
            if (typeof targetValue === 'string') {
              return p.toLowerCase() === targetValue.toLowerCase();
            }
            if (Array.isArray(targetValue)) {
              return targetValue.some((value) => value.toLowerCase() === p.toLowerCase());
            }
            return false;
          });
        }
        return true;
      }
      if (filter.method === 'range') {
        if (filter.value.length > 0) {
          if (targetValue === undefined) {
            return false;
          }
          return filter.value.some((value) => {
            const min = +value.min || -Infinity;
            const max = +value.max || Infinity;
            return targetValue >= min && targetValue <= max;
          });
        }
        return true;
      }
      return true;
    })
  );
  // reduce variants by color & record related info
  const result = _sortFilterVariantsByColor(product.variants);
  Object.assign(product, result);
}

export function pickupSearchFromSalePage(location) {
  let newSearch = location.search ? location.search.slice(1) : '';
  const page = getPageByUrl(location.pathname);
  const pageQuery = page?.query?.replace(/^.*\?/, '');
  if (pageQuery) {
    newSearch += `&${pageQuery}`;
  }
  if (page?.deliverQuery) {
    newSearch += page.deliverQuery;
  }
  return Array.from(new Set(decodeURIComponent(newSearch).split('&'))).join('&');
}

/**
 * @description The total of the results of Elasticsearch7.x + is different from that of 2.x
 */
export function formatSKresult(result = {}) {
  const res = result;
  const totalType = Object.prototype.toString.call(res.hits?.total).match(/\[object (.*)\]/)[1];
  if (totalType === 'Object') {
    res.hits.total = res.hits.total.value || 0;
  }
  return res;
}

/**
 * @description sort hits by skus
 */
export function sortHitsBySkus(hits, skus) {
  const sortFunc = (a, b) => {
    try {
      const aSku = a._source.variants?.[0]?.sku;
      const bSku = b._source.variants?.[0]?.sku;

      const aIndex = skus.indexOf(aSku);
      const bIndex = skus.indexOf(bSku);

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    } catch (error) {
      return 0;
    }
  };
  return hits.sort(sortFunc);
}

/**
 * @description get ranking params
 */

export function getRankingParams(hits, pathname) {
  const customContext = pathname ? getCategoryContext(pathname) : null;
  return getRealTimePayload({
    selectorNames: ['PLP Ranking'],
    pageType: 'Category',
    customContext,
    campaignName: 'PLP Ranking',
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      recsProductData: {
        skusOnly: true,
      },
    },
    rulesConditions: {
      includeConditions: [
        {
          field: 'sku',
          arguments:
            hits && hits.length > 0
              ? hits.map((hit) => ({
                  action: 'IS',
                  value: hit?._source?.variants?.[0].sku,
                }))
              : [],
        },
      ],
    },
  });
}
