import { getPageByUrl } from 'pages';
import {
  EVENT_VIEW_IMAGE_VIDEO,
  EVENT_CLICK_BUTTON,
  EVENT_SUBMIT_FORM,
  EVENT_UGC_LISTING_CLICK,
  EVENT_IMAGE_HOVER,
  EVENT_HOVER_LISTING_CLICK,
  EVENT_LINK_BANNER_CLICK,
  EVENT_PRODUCT_LISTING_CLICK,
  EVENT_VIEW_ALL_REVIEWS_CLICK,
  EVENT_ACCORDION_OPEN,
} from './constants';
import { getLastPageView } from './common';

// Trigger: view image or video:
export function viewImageOrVideo(action) {
  const { percentage, assetLink } = action.result;
  const pathname = window.location.pathname.replace(__BASE_ROUTE__, '');
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok', // static
    'eventDetails.action': 'image_video view', // static
    'eventDetails.position': `${percentage}% Completion`, // percentage of Completion , value is one of '25% Completion', '50% Completion', '75% Completion', '100% Completion', for image it will be '100% Completion' when the image appears in the browser's visible area
    'eventDetails.label': assetLink, // dynamic, image/video asset link file name
    'eventDetails.method': metaTitle, // dynamic, page title of the page the image/video is seen on
  };
}

// Trigger: button click
export function clickButton(action, preState, nextState) {
  const { buttonText, buttonLink } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok', // static
    'eventDetails.action': 'button_click', // static
    'eventDetails.label': buttonText, // dynamic, button text
    'eventDetails.position': buttonLink || 'NA', // dynamic, link URL of the button, if blank then populate 'NA'
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// track when user submit a form in storyblok page
export function submitForm(action, preState, nextState) {
  const { label, position } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Form', // static
    'eventDetails.action': 'Storyblok', // static
    'eventDetails.label': label || null, // dynamic, the customer email filled in (null if no email)
    'eventDetails.position': position || null, // dynamic, the customer phone email filled in (null if no number
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: UGC listing click
export function ugcListingClick(action, preState, nextState) {
  const { creatorHandle, link } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'ugc_link_click', // static
    'eventDetails.label': creatorHandle, // dynamic, creator handle text
    'eventDetails.position': link || 'NA', // dynamic, link URL
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: image hover
export function imageHover(action, preState, nextState) {
  const { assetLink } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'image_hover', // static
    'eventDetails.label': assetLink, // dynamic, image/video asset name (as Header is optional)
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: hover listing click
export function hoverListingClick(action, preState, nextState) {
  const { assetLink } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'hover_listing_click', // static
    'eventDetails.label': assetLink, // dynamic, image/video asset name (as Header is optional)
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: Link banner click
export function linkBannerClick(action, preState, nextState) {
  const { header } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'link_banner_click', // static
    'eventDetails.label': header, // dynamic, Header
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: Simple/Detailed Product Listing click
export function ProductListingClick(action, preState, nextState) {
  const { title, actionName } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': actionName, // static, 'detailed_product_listing_click' or 'simple_product_listing_click'
    'eventDetails.label': title, // dynamic, Product Title
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: View All Reviews click
export function ViewAllReviewsClick(action, preState, nextState) {
  const { header } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'reviews_click', // static
    'eventDetails.label': header, // dynamic, Header
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

// Trigger: Accordion opened/expanded
export function AccordionOpen(action, preState, nextState) {
  const { header } = action.result;
  const { pathname } = getLastPageView(nextState.tracking.historyViews) || {};
  const { metaTitle } = getPageByUrl(pathname) || {};

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'Storyblok',
    'eventDetails.action': 'accordion_open', // static
    'eventDetails.label': header, // dynamic, Header
    'eventDetails.method': metaTitle, // dynamic, page title of the page the button is on
  };
}

export default {
  [EVENT_VIEW_IMAGE_VIDEO]: viewImageOrVideo,
  [EVENT_CLICK_BUTTON]: clickButton,
  [EVENT_SUBMIT_FORM]: submitForm,
  [EVENT_UGC_LISTING_CLICK]: ugcListingClick,
  [EVENT_IMAGE_HOVER]: imageHover,
  [EVENT_HOVER_LISTING_CLICK]: hoverListingClick,
  [EVENT_LINK_BANNER_CLICK]: linkBannerClick,
  [EVENT_PRODUCT_LISTING_CLICK]: ProductListingClick,
  [EVENT_VIEW_ALL_REVIEWS_CLICK]: ViewAllReviewsClick,
  [EVENT_ACCORDION_OPEN]: AccordionOpen,
};
