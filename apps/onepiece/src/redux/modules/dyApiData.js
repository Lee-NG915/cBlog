/* eslint-disable prettier/prettier */
import { enableHPMigrationTest } from 'config';
import { get as getCookie, set as setCookie } from 'helpers/Cookie';
import { getHistory } from 'helpers/History';

const LOAD = 'dyApiData/LOAD';
const LOAD_SUCCESS = 'dyApiData/LOAD_SUCCESS';
const LOAD_FAIL = 'dyApiData/LOAD_FAIL';

// export const campaignNames = {
//   RAF: 'Recommendations above fold',
// };

const RoomDesignerSelector = ['Room Designer'];

const ModularToolSelector = ['Modular Tool'];

const PlaTestSelector = ['PLA A/B Test'];

const PDPPromotionSelector = ['PDP Promotion with API', 'PDP Promotion1 with API', 'PDP Promotion2 with API'];

const PDPRecommendationSelector = ['PDP Rec API - Top', 'PDP Recommendation API #2', 'PDP Recommendation API #3'];

const PDPCustomizedSelector = ['Customized Recommendation'];

const usedProductIdMap = {};

const usedMaterialTypeMap = {};

const initialState = {
  campaign: {},
};

export default function dyApiData(state = initialState, action = {}) {
  if (action.type === LOAD_SUCCESS) {
    let holder = {};
    const { choices, cookies } = action.result;
    setCookie('_dyid_server', cookies[0].value);
    setCookie('_dyjsession', cookies[1].value);
    if (Array.isArray(choices) && choices.length > 0 && choices[0].decisionId !== null) {
      holder = choices.reduce((acc, choice) => {
        if (choice.name === 'Collection Recommendation') {
          const { collectionName } = action;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              [collectionName]: choice?.variations[0]?.payload?.data?.slots,
            },
          };
        }
        if (PDPCustomizedSelector.includes(choice.name)) {
          const { materialType } = action;
          if (usedMaterialTypeMap?.[materialType]) {
            return {
              [choice.name]: {
                ...state.campaign[choice.name],
                [materialType]: choice?.variations[0]?.payload?.data?.slots,
              },
            };
          }
        }
        if (PDPPromotionSelector.includes(choice.name)) {
          const { productId } = action;
          const { data } = choice?.variations[0]?.payload;
          data.decisionId = choice.decisionId;
          data.variationId = choice?.variations[0]?.id;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              [productId]: choice?.variations[0]?.payload?.data || '',
            },
          };
        }
        if (PDPRecommendationSelector.includes(choice.name)) {
          const { productId } = action;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              [productId]: choice?.variations[0]?.payload?.data || null,
            },
          };
        }
        if (RoomDesignerSelector.includes(choice.name)) {
          const { productId } = action;
          const { data } = choice?.variations[0]?.payload;
          data.decisionId = choice?.decisionId;
          data.variationId = choice?.variations[0]?.id;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              [productId]: choice?.variations?.[0]?.payload?.data || null,
            },
          };
        }
        if (ModularToolSelector.includes(choice.name)) {
          const { productId } = action;
          const { data } = choice?.variations[0]?.payload;
          data.decisionId = choice?.decisionId;
          data.variationId = choice?.variations[0]?.id;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              [productId]: choice?.variations?.[0]?.payload?.data || null,
            },
          };
        }
        if (PlaTestSelector.includes(choice.name)) {
          const { data } = choice?.variations[0]?.payload;
          data.decisionId = choice?.decisionId;
          data.variationId = choice?.variations[0]?.id;
          return {
            [choice.name]: {
              ...state.campaign[choice.name],
              ...(choice?.variations?.[0]?.payload?.data || null),
            },
          };
        }
        return {
          ...acc,
          [choice.name]: {
            campaignName: choice.name,
            data: choice.variations[0]?.payload?.data,
            variationId: choice.variations[0]?.id,
            decisionId: choice.decisionId,
          },
        };
      }, {});
    }
    return {
      campaign: { ...state.campaign, ...holder },
    };
  }
  return {
    ...state,
  };
}

export function load({
  selectorArray = [],
  pageType = 'other',
  customContext = null,
  collectionName = '',
  shouldCheckIfNeedLoad = true,
  realtimeRulesData, // object => { includeConditions: [], excludeConditions: [] }
  campaignName = 'Collection Recommendation',
  customPageAttribute = {},
  productId = '',
  shouldCheckIfNeedLoadDeep = false,
  shouldCheckIfNeedLoadDeepMaterial = false,
  limitCountry = [],
  materialType = ''
} = {}) {
  return (dispatch, getState) => {
    if (limitCountry.length !== 0) {
      let limit = false;
      limitCountry.forEach((country) => {
        if (country.toUpperCase() === __COUNTRY__) {
          limit = true;
        }
      });
      if (!limit) {
        return Promise.resolve();
      }
    }
    if (enableHPMigrationTest && selectorArray.length > 0 && selectorArray[0] === 'HP Migration Test') {
      return Promise.resolve({});
    }
    if (!__SERVER_DY_API_KEY__ || !__CLIENT_DY_API_KEY__) {
      return Promise.resolve();
    }
    if (
      shouldCheckIfNeedLoad &&
      selectorArray.every((selector) => getState().dyApiData.campaign[selector] !== undefined)
    ) {
      if (collectionName === '') {
        return Promise.resolve();
      }
      if (getState().dyApiData.campaign['Collection Recommendation'][collectionName]) {
        return Promise.resolve();
      }
    }
    if (shouldCheckIfNeedLoadDeep) {
      if (usedProductIdMap?.[productId]) {
        if (usedProductIdMap[productId].includes(selectorArray[0])) {
          return Promise.resolve();
        }
        usedProductIdMap[productId].push(selectorArray[0]);
      } else {
        usedProductIdMap[productId] = [];
        usedProductIdMap[productId].push(selectorArray[0]);
      }
      if (selectorArray.every((selector) => getState().dyApiData.campaign[selector]?.[productId] !== undefined)) {
        return Promise.resolve();
      }
    }
    if (shouldCheckIfNeedLoadDeepMaterial) {
      if (usedMaterialTypeMap?.[materialType]) {
        if (usedMaterialTypeMap[materialType].includes(selectorArray[0])) {
          return Promise.resolve();
        }
        usedMaterialTypeMap[materialType].push(selectorArray[0]);
      } else {
        usedMaterialTypeMap[materialType] = [];
        usedMaterialTypeMap[materialType].push(selectorArray[0]);
      }
      if (
        selectorArray.every(
          (selector) => getState().dyApiData.campaign[selector]?.[materialType] !== undefined
        )
      ) {
        return Promise.resolve();
      }
    }
    const { query, pathname } = getHistory().getCurrentLocation();
    const previewToken = [];
    if (query.dyApiPreview) {
      previewToken.push(query.dyApiPreview);
    }
    let type = 'OTHER';
    let data = [];
    let url = 'https://direct.dy-api.com/v2/serve/user/choose';
    let newUser = 'false';
    if (__SERVER__) {
      type = pageType.toUpperCase();
      url = 'https://dy-api.com/v2/serve/user/choose';
      if (!getCookie('_dyid')) {
        newUser = 'true';
      }
      if (customContext) {
        ({ type } = customContext);
        ({ data } = customContext);
      } 
    } else {
      if (getCookie('newUser') === 'true') newUser = 'true';
      if (customContext !== null) {
        ({ type } = customContext || {});
        ({ data } = customContext || {});
      } else if (window.DY) {
        ({ type } = window.DY?.recommendationContext || {});
        ({ data } = window.DY?.recommendationContext || {});
      }
    }
    if (!Array.isArray(data)) data = [];
    if (typeof type !== 'string') type = 'OTHER';
    const ipAddress = getState()?.geolocation?.data?.ip_address || '';
    // docs:https://support.dynamicyield.com/hc/en-us/articles/4414496292497-Return-Recommendations-Real-time-Filter-Data#return-recommendations-real-time-filter-data-0-0
    const realtimeRules = realtimeRulesData && [
      {
        type: 'include', // Include or exclude
        slots: realtimeRulesData?.includeSlots || [],
        query: {
          conditions: realtimeRulesData?.includeConditions || [],
        },
      },
      {
        type: 'exclude',
        slots: realtimeRulesData?.excludeSlots || [],
        query: {
          conditions: realtimeRulesData?.excludeConditions || [],
        },
      },
    ];
    const payload = {
      header: {
        'Content-Type': 'application/json',
        'dy-api-key': __SERVER__ ? __SERVER_DY_API_KEY__ : __CLIENT_DY_API_KEY__,
      },
      data: {
        user: {
          dyid: getCookie('_dyid'),
          dyid_server: getCookie('_dyid_server'),
        },
        session: {
          dy: getCookie('_dyjsession'),
        },
        context: {
          page: {
            type,
            location: `${__ONE_PIECE_WEB_SERVER_NAME__}${__BASE_ROUTE__}${pathname}`,
            data,
          },
          device: {
            ip: ipAddress
          },
          pageAttributes: { newUser, ...customPageAttribute },
        },
        selector: {
          names: selectorArray,
          preview: {
            ids: previewToken,
          },
          args:
            collectionName || realtimeRules
              ? {
                  [campaignName]: {
                    realtimeRules: realtimeRules || [
                      {
                        type: 'include', // Include or exclude
                        slots: [],
                        query: {
                          conditions: [
                            // conditions is 'and', arguments is 'or'
                            {
                              field: 'collection', // Condition
                              arguments: [
                                {
                                  action: 'CONTAINS', // Action type IS / IS_NOT / CONTAINS / EQ / GT / GTE / LT / LTE
                                  value: collectionName, // Value of condition
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                }
              : {},
        },
      },
    };

    return dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.post(url, payload),
      collectionName,
      productId,
      materialType
    }).catch((error) => {
      console.log('🚀 ~ file: dyApiData.js:325 ~ return ~ error:', error);
    });
  };
}
