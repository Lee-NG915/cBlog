import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@castlery/shared-redux-store';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack, getEventRandomId } from '../utils';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { EcEnv } from '@castlery/config';
import { findBrand, getBreadcrumbNames, getOriginalAmount, TRACKING_MSGS_MAP } from '../helpers';
import { trackPinterestPageVisitEvent } from './pinterest-capi-events.trigger';
import { trackFacebookViewContentEvent } from './fb-capi-events.trigger';
import { trackKlaviyoViewedProductEvent } from './klaviyo-events.trigger';
import { logger } from '@castlery/observability/client';

/**
 * @description
 * @note GA event : productDetail
 * @scenario 1. This event is triggered when a user accesses a product page.
 */
export const trackViewItemEvent = createAsyncThunk(
  'tracking/trackViewItemEvent',
  async (_, { dispatch, getState, fulfillWithValue }) => {
    const state = getState() as RootState;
    const product = selectProduct(state);
    const variant = selectVariant(state);

    if (!product || !variant) {
      // tracking event 不可阻塞主流程，所以不抛出错误，遇到错误时跳过tracking
      return fulfillWithValue({ data: 'error' });
    }

    try {
      // 应该使用EVENTS_NAMES_MAP.FB_CAPI_VIEW_CONTENT来生成eventId，但是这里为了兼容OP的旧代码，所以使用'viewContent'
      const eventId = getEventRandomId('viewContent'); //'viewContent'
      const currency = EcEnv.NEXT_PUBLIC_CURRENCY;
      const originalPrice = getOriginalAmount(variant.price);

      // 1. trigger facebook view content event
      await dispatch(trackFacebookViewContentEvent({ eventId, variant, originalPrice }));

      // 2. trigger pinterest page visit event
      await dispatch(trackPinterestPageVisitEvent({ eventId, variant, originalPrice }));

      // 3. trigger ga product detail event
      const brand = findBrand(product.taxons);
      const [pageName, subPageName] = getBreadcrumbNames(product.taxons);
      const originalDiscountAmount = getOriginalAmount(Number(variant.list_price) - Number(variant.price));
      const isSale = +originalDiscountAmount > 0;

      const gaParams = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_PRODUCT_DETAIL,
        eventId,
        ecommerce: {
          currency: currency,
          detail: {
            products: [
              {
                id: variant?.sku,
                name: variant?.name,
                price: originalPrice,
                category: subPageName,
                brand,
                tag: 'product_tag',
                tag_value: variant?.badges?.join(', '),
                dimension1: pageName,
                dimension2: '',
                dimension3: isSale ? 'sale' : 'full',
                dimension4: '',
                metric1: isSale ? originalDiscountAmount : '',
              },
            ],
          },
        },
      };
      gaTrack(gaParams);
      // 5. trigger klaviyo viewed product event
      await dispatch(trackKlaviyoViewedProductEvent());
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackViewItemEvent failed', {
        error,
        productId: product?.id,
        variantId: variant?.id,
      });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP image impression)
 * @scenario 1. Triggered when a user clicks the  product thumbnail image in the product gallery on PDP page
 */
export const trackPDPImageImpressionEvent = createAsyncThunk(
  'tracking/trackPDPImageImpressionEvent',
  async (
    payload: {
      assetPosition: number /**  image position (eg first image is 1, 2nd image is 2) */;
      assetType: string /** base, lifestyle,video, short-video, master_video */;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_image',
        'eventDetails.action': payload.assetPosition,
        'eventDetails.label': payload.assetType,
        'eventDetails.sku_id': variant?.sku,
        'eventDetails.sku_name': variant?.name,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPImageImpressionEvent failed', { error, variantId: variant?.id });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP Details)
 * @note TODO: add DY report
 * @scenario 1. Triggered when a customer lands on a Product Detail Page which is out of stock (no matter whether customer sees the out of stock message or not), record this page view
 * @scenario 2. Triggered when a customer clicks the 'Details' accordion on the PDP page => action is 'details', label is 'expand' or 'close'
 * @scenario 3. Triggered when a customer clicks the 'Dimensions' accordion on the PDP page => action is 'dimensions', label is 'expand' or 'close'
 * @scenario 4. Triggered when a customer clicks the 'Delivery and Warranty' accordion on the PDP page => action is 'delivery', label is 'expand' or 'close'
 */
export const trackProductDetailsEvent = createAsyncThunk(
  'tracking/trackProductDetailsEvent',
  async (
    payload: {
      action: string;
      label?: string;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_details',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackProductDetailsEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP FAQ)
 * @scenario 1. Triggered when a customer interacts with FAQ section on PDP page.
 */
export const trackPDPFAQEvent = createAsyncThunk(
  'tracking/trackPDPFAQEvent',
  async (
    payload: {
      action: string;
      label?: string;
      tag?: string;
      tagValue?: string;
      category?: string;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': payload.category,
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
        ...(payload.tag && { 'eventDetails.tag': payload.tag }),
        ...(payload.tagValue && { 'eventDetails.tag_value': payload.tagValue }),
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPFAQEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (Recommendations)
 * @scenario 1. Triggered when a customer interacts with recommendations section on PDP page.
 */
export const trackRecommendationsEvent = createAsyncThunk(
  'tracking/trackRecommendationsEvent',
  async (
    payload: {
      action: string;
      label?: string;
      tag?: string;
      tagValue?: string;
      category?: string;
      pageComponent?: string;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    // if (!variant) {
    //   return fulfillWithValue({ data: 'error' });
    // }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': payload.category,
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.page_component': payload.pageComponent,
        'eventDetails.sku_id': variant?.sku,
        'eventDetails.sku_name': variant?.name,
        ...(payload.tag && { 'eventDetails.tag': payload.tag }),
        ...(payload.tagValue && { 'eventDetails.tag_value': payload.tagValue }),
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackRecommendationsEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP configuration)
 * @scenario 1. Triggered when a user selects a option in the 'Model' section => action is 'model', label is the name of the option selected.
 * @scenario 2. Triggered when a user selects a option in the 'Material' section => action is 'material', label is the name of the option selected.
 */
export const trackPDPConfigurationEvent = createAsyncThunk(
  'tracking/trackPDPConfigurationEvent',
  async (
    payload: {
      action: string /** based on section that the user selected. eg 'material', 'leg', 'length', 'model', 'size', 'cover' */;
      label: string /** name of option selected. eg 'Pearl Beige' if user selects 'Pearl Beige' material */;
      spuName?: string /** product.name */;
      spuId?: string | number /** product.id */;
      skuId?: string /** variant.sku */;
      skuName?: string /** variant.name */;
    },
    { fulfillWithValue }
  ) => {
    if (!payload.skuId || !payload.skuName) {
      logger.warn('trackPDPConfigurationEvent called with missing SKU info', { payload });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_config',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label,
        'eventDetails.sku_id': payload.skuId,
        'eventDetails.sku_name': payload.skuName,
        'eventDetails.spu_id': payload.spuId,
        'eventDetails.spu_name': payload.spuName,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPConfigurationEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP Selector)
 * @scenario 1. Triggered when a user selects a option in the 'Tab' section => action is 'click', label is the name of the tab selected.
 * @scenario 2. Triggered when a user selects a option in the configuration section => action is 'click', label is the name of the tab selected.
 * @scenario 3. Triggered when a user click the build your own button in the selector section => action is 'click', tag is the buildyourown.
 */
export const trackPDPSelectorEvent = createAsyncThunk(
  'tracking/trackPDPSelectorEvent',
  async (
    payload: {
      action: string;
      label: string;
      tag: string;
      tagValue: string;
    },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'configuration',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label,
        'eventDetails.tag': payload.tag,
        'eventDetails.tag_value': payload.tagValue,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPSelectorEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP Hullabala Banner)
 * @scenario 1. Triggered when a user clicks the hullabala banner in the PDP page => action is 'click', action is click.
 * @scenario 2. Triggered when the hullabala banner first appears in the window view when the user scrolls the page. => action is 'impression', action is impression.
 */
export const trackPDPHullabalaBannerEvent = createAsyncThunk(
  'tracking/trackPDPHullabalaBannerEvent',
  async (
    payload: {
      action: string;
      tag: string;
      tagValue: string;
    },
    { fulfillWithValue }
  ) => {
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_hulla_banner',
        'eventDetails.action': payload.action,
        'eventDetails.tag': payload.tag,
        'eventDetails.tag_value': payload.tagValue,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPHullabalaBannerEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (Long LT)
 * @scenario 1. Triggered when user adds to cart for long lead time product and the long lead time popup is displayed => action is 'popup_display'
 * @scenario 2. Triggered when the user subscribes to the long lead time => action is 'subscribe'
 * @scenario 3. Triggered when the user closes the long lead time popup (add to cart scenario) => action is 'popup_close'
 * @scenario 4. Triggered when the user clicks the 'keep me updated' link in the shipping section on PDP page => action is 'pdp_text_click'
 * @scenario 5. Triggered when the 'keep me updated' text in the shipping section on PDP page is first into view => action is 'pdp_text_impression'
 */
export const trackLongLTEvent = createAsyncThunk(
  'tracking/trackLongLTEvent',
  async (
    payload: {
      action: string /** action: 'popup_display', 'subscribe','popup_close', 'pdp_text_impression','pdp_text_click' */;
      sku: string;
      skuName: string;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const customer = selectedCurrentCustomer(state);
    if (!payload.sku || !payload.skuName) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'long_leadtime',
        'eventDetails.action': payload.action,
        'eventDetails.label': `${payload.sku} | ${payload.skuName}`,
        ...(payload.action === 'subscribe' && {
          'eventDetails.method': customer?.email ?? '',
        }),
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackLongLTEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (mulburry_warranty)
 */
export const trackMulberryWarrantyEvent = createAsyncThunk(
  'tracking/trackMulberryWarrantyEvent',
  async (
    payload: {
      action: string /** action: 'select_extended_warranty','add_extended_warranty','remove_extended_warranty','extended_warranty_faq','not_interested_popup','open_popup' */;
      label?: string /** label: ‘2 Years’, ‘3 Years’, ‘5 Years’ */;
      sku: string /** sku.id */;
      skuName: string /** sku.name */;
      position?: string /** ‘pdp’ if selected on PDP page, ‘popup’ if selected on popup */;
      price?: number | string /** price of warranty */;
    },
    { fulfillWithValue }
  ) => {
    if (!payload.sku || !payload.skuName) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'mulberry_warranty',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.sku_id': payload.sku,
        'eventDetails.sku_name': payload.skuName,
        'eventDetails.position': payload.position ?? '',
        'eventDetails.price': payload.price ?? '',
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackMulberryWarrantyEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

export { trackGuardsmanWarrantyEvent } from './guardsman-warranty-events.trigger';

/**
 * @description
 * @note GA event : trackEvent (pdp_image_5s)
 */
export const trackPDPImage5sEvent = createAsyncThunk(
  'tracking/trackPDPImage5sEvent',
  async (
    payload: {
      assetPosition:
        | number
        | string /** image position (eg first image is 1, 2nd image is 2, dimension image is 'thumbnail button' or 'product dimension') */;
      assetType: string /** base, lifestyle,video, short-video, dimension */;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_image_5s',
        'eventDetails.action': payload.assetPosition,
        'eventDetails.label': payload.assetType,
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPImage5sEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (PDP Review Section)
 * @scenario 1. Triggered when a customer clicks on a review image in the review item =>action is 'view_review_image'
 * @scenario 2. Triggered when a customer clicks on a similar product link in the review item => action is 'click_review_link'
 * @scenario 3. Triggered when a customer selects a option in the 'Sort Dropdown' => action is 'review_dropdown', label is the review dropdown options, such as 'Recommended', 'Most Recent', 'Rating - High to Low', 'Rating - Low to High', 'With Pictures', 'View Product Itself'
 * @scenario 4. Triggered when a customer change the page number of Reviews Pagination => action is 'select_review_page', label is <page number>. (e.g., clicked on page number 2, show '2')
 */
export const trackPDPReviewSectionEvent = createAsyncThunk(
  'tracking/trackPDPReviewSectionEvent',
  async (
    payload: {
      action: string /** action: 'view_review_image', 'click_review_link', 'review_dropdown', 'select_review_page' */;
      label?: string /** label: <review dropdown option> or <page number> */;
      tag?: string;
      tagValue?: string;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'pdp_review_section',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
        ...(payload.tag && { 'eventDetails.tag': payload.tag }),
        ...(payload.tagValue && { 'eventDetails.tag_value': payload.tagValue }),
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackPDPReviewSectionEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (how_it_sits)
 * @scenario 1. Triggered when the how it sits module first appears in viewport
 * @scenario 2. Triggered when customer clicks a size tab
 * @scenario 3. Triggered when module stays >=70% in viewport (watch duration)
 * @scenario 4. Triggered when video reaches progress milestones (25/50/75/100)
 */
export const trackHowItSitsEvent = createAsyncThunk(
  'tracking/trackHowItSitsEvent',
  async (
    payload: {
      category: 'how_it_sits_impression' | 'how_it_sits_click' | 'how_it_sits_video_view';
      action: 'impression' | 'click' | 'video_view';
      label?: string;
      tag?: string;
      tagValue?: string | number;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params: Record<string, string | number> = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.page_type': 'product',
        'eventDetails.category': payload.category,
        'eventDetails.action': payload.action,
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
      };

      if (payload.label) {
        params['eventDetails.label'] = payload.label;
      }
      if (payload.tag) {
        params['eventDetails.tag'] = payload.tag;
      }
      if (payload.tagValue !== undefined) {
        params['eventDetails.tag_value'] = payload.tagValue;
      }

      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackHowItSitsEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);

/**
 * @description
 * @note GA event : trackEvent (social_widget)
 * @scenario 1. Triggered when the social widget first appears in the window view when the user scrolls the page. => action is 'widget_impression'
 * @scenario 2. Triggered when the customer clicks the previous/next button to switch content => action is  'arrow_click'
 * @scenario 3. Triggered when social items appear (first in view or after clicks) in the view => action is 'image_impression', label is the sort number of the social item list in the slider
 * @scenario 4. Triggered when the customer clicks on a social item => action is 'image_click' or 'video_click', label is the sort number of the social item list in the slider
 * @scenario 5. Triggered when the customer clicks on a product link within an social item popup in the PDP social widget => action is 'product_link_click', label is the sort number of the social item list in the slider
 */
export const trackSocialWidgetEvent = createAsyncThunk(
  'tracking/trackSocialWidgetEvent',
  async (
    payload: {
      action: string /** action: 'widget_impression', 'image_impression', 'image_click', 'image_popup_click', 'arrow_click' */;
      label?: string | number;
      position?: string | number /** 'pdp' if selected on PDP page, ‘popup’ if selected on popup */;
      postId?: string /** storyblok _uid */;
    },
    { getState, fulfillWithValue }
  ) => {
    const state = getState() as RootState;
    const variant = selectVariant(state);
    if (!variant) {
      return fulfillWithValue({ data: 'error' });
    }
    try {
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
        'eventDetails.category': 'social_widget',
        'eventDetails.action': payload.action,
        'eventDetails.label': payload.label ?? '',
        'eventDetails.sku_id': variant.sku,
        'eventDetails.sku_name': variant.name,
        'eventDetails.position': payload.position ?? '',
      };
      gaTrack(params);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logger.error('trackSocialWidgetEvent failed', { error });
      return fulfillWithValue({ data: 'error' });
    }
  }
);
