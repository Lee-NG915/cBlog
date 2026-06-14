import { combineReducers } from 'redux';

import { trackingReducer } from 'utils/track';
import asyncLoad from './asyncLoad';
import productList from './productList';
import auth from './auth';
import products from './products';
import productOptions from './productOptions';
import cart from './cart';
import address from './address';
import subscription from './subscription';
import wishlist from './wishlist';
import swatches from './swatches';
import notice from './notice';
import order from './order';
import stores from './stores';
import variantList from './variantList';
import landingList from './landingList';
import fixBar from './fixBar';
import fixSideBar from './fixSideBar';
import messageVotes from './messageVotes';
import browser from './browser';
import reviewWidget from './reviewWidget';
import instalment from './instalment';
import marketing from './marketing';
import searchkitState from './searchkitState';
import scheduleDelivery from './scheduleDelivery';
import voucher from './voucher';
import blogs from './blogs';
import post from './post';
import geolocation from './geolocation';
import subscriptionBar from './subscriptionBar';
import dyApiData from './dyApiData';
import theLookWishlist from './theLookWishlist';
import variants from './variants';
import reviews from './reviews';
import sitemap from './sitemap';
import coupons from './coupons';
import couponsV2 from './couponsV2';
import events from './events';
import socialUgcs from './socialUgcs';
import o2o from './showroomExclusives';
import iss from './interiorStylingService';
import storyblokPage from './storyblokPage';
import storyblokProductListing from './storyblokProductListing';
import header from './header';
import addOnServices from './addOnServices';
import globalReview from './globalReview';
import storyblokBlogPage from './storyblokBlogPage';
import yotpo from './yotpo';
import filterOrder from './filterOrder';

export default combineReducers({
  asyncLoad,
  productList,
  auth,
  products,
  productOptions,
  variants,
  dyApiData,
  theLookWishlist,
  cart,
  address,
  subscription,
  wishlist,
  swatches,
  notice,
  order,
  stores,
  variantList,
  landingList,
  fixBar,
  fixSideBar,
  messageVotes,
  browser,
  o2o,
  iss,
  reviewWidget,
  instalment,
  marketing,
  searchkitState,
  scheduleDelivery,
  voucher,
  blogs,
  post,
  geolocation,
  subscriptionBar,
  reviews,
  tracking: trackingReducer,
  sitemap,
  coupons,
  couponsV2,
  events,
  socialUgcs,
  storyblokPage,
  storyblokProductListing,
  header,
  addOnServices,
  globalReview,
  storyblokBlogPage,
  yotpo,
  filterOrder,
});
