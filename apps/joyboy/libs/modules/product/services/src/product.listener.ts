import { EcEnv, enableZipCode, fetchGuardsmanProductPlans, POS_CHANNEL, WEB_CHANNEL } from '@castlery/config';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import {
  BundleVariants,
  bundleVariantsUpdatedEvent,
  changeSocialUgc,
  changeStockLocation,
  changeSwatches,
  changeSwatchLoading,
  changeVariant,
  getLeadtimeShippingFee,
  getProductByIdOrSlug,
  getSearchResult,
  getVariantByVariantId,
  gotPlpListDetailEvent,
  posGeneratedEvent,
  Product,
  resetSelectedWarrantySelection,
  searchWordChangedEvent,
  setGuardsmanWarrantyDiscovery,
  selectBundleVariants,
  selectProduct,
  selectStockLocation,
  selectVariant,
  selectVariantId,
  selectVariantQuantity,
  setLeadtimeShippingFee,
  setProductList,
  setSearchList,
  setStripeSecret,
  setWarrantyIsFetching,
  setWarrantyList,
  stockLocationUpdatedEvent,
  Swatch,
  swatchErrorUpdatedEvent,
  swatchLoadingUpdatedEvent,
  swatchUpdatedEvent,
  Variant,
  warrantySDKLoadUpdatedEvent,
  // getProductReviewsEvent,
  // selectReviews,
} from '@castlery/modules-product-domain';
import { getCityInfo, updateCityCanBeApply } from '@castlery/modules-user-domain';
import type { AppStartListening } from '@castlery/shared-redux-store';
import { isAnyOf, Unsubscribe } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability/client';
import { getWarrantyProvider } from '@castlery/monorepo-features';
import {
  changeBundleVariantsCommand,
  getProductSocialUgcByVariantCommand,
  refreshLeadtimeCommand,
  refreshWebLeadTimeCommand,
} from './product.helper';

/**
 * Subscribes counter listeners and returns a `teardown` function.
 * @example
 * ```ts
 * useEffect(() => {
 *   const unsubscribe = setupCounterListeners();
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function setupProductListeners(startListening: AppStartListening): Unsubscribe {
  const warrantyProvider = getWarrantyProvider();
  const guardsmanEnabled = warrantyProvider === 'guardsman';
  const mulberryEnabled = warrantyProvider === 'mulberry';
  const shouldListenWarrantySDKLoaded =
    guardsmanEnabled || (mulberryEnabled && EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLowerCase());
  const leadtimeEvents = [
    // getProductByIdOrSlug.matchFulfilled,
    // getVariantByVariantId.matchFulfilled,
    // variantUpdatedEvent,
    // variantQuantityUpdatedEvent,
    bundleVariantsUpdatedEvent,
    changeStockLocation,
    // changeStockLocation,
    // noticeCityInfoUpdated,
    // getFormattedCityEvent,
  ];
  if (!enableZipCode) {
    leadtimeEvents.push(stockLocationUpdatedEvent);
  }
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === POS_CHANNEL && [
      startListening({
        matcher: isAnyOf(...leadtimeEvents),
        effect: async (action, { dispatch, getState }) => {
          // const stockLocationId = selectStockLocation(getState())?.id || '';
          // const stockLocationCode = selectStockLocation(getState())?.code || '';
          const stockLocation = selectStockLocation(getState());
          const quantity = selectVariantQuantity(getState()) || 1;
          let product = selectProduct(getState());
          let variantId = selectVariantId(getState());
          if (action?.meta?.arg?.endpointName === 'getVariantByVariantId') {
            variantId = action.payload.id;
          }
          if (
            action?.meta?.arg?.endpointName === 'getProductByIdOrSlug'
            // || action?.type === 'product/productClientInitialized'
          ) {
            product = action.payload;
            variantId = product.variants[0].id;
          }
          const orderNumber = selectCurrentOrderNumber(getState());

          let params = {
            variant_id: variantId,
            quantity: quantity,
            stock_location_id: stockLocation?.id,
            options: {},
          } as {
            quantity: number;
            stock_location_id: string;
            variant_id: number;
            options: {
              bundle_options?: BundleVariants['bundle_options'];
            };
            zipcode?: string;
            city?: string;
            state?: string;
            order_number?: string;
          };
          if (product?.product_type === 'bundle') {
            const bundleVariants = selectBundleVariants(getState());
            if (!bundleVariants) {
              return;
            }
            params = {
              ...params,
              variant_id: bundleVariants.variant_id,
              options: {
                bundle_options: bundleVariants.bundle_options,
              },
            };
          } else {
            if (!variantId) {
              return;
            }
          }
          if (enableZipCode) {
            const cityInfo = await dispatch(getCityInfo());
            if (cityInfo?.payload) {
              params = {
                ...params,
                zipcode: cityInfo.payload.zipcode,
                order_number: orderNumber,
                city: cityInfo.payload.city,
                state: cityInfo.payload.state,
              };
            }
          }
          // if (stockLocationCode === 'Studio-AUSC-Display') {
          //   params = {
          //     ...params,
          //     zipcode: '2033',
          //     city: 'KENSINGTON',
          //     state: 'NSW',
          //   };
          // }
          if (stockLocation?.code) {
            params = {
              ...params,
              zipcode: stockLocation?.zipcode,
              city: stockLocation?.city,
              state: stockLocation?.state_text,
            };
          }
          try {
            const data = await dispatch(
              getLeadtimeShippingFee.initiate(params, {
                forceRefetch: true,
              })
            ).unwrap();
            dispatch(setLeadtimeShippingFee(data));
          } catch (error) {
            logger.error('Failed to set leadtime shipping fee', { error });
            return;
          }
        },
      }),
    ]) ||
      []),
    // 根据 getLeadtimeShippingFee 结果同步 zipcode slice 的 cityCanBeApply，避免在 product.api 中依赖 user 域造成循环依赖
    ...(enableZipCode
      ? [
          startListening({
            matcher: getLeadtimeShippingFee.matchFulfilled,
            effect: (_, { dispatch }) => {
              dispatch(updateCityCanBeApply(true));
            },
          }),
          startListening({
            matcher: getLeadtimeShippingFee.matchRejected,
            effect: (action, { dispatch }) => {
              const status =
                (action.payload as { status?: number })?.status ?? (action.error as { status?: number })?.status;
              if (status === 422 || status === 400) {
                dispatch(updateCityCanBeApply(false));
              }
            },
          }),
        ]
      : []),
    /**
     * update leadtime shipping fee when
     * - variant updated
     * - variant quantity updated
     * - stock location updated
     * - product updated
     * - bundle variants updated
     */
    startListening({
      matcher: isAnyOf(searchWordChangedEvent),
      effect: async (action: { payload: { name: string } }, { dispatch }) => {
        const { data } = await dispatch(getSearchResult.initiate(action.payload.name));
        dispatch(setSearchList({ list: data || [] }));
      },
    }),

    startListening({
      matcher: gotPlpListDetailEvent,
      effect: (action, { dispatch }) => {
        dispatch(setProductList(action.payload));
      },
    }),
    startListening({
      matcher: getProductByIdOrSlug.matchFulfilled,
      effect: (action, { dispatch }) => {
        if (action?.meta?.arg?.endpointName === 'getProductByIdOrSlug') {
          dispatch(changeVariant(action.payload.variants[0]));
        }
      },
    }),
    startListening({
      matcher: getVariantByVariantId.matchFulfilled,
      effect: async (action, { dispatch, getState: _getState }) => {
        if (action?.meta?.arg?.endpointName === 'getVariantByVariantId') {
          if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === POS_CHANNEL.toLowerCase()) {
            dispatch(refreshLeadtimeCommand({ outerVariantId: action.payload.id })).unwrap();
          }
          if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLowerCase()) {
            dispatch(refreshWebLeadTimeCommand({ outerVariantId: action.payload.id }));
            dispatch(changeVariant(action.payload));
            // if (action.payload?.id && window.DY && window.DY.recommendationContext) {
            //   window.DY.recommendationContext = {
            //     type: DYPageTypes.PRODUCT,
            //     data: [action.payload.sku],
            //   };
            // }
            dispatch(getProductSocialUgcByVariantCommand());
          }
        }
      },
    }),
    startListening({
      matcher: isAnyOf(changeStockLocation),
      effect: async (action, { dispatch }) => {
        if (action?.type === 'product/changeStockLocation') {
          if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === POS_CHANNEL.toLowerCase()) {
            dispatch(refreshLeadtimeCommand({ outerStockLocationCode: (action?.['payload'] as any)?.code })).unwrap();
          }
        }
      },
    }),
    startListening({
      matcher: posGeneratedEvent,
      effect: (action, { dispatch }) => {
        dispatch(setStripeSecret(action.payload.secret));
      },
    }),
    // [保险接入] PDP 保险 plan 发现：product/variant/bundle 变化或 Guardsman SDK 加载完成时触发
    // - Guardsman: fetchGuardsmanProductPlans → setGuardsmanWarrantyDiscovery
    // - Mulberry: window.mulberry.core.getWarrantyOffer → setWarrantyList
    startListening({
      matcher: isAnyOf(
        getProductByIdOrSlug.matchFulfilled,
        getVariantByVariantId.matchFulfilled,
        ...(shouldListenWarrantySDKLoaded ? [warrantySDKLoadUpdatedEvent] : []),
        ...(EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === POS_CHANNEL.toLowerCase() ? [bundleVariantsUpdatedEvent] : [])
        // variantQuantityUpdatedEvent
        // variantUpdatedEvent
        // redux set
        //
      ),
      effect: async (action, { dispatch, getState }) => {
        dispatch(resetSelectedWarrantySelection());
        let product = selectProduct(getState());
        let variant = selectVariant(getState());
        let bundleVariants = selectBundleVariants(getState());
        if (action?.type === 'product/changeBundleVariants') {
          bundleVariants = action['payload'] as BundleVariants;
        }
        if ((action?.['meta'] as any)?.arg?.endpointName === 'getVariantByVariantId') {
          variant = action['payload'] as Variant;
        }
        if (
          (action?.['meta'] as any)?.arg?.endpointName === 'getProductByIdOrSlug' ||
          action?.type === 'product/productClientInitialized'
        ) {
          product = action['payload'] as Product;
          // variantId = product?.variants[0]?.id;
        }

        if (!variant) {
          variant = product?.variants[0];
        }
        dispatch(setWarrantyIsFetching(true));

        let payload = {
          title: variant?.name,
          id: variant?.sku,
          price: variant?.list_price,
          images: variant?.images?.map((image) => {
            return { src: image?.links?.large };
          }),
          meta: {
            breadcrumbs: product?.taxons
              .filter((taxon) => taxon.name !== 'Category' && !taxon.name.includes('Collection'))
              .map((taxon) => ({
                category: taxon.name,
              })),
          },
        };
        if (product?.product_type === 'bundle') {
          if (!bundleVariants) {
            logger.error('Bundle variants not found for bundle product', { bundleVariants });
            return;
          }

          let tempListPrice = 0;
          const tempTitleArr = [product.name];
          console.log('🚀 ~ setupProductListeners ~ bundleVariants:', bundleVariants);

          product?.bundle_options?.forEach((item) => {
            bundleVariants.bundle_options.forEach((option) => {
              if (`${item.id}` === `${option.bundle_option_id}`) {
                item.variants.forEach((subVariant) => {
                  if (subVariant.id === option.bundle_option_variant_id) {
                    // tempPrice += Number(subVariant.price) * option.default_quantity;
                    tempListPrice += Number(subVariant.list_price) * item.default_quantity;
                    tempTitleArr.push(subVariant.name);
                  }
                });
              }
            });
          });
          const convertBundleOptionsToQueryString = (
            bundleOptions: {
              bundle_option_id: string;
              bundle_option_variant_id: number;
            }[]
          ) => {
            return bundleOptions
              .map((option) => {
                return `bundle_option[${option.bundle_option_id}]=${option.bundle_option_variant_id}`;
              })
              .join('&');
          };
          const sku = product?.product_type === 'bundle' ? bundleVariants.sku : variant?.sku;

          payload = {
            ...payload,
            price: `${tempListPrice}`,
            title: tempTitleArr.join(', '),
            id: `${sku}?${convertBundleOptionsToQueryString(bundleVariants.bundle_options)}`,
          };
        }
        // [保险接入] CA 分支 — 按 SKU 向 Guardsman 拉 PDP plan 列表
        if (guardsmanEnabled) {
          const guardsmanProductId =
            product?.product_type === 'bundle' ? bundleVariants?.sku || '' : variant?.sku || '';

          if (!guardsmanProductId) {
            dispatch(setGuardsmanWarrantyDiscovery(null));
            dispatch(setWarrantyIsFetching(false));
            return;
          }

          try {
            const guardsmanResponse = await fetchGuardsmanProductPlans({
              // productId: 'furniture-sofa-001',
              productId: payload.id || '',
              price: Number(variant?.price) || 0,
              options: {
                productTitle: payload.title || '',
              },
            });

            dispatch(setGuardsmanWarrantyDiscovery(guardsmanResponse));
            dispatch(setWarrantyIsFetching(false));
            return;
          } catch (error: unknown) {
            dispatch(setGuardsmanWarrantyDiscovery(null));
            dispatch(setWarrantyIsFetching(false));
            logger.error('guardsman product warranty fetch error', { error });
            return;
          }
        }

        if (!mulberryEnabled) {
          dispatch(setWarrantyIsFetching(false));
          return;
        }

        // [保险接入] US 分支 — Mulberry SDK getWarrantyOffer 拉 PDP plan 列表
        if (!window || !window.mulberry) return;

        window.mulberry?.core
          .getWarrantyOffer(payload)
          .then((data) => {
            dispatch(setWarrantyIsFetching(false));
            if (Array.isArray(data)) {
              dispatch(setWarrantyList(data));
            }
          })
          .catch((error: unknown) => {
            dispatch(setWarrantyIsFetching(false));
            logger.error('getWarrantyOffer error', { error });
          });
      },
    }),
    ...((EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL && [
      startListening({
        matcher: isAnyOf(getProductSocialUgcByVariantCommand.fulfilled),
        effect: (action, { dispatch }) => {
          const payload = action?.['payload'] as any[];
          if (payload?.length) {
            const socialUgc = payload?.reduce((acc, item) => {
              return {
                ...acc,
                [item.variant_id]: item?.social_ugcs,
              };
            }, {});

            dispatch(changeSocialUgc(socialUgc));
          }
        },
      }),
      startListening({
        matcher: isAnyOf(changeBundleVariantsCommand.fulfilled),
        effect: async (action, { dispatch }) => {
          dispatch(refreshWebLeadTimeCommand({}));
          dispatch(getProductSocialUgcByVariantCommand());
        },
      }),
      startListening({
        matcher: isAnyOf(swatchUpdatedEvent, swatchLoadingUpdatedEvent, swatchErrorUpdatedEvent),
        effect: (action, { dispatch }) => {
          const meta = action?.['meta'] as { requestStatus?: string };
          const payload = action?.['payload'];

          if (meta?.requestStatus === 'fulfilled' && payload) {
            dispatch(changeSwatches(payload as Swatch[]));
          }
          if (meta?.requestStatus === 'pending') {
            dispatch(changeSwatchLoading(true));
          }
          if (meta?.requestStatus === 'rejected') {
            dispatch(changeSwatches(undefined));
          }
        },
      }),
    ]) ||
      []),
  ];
  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
