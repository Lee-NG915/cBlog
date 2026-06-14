import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { needLoad as needAuthLoad, load as loadAuth } from 'redux/modules/auth';
import { loadIfNeeded as loadCart, get as getOrder, approveZip } from 'redux/modules/cart';
import loadable from '@loadable/component';

import { retryOperation } from 'utils/retry';
import { isOutdated, getTimestamp } from 'utils/time';
import * as Cookie from 'helpers/Cookie';
import { designers, enableO2O } from 'config';
import { gtmPageNames } from 'utils/track/config';
import Product from 'containers/Product';
import Pla from 'containers/Pla';
import O2O from './containers/O2O';
// import InteriorStylingService from './containers/InteriorStylingService';
import { getSalePages, getUrl, validateUrl, getPageByKey, getStoryblokPages, getStoryblokBlogPages } from './pages';
import App from './containers/App';
// dynamic loaded components
const ShopTheLook = loadable(() =>
  import(/* webpackChunkName: "shop-the-look" */ './containers/ShopTheLook').then((c) => {
    ShopTheLook.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const DynamicHome = loadable(() =>
  import(/* webpackChunkName: "homepage" */ './containers/Home').then((c) => {
    DynamicHome.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Wishlist = loadable(() =>
  import(/* webpackChunkName: "wishlist" */ './containers/Wishlist').then((c) => {
    Wishlist.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Cart = loadable(() =>
  import(/* webpackChunkName: "cart" */ './containers/Cart').then((c) => {
    Cart.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Welcome = loadable(() => import(/* webpackChunkName: "welcome" */ './containers/Welcome'));
// const Product = loadable(() =>
//   import(/* webpackPrefetch: true, webpackChunkName: "product" */ `./containers/Product`).then((c) => {
//     Product.asyncLoad = c.default.asyncLoad;
//     return c;
//   })
// );

// const Pla = loadable(() =>
//   import(/* webpackPrefetch: true, webpackChunkName: "product" */ './containers/Pla').then((c) => {
//     Pla.asyncLoad = c.default.asyncLoad;
//     return c;
//   })
// );
const Category = loadable(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "category" */ './containers/Category').then((c) => {
    Category.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const CategoryRetired = loadable(() =>
  import(/* webpackChunkName: "category-retired" */ './containers/Category/CategoryRetired')
);
const Account = loadable(() =>
  import(/* webpackChunkName: "account" */ './containers/Account').then((c) => {
    Account.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const CheckoutAccount = loadable(() => import(/* webpackChunkName: "checkout" */ './containers/Checkout/Account'));
const Checkout2c2p = loadable(() => import(/* webpackChunkName: "checkout" */ './containers/Checkout/Confirm2c2p'));
const CheckoutGrab = loadable(() => import(/* webpackChunkName: "checkout" */ './containers/Checkout/ConfirmGrabPay'));
const CheckoutSuccess = loadable(() => import(/* webpackChunkName: "checkout" */ './containers/Checkout/Success'));
const CheckoutEmpty = loadable(() => import(/* webpackChunkName: "checkout" */ './containers/Checkout/Empty'));
const CheckoutMain = loadable(() =>
  import(/* webpackChunkName: "checkout" */ './containers/Checkout/Main').then((c) => {
    CheckoutMain.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Blogs = loadable(() =>
  import(/* webpackChunkName: "blogs" */ './containers/Blogs/Blogs').then((c) => {
    Blogs.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Post = loadable(() =>
  import(/* webpackChunkName: "blogs" */ './containers/Blogs/Post').then((c) => {
    Post.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const AppLanding = loadable(() => import(/* webpackChunkName: "app-landing" */ './containers/AppLanding'));
const StayHomeWithCastlery = loadable(() =>
  import(/* webpackChunkName: "stay-home" */ './containers/StayHomeWithCastlery')
);
const ScheduleDelivery = loadable(() =>
  import(/* webpackChunkName: "schedule-delivery" */ './containers/ScheduleDelivery')
);
const DeliveryReview = loadable(() => import(/* webpackChunkName: "delivery-review" */ './containers/DeliveryReview'));

// const OurStory = loadable(() => import(/* webpackChunkName: "our-story" */ './containers/QuickLinks/OurStory'));

const TermsAndConditions = loadable(() =>
  import(/* webpackChunkName: "terms-and-conditions" */ './containers/TermsAndConditions').then((c) => {
    TermsAndConditions.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const Press = loadable(() =>
  import(/* webpackChunkName: "press" */ './containers/QuickLinks/Press').then((c) => {
    if (c.default.asyncLoad) {
      Press.asyncLoad = c.default.asyncLoad;
    }
    return c;
  })
);
const StyleContest = loadable(() =>
  import(/* webpackChunkName: "style-contest" */ './containers/QuickLinks/StyleContest')
);
const Studio = loadable(() =>
  import(/* webpackChunkName: "studio" */ './containers/QuickLinks/Studio').then((c) => {
    Studio.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const VirtualStudio = loadable(() => import(/* webpackChunkName: "virtual-studio" */ './containers/VirtualStudio'));
const ContactUs = loadable(() =>
  import(/* webpackChunkName: "contact-us" */ './containers/QuickLinks/ContactUs').then((c) => {
    ContactUs.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const Manufacturer = loadable(() =>
  import(/* webpackChunkName: "manufacturer" */ './containers/QuickLinks/Manufacturer')
);
const HelpCenter = loadable(() =>
  import(/* webpackChunkName: "help-center" */ './containers/QuickLinks/HelpCenter').then((c) => {
    HelpCenter.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const CareCover = loadable(() => import(/* webpackChunkName: "care-cover" */ './containers/QuickLinks/CareCover'));
const Swatches = loadable(() => import(/* webpackChunkName: "swatches" */ './containers/QuickLinks/Swatches'));
const Zip = loadable(() => import(/* webpackChunkName: "zip" */ './containers/QuickLinks/Zip'));
const TradeProgram = loadable(() =>
  import(/* webpackChunkName: "trade-program" */ './containers/QuickLinks/TradeProgram').then((c) => {
    TradeProgram.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const AffiliateProgram = loadable(() =>
  import(/* webpackChunkName: "designer" */ './containers/QuickLinks/AffiliateProgram')
);

const Feat = loadable(() => import(/* webpackChunkName: "feat" */ './containers/Campaigns/Feat'));
const Interior = loadable(() => import(/* webpackChunkName: "interior" */ './containers/Campaigns/Interior'));

const Designer = loadable(() => import(/* webpackChunkName: "designer" */ './containers/Campaigns/Designer'));
const DesignerCommunity = loadable(() =>
  import(/* webpackChunkName: "designer-community" */ './containers/Campaigns/DesignerCommunity')
);
// const Anniversary = loadable( () => import(/* webpackChunkName: "anniversary" */ './containers/Campaigns/Anniversary'));
// const WarehouseSale = loadable( () => import(/* webpackChunkName: "warehouse-sale" */ './containers/Campaigns/WarehouseSale'));
// const WarehouseSaleTutorial = loadable( () =>
//     import(/* webpackChunkName: "warehouse-sale-tutorial" */ './containers/Campaigns/WarehouseSaleTutorial'));
// const RSVP = loadable( () => import(/* webpackChunkName: "rsvp" */ './containers/Campaigns/RSVP'));
// const Christmas = loadable(() => import(/* webpackChunkName: "christmas" */ './containers/Campaigns/Christmas'));
// const NewYear = loadable( () => import(/* webpackChunkName: "new-year" */ './containers/Campaigns/NewYear'));
// const LunarNewYear = loadable( () => import(/* webpackChunkName: "lunar-new-year" */ './containers/Campaigns/LunarNewYear'));

const LunarNewYearEvent = loadable(() =>
  import(/* webpackChunkName: "lunar-new-year-event" */ './containers/Campaigns/RSVP').then((c) => {
    LunarNewYearEvent.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const MidYearSale = loadable(() =>
  import(/* webpackChunkName: "mid-year-sale" */ './containers/Campaigns/MidYearSale')
);
const NewWayOfLiving = loadable(() =>
  import(/* webpackChunkName: "new-way-of-living" */ './containers/Campaigns/NewWayOfLiving')
);
const FurnitureSEO = loadable(() =>
  import(/* webpackChunkName: "furniture-seo" */ './containers/Campaigns/FurnitureSEO')
);
const HomeOwners = loadable(() =>
  import(/* webpackChunkName: "home-owners" */ './containers/Campaigns/HomeOwners').then((c) => {
    HomeOwners.asyncLoad = c.default.asyncLoad;
    return c;
  })
);
const CelebrateHome = loadable(() =>
  import(/* webpackChunkName: "celebrate-home" */ './containers/Campaigns/CelebrateHome').then((c) => {
    CelebrateHome.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const S2CampaignPage = loadable(() =>
  import(/* webpackChunkName: "s2-campaign" */ './containers/Campaigns/S2Campaign').then((c) => {
    S2CampaignPage.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const RoomDesignerPage = loadable(() =>
  import(/* webpackChunkName: "room-designer" */ './containers/RoomCreator').then((c) => {
    RoomDesignerPage.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const DesignFurniturePage = loadable(() =>
  import(/* webpackChunkName: "design-your-furniture" */ './containers/DesignFurniture').then((c) => {
    DesignFurniturePage.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const ResetPassword = loadable(() => import(/* webpackChunkName: "reset-password" */ './containers/ResetPassword'));
const Appointment = loadable(() => import(/* webpackChunkName: "appointment" */ './containers/Appointment'));
const Unsubscribe = loadable(() => import(/* webpackChunkName: "unsubscribe" */ './containers/Unsubscribe'));
const BookAppointment = loadable(() =>
  import(/* webpackChunkName: "book-appointment" */ './containers/BookAppointment')
);
const Review = loadable(() =>
  import(/* webpackChunkName: "review" */ './containers/Review').then((c) => {
    Review.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const ReviewSubmission = loadable(() =>
  import(/* webpackChunkName: "review-submission" */ './containers/ReviewSubmission')
);

const Referral = loadable(() => import(/* webpackChunkName: "referral" */ './containers/Referral'));

// Yotpo
const Rewards = loadable(() =>
  import(/* webpackChunkName: "homepage" */ './containers/Rewards').then((c) => {
    Rewards.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const Sitemap = loadable(() =>
  import(/* webpackChunkName: "sitemap" */ './containers/Sitemap').then((c) => {
    Sitemap.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const Storyblok = loadable(() =>
  import(/* webpackChunkName: "storyblok" */ './containers/Storyblok').then((c) => {
    Storyblok.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const StoryblokBlog = loadable(() =>
  import(/* webpackChunkName: "storyblokBlog" */ './containers/StoryblokBlog').then((c) => {
    StoryblokBlog.asyncLoad = c.default.asyncLoad;
    return c;
  })
);

const NotFound = loadable(() => import(/* webpackChunkName: "not-found" */ './containers/NotFound'));

const routes = (store) => {
  function requireLogin(redirectUrl = '/') {
    return (nextState, replace, cb) => {
      function checkAuth() {
        const {
          auth: { user },
        } = store.getState();
        if (!user) {
          // oops, not logged in, so can't be here!
          replace({
            pathname: redirectUrl,
            state: {
              nextPathname: nextState.location.pathname,
              nextSearch: nextState.location.search,
            },
          });
        }
        cb();
      }

      if (needAuthLoad(store.getState())) {
        store
          .dispatch(loadAuth())
          .then(() => {
            cb();
          })
          .catch(() => {
            replace({
              pathname: redirectUrl,
              state: {
                nextPathname: nextState.location.pathname,
                nextSearch: nextState.location.search,
              },
            });
            cb();
          });
      } else {
        checkAuth();
      }
    };
  }

  function noLogin(redirectUrl = '/') {
    return (nextState, replace, cb) => {
      if (needAuthLoad(store.getState())) {
        store
          .dispatch(loadAuth())
          .then(() => {
            replace({
              pathname: redirectUrl,
              state: {
                nextPathname: nextState.location.pathname,
                nextSearch: nextState.location.search,
              },
            });
            cb();
          })
          .catch(() => {
            cb();
          });
      } else {
        const {
          auth: { user },
        } = store.getState();
        if (user) {
          // oops, not logged in, so can't be here!
          replace({
            pathname: redirectUrl,
            state: {
              nextPathname: nextState.location.pathname,
              nextSearch: nextState.location.search,
            },
          });
        }
        cb();
      }
    };
  }

  // only need to check whether order is available or not
  const requireCartNotEmpty = (nextState, replace, cb) => {
    const { serviceOrder } = nextState.location.query;
    if (serviceOrder) {
      store
        .dispatch(getOrder(serviceOrder))
        .then(() => {
          const { cart } = store.getState();
          if (!(cart.data && cart.data.addon_service_line_items.length > 0)) {
            replace(getUrl('checkout-empty'));
          } else {
            Cookie.set('service_order_id', cart.data.number);
          }

          cb();
        })
        .catch(() => {});
    } else {
      store
        .dispatch(loadCart())
        .catch(() => {})
        .then(() => {
          const { cart } = store.getState();
          if (!(cart.data && cart.data.line_items.length > 0)) {
            replace(getUrl('checkout-empty'));
          }
          cb();
        });
    }
  };

  const checkResetSecret = (nextState, replace, cb) => {
    const { location } = nextState;
    const { from_email: fromEmail, expire, email } = location?.query || {};
    const isFromPosEmail = enableO2O && fromEmail === 'true' && expire;

    if (isFromPosEmail) {
      const isValid = getTimestamp() < expire;
      if (!isValid) {
        replace({
          pathname: getUrl('forgot-password'),
          query: {
            from_email: fromEmail,
            email,
          },
        });
      }
    }
    cb();
  };

  const checkOrderStatus = (nextState, replace, cb) => {
    const order = store.getState().cart.data;
    const { location } = nextState;
    if (order.line_items.some((item) => item.is_price_outdated || item.is_region_outdated)) {
      replace(getUrl('cart'));
    } else if (order.state === 'cart') {
      replace(getUrl('checkout-account'));
    } else {
      const states = ['address', 'delivery', 'payment', 'confirm'];
      const urls = [
        getUrl('checkout-shipping-address'),
        getUrl('checkout-shipping-method'),
        getUrl('checkout-payment'),
      ];

      const targetStateIndex = urls.indexOf(location.pathname);
      const realStateIndex = states.indexOf(order.state);

      if (realStateIndex < targetStateIndex) {
        replace(urls[realStateIndex]);
      }
    }
    cb();
  };

  // only order with 'complete' status can visit
  const requireCompleteOrder = (nextState, replace, cb) => {
    const order = store.getState().cart.data;
    const { location } = nextState;

    if (location.query && location.query.result && location.query.checkoutId) {
      if (__SERVER__) {
        if (location.query.result === 'approved') {
          store
            .dispatch(approveZip({ checkout_id: location.query.checkoutId }))
            .then((order) => {
              replace({
                pathname: getUrl('checkout-success'),
                query: {
                  orderNumber: order.number,
                  paymentMethod: 'zip',
                },
              });
              cb();
            })
            .catch(() => {
              replace({
                pathname: getUrl('checkout-payment'),
                query: {
                  error: location.query?.error || 'true',
                },
              });
              cb();
            });
        } else {
          replace({
            pathname: getUrl('checkout-payment'),
            query: {
              error: location.query?.error || 'true',
            },
          });
          cb();
        }
      } else {
        cb();
      }
    } else if (location.query && location.query.orderNumber) {
      // for third party payment redirect page
      const temporaryToken = location.query.temporaryToken;
      const operation = () => store.dispatch(getOrder(location.query.orderNumber, temporaryToken));
      const breakPoint = () => {
        const { cart } = store.getState();
        return cart.data && cart.data.state === 'complete';
      };
      retryOperation(operation, breakPoint, 500, 5)
        .then(() => {
          cb();
        })
        .catch(() => {
          replace({
            pathname: getUrl('checkout-payment'),
            query: {
              error: location.query?.error || 'true',
            },
          });
          cb();
        });
    } else if (location.query && location.query.state) {
      // GrabPay redirect page: approve payment in the page.
      cb();
    } else if (location.query && location.query.error) {
      // display error
      cb();
    } else {
      // TODO: enable when as-is is live
      // if (order && order.state !== 'complete') {
      //   if (__COUNTRY__ !== 'SG') {
      //     replace(getUrl('home'));
      //   }
      // }
      if (!order || order.state !== 'complete') {
        replace(getUrl('home'));
      }
      cb();
    }
  };

  /*
  Validate the url for category page and set the header status to 404
  */
  const validatePath = (nextState, replace, cb) => {
    const url = nextState.location.pathname;
    if (!validateUrl(url)) {
      nextState.routes[nextState.routes.length - 1].status = 404;
    }
    cb();
  };

  // designer validate
  const validateDesigner = (nextState, replace, cb) => {
    const designerKey = nextState.params.designer;
    if (!designers.find((designer) => designer.key === designerKey && !designer.disabled)) {
      nextState.routes[nextState.routes.length - 1].status = 404;
    }
    cb();
  };

  const generateGetComponent = (component) => () => component.load().then(() => component);
  // form dynamic route
  const generateDynamicRoute = (path, component, key, props) => {
    let name;
    if (component === Category) {
      name = 'category';
    } else if (component === Product || component === Pla) {
      name = 'product';
    } else if (component === Cart) {
      name = 'cart';
    } else {
      name = 'other';
    }

    if (props?.pageType) {
      name = props?.pageType;
    }

    const propsCopy = { ...props };
    if (!propsCopy.pageName) {
      propsCopy.pageName = gtmPageNames.corporatePage;
    }
    if (component.load) {
      return <Route key={key} path={path} name={name} {...propsCopy} getComponent={generateGetComponent(component)} />;
    }

    return <Route key={key} path={path} name={name} {...propsCopy} component={component} />;
  };

  const teaserRoute = generateDynamicRoute(getUrl('ca/general-content/other-pages/ca-teaser'), Storyblok, {
    pageName: gtmPageNames.homePage,
  });

  /**
   * Please keep routes in alphabetical order
   * ---> USE DIFFERENT PARAMETER NAMES to prevent conflict in async connect and stack <---
   */
  return (
    <Route path={getUrl('home')} component={App}>
      {/* Home (main) route */}
      {/* <IndexRoute name="homepage" pageName={gtmPageNames.campaignPage}>
        {generateDynamicRoute('/', Storyblok, 'ca/general-content/other-pages/ca-teaser', { pageName: gtmPageNames.campaignPage })}
      </IndexRoute> */}
      {/* <IndexRoute name="homepage" getComponent={teaserRoute} pageName={gtmPageNames.homePage} /> */}
      <IndexRoute name="homepage" getComponent={generateGetComponent(DynamicHome)} pageName={gtmPageNames.homePage} />

      {/* Routes requiring login */}
      <Route onEnter={requireLogin(getUrl('login'))}>
        <IndexRoute name="homepage" pageName={gtmPageNames.campaignPage}>
          {generateDynamicRoute(
            getUrl('ca/general-content/other-pages/ca-teaser'),
            Storyblok,
            'ca/general-content/other-pages/ca-teaser',
            { pageName: gtmPageNames.campaignPage }
          )}
        </IndexRoute>
        {generateDynamicRoute(getUrl('profile', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('orders', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('vouchers', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {__YOTPO_ENABLED__ &&
          generateDynamicRoute(getUrl('account-rewards', true), Account, null, {
            pageName: gtmPageNames.accountPage,
          })}
        {generateDynamicRoute(getUrl('address', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('order-details', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('my-reviews', true), Account, null, {
          pageName: gtmPageNames.accountPage,
        })}
      </Route>
      {generateDynamicRoute(getUrl('submit-review', true), ReviewSubmission, null, {
        pageName: gtmPageNames.reviewsPage,
      })}

      {/* Routes only accessible without login */}
      <Route onEnter={noLogin(getUrl('home'))}>
        {generateDynamicRoute(getUrl('login', true), Welcome, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('signup', true), Welcome, null, {
          pageName: gtmPageNames.accountPage,
        })}
        {generateDynamicRoute(getUrl('forgot-password', true), Welcome, null, {
          pageName: gtmPageNames.accountPage,
        })}
      </Route>

      {/* Checkout Components */}
      {generateDynamicRoute(getUrl('cart', true), Cart, null, {
        pageName: gtmPageNames.cartPage,
      })}
      <Route onEnter={requireCartNotEmpty}>
        {generateDynamicRoute(getUrl('checkout-account', true), CheckoutAccount, null, {
          pageName: gtmPageNames.checkoutPage,
        })}
        <Route onEnter={checkOrderStatus}>
          {generateDynamicRoute(getUrl('checkout-shipping-address', true), CheckoutMain, null, {
            pageName: gtmPageNames.checkoutPage,
          })}
          {generateDynamicRoute(getUrl('checkout-shipping-method', true), CheckoutMain, null, {
            pageName: gtmPageNames.checkoutPage,
          })}
          {generateDynamicRoute(getUrl('checkout-payment', true), CheckoutMain, null, {
            pageName: gtmPageNames.checkoutPage,
          })}
        </Route>
      </Route>

      <Route onEnter={requireCompleteOrder}>
        {generateDynamicRoute(getUrl('checkout-2c2p', true), Checkout2c2p, null, {
          pageName: gtmPageNames.checkoutPage,
        })}
        {generateDynamicRoute(getUrl('checkout-grabpay', true), CheckoutGrab, null, {
          pageName: gtmPageNames.checkoutPage,
        })}
        {generateDynamicRoute(getUrl('checkout-success', true), CheckoutSuccess, null, {
          pageName: gtmPageNames.checkoutPage,
        })}
      </Route>

      <Route
        onEnter={(nextState, replace) => {
          replace({
            pathname: getUrl('stl-living-room'),
            state: { status: 301 },
          });
        }}
      >
        {generateDynamicRoute(`${getUrl('shop-the-look', true)}`, ShopTheLook, null, {
          pageName: gtmPageNames.shopTheLookPage,
        })}
      </Route>

      {generateDynamicRoute(`${getUrl('shop-the-look', true)}/:category`, ShopTheLook, null, {
        pageName: gtmPageNames.shopTheLookPage,
      })}

      {generateDynamicRoute(getUrl('checkout-empty', true), CheckoutEmpty, null, {
        pageName: gtmPageNames.checkoutPage,
      })}

      <Route
        onEnter={(nextState, replace) => {
          const { wishlist, theLookWishlist } = store.getState();
          if (wishlist?.data.length === 0 && theLookWishlist?.data.length > 0) {
            replace(getUrl('wishlist-looks'));
          } else {
            replace(getUrl('wishlist-products'));
          }
        }}
      >
        {generateDynamicRoute(getUrl('wishlist', true), Wishlist, null, {
          pageName: gtmPageNames.wishlistPage,
        })}
      </Route>
      {generateDynamicRoute(`${getUrl('wishlist', true)}/:category`, Wishlist, null, {
        pageName: gtmPageNames.wishlistPage,
      })}

      {generateDynamicRoute(getUrl('virtual-studio', true), VirtualStudio)}
      {generateDynamicRoute(getUrl('unsubscribe', true), Unsubscribe)}
      {/* {generateDynamicRoute(getUrl('app', true), AppLanding)} */}
      {generateDynamicRoute(getUrl('stay-home', true), StayHomeWithCastlery)}

      {/* General Static Pages */}
      <Route onEnter={checkResetSecret}>
        {generateDynamicRoute(getUrl('reset-password', true), ResetPassword, null, {
          pageName: gtmPageNames.accountPage,
        })}
      </Route>
      {/* {generateDynamicRoute(getUrl('our-story', true), OurStory)} */}
      {generateDynamicRoute(getUrl('delivery', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('accessibility', true), TermsAndConditions)}
      {/* {__YOTPO_ENABLED__ &&
        __COUNTRY__ !== 'SG' &&
        generateDynamicRoute(getUrl('referral-terms', true), TermsAndConditions)} */}
      {__YOTPO_ENABLED__ && generateDynamicRoute(getUrl('referral-issue', true), TermsAndConditions)}

      {generateDynamicRoute(getUrl('manufacturing-quality', true), Manufacturer)}
      {generateDynamicRoute(getUrl('terms-of-use', true), TermsAndConditions)}
      {/* Use storyblok first */}
      {__YOTPO_ENABLED__ &&
        generateDynamicRoute(getUrl('store-credits-terms', true), Storyblok, {
          pageName: gtmPageNames.issPage,
        })}
      {__YOTPO_ENABLED__ && generateDynamicRoute(getUrl('store-credits-terms', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('privacy-policy', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('sales-and-refunds', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('warranty', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('promo-terms', true), TermsAndConditions)}
      {generateDynamicRoute(getUrl('help-center', true), HelpCenter)}
      {generateDynamicRoute(getUrl('press', true), Press)}
      {generateDynamicRoute(getUrl('style-contest', true), StyleContest)}
      {generateDynamicRoute(getUrl('studio', true), Studio)}
      {/* {generateDynamicRoute(getUrl('showroom', true), Studio)} */}
      {generateDynamicRoute(getUrl('contact-us', true), ContactUs)}
      {generateDynamicRoute(getUrl('reviews', true), Review, null, {
        pageName: gtmPageNames.reviewsPage,
      })}
      {generateDynamicRoute(getUrl('accident-protection-plan-faq', true), CareCover)}
      {generateDynamicRoute(getUrl('swatches', true), Swatches)}
      {generateDynamicRoute(getUrl('zip', true), Zip)}
      {generateDynamicRoute(getUrl('trade', true), TradeProgram)}
      {/* {generateDynamicRoute(getUrl('affiliate-program', true), AffiliateProgram)} */}

      {/* Campaigns */}
      {generateDynamicRoute(getUrl('feat', true), Feat, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('interior-design', true), Interior, null, {
        pageName: gtmPageNames.campaignPage,
      })}

      {generateDynamicRoute(getUrl('anniversary', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('warehouse-sale', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('warehouse-sale-tutorial', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('rsvp', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('christmas', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('new-year', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {/* {generateDynamicRoute(getUrl('lunar-new-year', true), CategoryRetired, null, {
        pageName: gtmPageNames.campaignPage,
      })} */}
      {generateDynamicRoute(
        getUrl('lunar-new-year-event', true),
        getPageByKey('lunar-new-year-event')?.effective ? LunarNewYearEvent : CategoryRetired,
        null,
        {
          pageName: gtmPageNames.campaignPage,
        }
      )}
      {generateDynamicRoute(getUrl('mid-year-sale', true), MidYearSale, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('new-way-of-living', true), NewWayOfLiving, null, {
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('furniture-sydney', true), FurnitureSEO, 'sydney', {
        city: 'sydney',
        pageName: gtmPageNames.campaignPage,
      })}
      {generateDynamicRoute(getUrl('furniture-melbourne', true), FurnitureSEO, 'melbourne', {
        city: 'melbourne',
        pageName: gtmPageNames.campaignPage,
      })}
      {/* {generateDynamicRoute(getUrl('new-homeowners', true), HomeOwners, null, {
        pageName: gtmPageNames.campaignPage,
      })} */}
      {generateDynamicRoute(getUrl('celebrate-home-giveaway', true), CelebrateHome, null, {
        pageName: gtmPageNames.campaignPage,
      })}

      {/* {generateDynamicRoute(getUrl('room-designer', true), RoomDesignerPage, null, {
        pageName: gtmPageNames.roomDesignerPage,
      })} */}

      {/* modular tool */}
      {/* {generateDynamicRoute(getUrl('furniture-configurator-tool', true), DesignFurniturePage, null, {
        pageName: gtmPageNames.DesignFurniturePage,
      })} */}

      {/* Blog */}
      {generateDynamicRoute(getUrl('blog', true), Blogs, null, {
        pageName: gtmPageNames.blogPage,
      })}
      {/* o2o */}
      {generateDynamicRoute(getUrl('o2o', true), O2O, null, {
        pageName: gtmPageNames.o2oPage,
      })}
      {/* interior-styling-service */}
      {/* {generateDynamicRoute(getUrl('interior-styling-service', true), InteriorStylingService, null, {
        pageName: gtmPageNames.issPage,
      })} */}
      {generateDynamicRoute('/interior-styling-service', Storyblok, 'interior-styling-service', {
        pageName: gtmPageNames.issPage,
      })}
      {/* {generateDynamicRoute(`${getUrl('blog', true)}/:slug`, Storyblok, null, {
        pageName: gtmPageNames.blogListPage,
      })} */}

      {/* Schedule Delivery page */}
      {generateDynamicRoute(getUrl('schedule-delivery', true), ScheduleDelivery)}

      {/* Delivery Review */}
      {generateDynamicRoute(getUrl('delivery-review', true), DeliveryReview)}

      {/* Search Page */}
      {generateDynamicRoute(getUrl('search', true), Category, null, {
        pageName: gtmPageNames.searchPage,
      })}

      {/* Book Appointment Page for ios */}
      {generateDynamicRoute('studios/:slug/book-appointment', BookAppointment)}

      {/* Appointment Page */}
      {generateDynamicRoute('appointments/:id', Appointment)}

      {/* Designer Page */}
      <Route onEnter={validateDesigner}>
        {generateDynamicRoute(`${getUrl('designers', true)}/:designer`, Designer)}
      </Route>
      {generateDynamicRoute(`${getUrl('designer-community', true)}`, DesignerCommunity)}

      {/* Product Page */}
      <Route>
        {generateDynamicRoute(`${getUrl('product', true)}/:product`, Product, null, {
          pageName: gtmPageNames.productDetailPage,
        })}
      </Route>

      <Route>
        {generateDynamicRoute(`${getUrl('pla', true)}/:product`, Pla, null, {
          pageName: gtmPageNames.productDetailPage,
        })}
      </Route>

      {/* Sale Page */}
      {getSalePages().map((page) => {
        let pageName = gtmPageNames.salePage;
        if (page.isSeoPage) {
          pageName = gtmPageNames.seoPage;
        }
        if (!page.url) {
          console.log('salePage error: ', page);
        }
        if (isOutdated(page.publishedAt, page.endedAt) && page.url !== getUrl('sale')) {
          return generateDynamicRoute(page.url?.slice(1), CategoryRetired, page.key, { pageName });
        }
        const route = generateDynamicRoute(page.url?.slice(1), Category, page.key, { pageName });
        if (page.query || (page.queryDeliverBefore && page.queryDeliverBefore.length > 0)) {
          return <Route key={page.key}>{route}</Route>;
        }
        return route;
      })}

      {/* Storyblok pages */}
      {getStoryblokPages().map((page) => {
        const pageName = gtmPageNames.campaignPage;
        const route = generateDynamicRoute(page.url?.slice(1), Storyblok, page.key, { pageName });

        if (page.query) {
          return <Route key={page.key}>{route}</Route>;
        }
        return route;
      })}

      {getStoryblokBlogPages().map((page) => {
        const pageName = gtmPageNames.campaignPage;
        const route = generateDynamicRoute(page.url?.slice(1), StoryblokBlog, page.key, { pageName, pageType: 'blog' });

        if (page.query) {
          return <Route key={page.key}>{route}</Route>;
        }
        return route;
      })}

      {getPageByKey('livetrue')?.effective &&
        generateDynamicRoute(getUrl('livetrue', true), S2CampaignPage, null, {
          pageName: gtmPageNames.campaignPage,
        })}

      {/* Category Page */}
      <Route onEnter={validatePath}>
        {generateDynamicRoute('collections/:category2', Category, null, {
          pageName: gtmPageNames.collectionPage,
        })}
        {generateDynamicRoute(':category1/:category2', Category, null, {
          pageName: gtmPageNames.categoryPage,
        })}
      </Route>

      {/* Warehouse sale 2019 March */}
      {generateDynamicRoute(getUrl('as-is', true), Category, null, {
        pageName: gtmPageNames.salePage,
      })}
      {generateDynamicRoute(getUrl('asis-beds', true), Category, null, {
        pageName: gtmPageNames.salePage,
      })}

      {/* Referral Page */}
      {__YOTPO_ENABLED__ && generateDynamicRoute(getUrl('referral', true), Referral)}

      {/* Store Credits Page */}
      {__YOTPO_ENABLED__ && generateDynamicRoute(getUrl('rewards', true), Rewards)}

      {/* sitemap */}
      {generateDynamicRoute(getUrl('sitemap', true), Sitemap)}

      {/* Home Page with promotion */}
      {generateDynamicRoute(getUrl('mindscape', true), DynamicHome, null, {
        pageName: gtmPageNames.homePage,
      })}
      {generateDynamicRoute(getUrl('rich', true), DynamicHome, null, {
        pageName: gtmPageNames.homePage,
      })}
      {generateDynamicRoute(getUrl('wondery', true), DynamicHome, null, {
        pageName: gtmPageNames.homePage,
      })}

      {generateDynamicRoute(getUrl('thedollop', true), DynamicHome, null, {
        pageName: gtmPageNames.homePage,
      })}
      {generateDynamicRoute(getUrl('eventherich', true), DynamicHome, null, {
        pageName: gtmPageNames.homePage,
      })}
      {/* Catch all route */}
      {generateDynamicRoute('*', NotFound, 'not-found', { status: 404 })}
    </Route>
  );
};

export default routes;
