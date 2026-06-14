import React, { useState, useEffect } from 'react';
import Spinner from 'components/Spinner';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { loadIfNeeded as loadWishlist, add as addProductToWishlist } from 'redux/modules/wishlist';
import { loadIfNeeded as loadTheLookWishlist, add as addLookWishlist } from 'redux/modules/theLookWishlist';
import { useDispatch, useSelector } from 'react-redux';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { getUrl } from 'pages';
import { GhostArrowBtn } from 'components/Button';
import NotFound from 'containers/NotFound';

import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import NotificationBar from 'components/NotificationBar';
import Breadcrumbs from 'components/Breadcrumbs';
import { Container } from '@castlery/fortress';

import PropTypes from 'prop-types';
import style from './style.scss';

import Products from './components/Products';

import DetailedLook from './DetailedLook';
import WishlistTabs from './components/Tabs';
import Looks from './components/Looks';

const Wishlist = ({ location, params }, { router }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
  const theLookWishlist = useSelector((state) => state.theLookWishlist);
  const cart = useSelector((state) => state.cart?.data);
  const [showNotification, setShowNotification] = useState(false);
  const [tabIndex, setTabIndex] = useState(-1);
  const [showTheLookDetail, setShowTheLookDetail] = useState(null);
  const [notificationData, setNotificationData] = useState({});
  const tabsValues = ['Products', 'Looks'];
  // const { desktop } = useBreakpoints();
  useEffect(() => {
    setShowTheLookDetail(null);
    const nav = {
      products: 0,
      looks: 1,
    };
    setTabIndex(nav[params.category]);
    setShowNotification(false);
  }, [params]);

  const onChangeTabs = (value) => {
    const nav = {
      0: 'products',
      1: 'looks',
    };
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: 'wishlist_tab_click',
        label: tabsValues[value],
      },
    });
    const url = getUrl('wishlist');
    router.push(`${url}/${nav[value]}`);
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  // const Tabs = () => {
  //   if (showTheLookDetail === null) {
  //     return (
  //       <div className={`${style.wishlist}__btns`}>
  //         <Link to={`${getUrl('wishlist')}/products`}>
  //           <button
  //             type="button"
  //             className={`${tabIndex === 0 ? 'active' : ''}`}
  //             onClick={() => {
  //               dispatch({
  //                 type: EVENT_SHOP_THE_LOOK,
  //                 result: {
  //                   detailAction: 'wishlist_tab_click',
  //                   label: 'Products',
  //                 },
  //               });
  //             }}
  //           >
  //             Products
  //           </button>
  //         </Link>
  //         <Link to={`${getUrl('wishlist')}/looks`}>
  //           <button
  //             type="button"
  //             className={`${tabIndex === 1 ? 'active' : ''}`}
  //             onClick={() => {
  //               dispatch({
  //                 type: EVENT_SHOP_THE_LOOK,
  //                 result: {
  //                   detailAction: 'wishlist_tab_click',
  //                   label: 'Looks',
  //                 },
  //               });
  //             }}
  //           >
  //             Looks
  //           </button>
  //         </Link>
  //       </div>
  //     );
  //   }
  //   return <DetailedLook setShowTheLookDetail={setShowTheLookDetail} showTheLookDetail={showTheLookDetail} />;
  // };

  return tabIndex === undefined ? (
    <NotFound location={location} />
  ) : (
    <>
      <Helmet
        path={location.pathname}
        page={{
          title: `${tabIndex === 0 ? 'Products Wishlist' : tabIndex === 1 ? 'Looks Wishlist' : 'Wishlist'}`,
        }}
      />

      <Header />

      <Breadcrumbs location={location} />

      {tabIndex === -1 ? (
        <div style={{ height: '50vh', position: 'relative' }}>
          <Spinner />
        </div>
      ) : (
        <Container className={`${style.wishlist}`}>
          <h1 className={`${style.wishlist}__header`}>Wishlist</h1>
          {showTheLookDetail === null && (
            <WishlistTabs
              tabs={tabsValues}
              value={tabIndex}
              onChange={(_, value) => {
                setTabIndex(value);
                onChangeTabs(value);
              }}
            />
          )}
          {showTheLookDetail && (
            <DetailedLook setShowTheLookDetail={setShowTheLookDetail} showTheLookDetail={showTheLookDetail} />
          )}
          <div className={`${style.wishlist}__list`}>
            {tabIndex === 0 ? (
              !wishlist.loaded ? (
                <div className={`${style.wishlist}__mask`}>
                  <Spinner />
                </div>
              ) : wishlist.data.length === 0 ? (
                <div className={`${style.wishlist}__emptyList`}>
                  <p>
                    Save what you like by tapping the nearby heart.
                    <br />
                    We'll keep 'em safely here for you.
                  </p>

                  <GhostArrowBtn href={__BASE_URL__} text="Go Shopping" />
                </div>
              ) : (
                <Products
                  wishlist={wishlist}
                  cartData={cart}
                  onUnlike={(variant) => {
                    setNotificationData({
                      msg1: `${variant.product_name} has been removed from your wishlist.`,
                      undo: () => dispatch(addProductToWishlist(variant.id)),
                    });
                    setShowNotification(true);
                  }}
                />
              )
            ) : !theLookWishlist.loaded ? (
              <div className={`${style.wishlist}__mask`}>
                <Spinner />
              </div>
            ) : theLookWishlist.data.length === 0 ? (
              <div className={`${style.wishlist}__emptyList`}>
                <p>
                  Save what you like by tapping the nearby heart.
                  <br />
                  We'll keep 'em safely here for you.
                </p>
                <GhostArrowBtn href={getUrl('shop-the-look')} text="Shop The Look" />
              </div>
            ) : (
              showTheLookDetail === null && (
                // theLookWishlist.data.map((data) => (
                //   <Look
                //     key={data._uid}
                //     data={data}
                //     setShowTheLookDetail={setShowTheLookDetail}
                //     setShowNotification={setShowNotification}
                //     setNotificationData={setNotificationData}
                //   />
                // ))
                <Looks
                  looks={theLookWishlist.data}
                  setShowTheLookDetail={setShowTheLookDetail}
                  onUnLikeLook={(data) => {
                    setNotificationData({
                      msg1: 'You have successfully removed this look from your wishlist.',
                      undo: () => addLookWishlist(data)(dispatch),
                    });
                    setShowNotification(true);
                  }}
                />
              )
            )}
          </div>
          {showNotification && <NotificationBar setShowNotification={setShowNotification} data={notificationData} />}
        </Container>
      )}
      <Footer />
    </>
  );
};

Wishlist.contextTypes = {
  router: PropTypes.object,
};

export default asyncLoad([
  ({ store: { dispatch } }) => dispatch(loadWishlist()),
  ({ store: { dispatch } }) => dispatch(loadTheLookWishlist()),
])(Wishlist);
