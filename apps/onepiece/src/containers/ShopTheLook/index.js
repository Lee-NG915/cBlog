import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { wrapPage } from 'utils/page';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { loadIfNeeded as loadTheLookWishlist } from 'redux/modules/theLookWishlist';
import { Link } from 'react-router';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import { NotFoundWithoutWrapPage } from 'containers/NotFound';
import NotificationBar from 'components/NotificationBar';
import { Container } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress/hooks';
import style from './style.scss';
import TheLook from './components/TheLook';

console.log('useBreakpoints', useBreakpoints);

function ShopTheLook({ params, location }) {
  const dispatch = useDispatch();
  const [showNotification, setShowNotification] = useState(false);
  const { category } = params;
  const shopTheLookData = useSelector(
    (state) =>
      state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`]
  );
  const list = {
    'Living Room': 'living-room',
    'Dining Room': 'dining-room',
    Bedroom: 'bedroom',
    Outdoor: 'outdoor',
    'By Collection': 'by-collection',
  };
  const contentType = category.split('-').join('_');

  useEffect(() => {
    const { query } = location;
    if (window && window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (query && query.look) {
      try {
        setTimeout(() => {
          document.querySelector(`#${query.look}`)?.scrollIntoView();
        }, 0);
      } catch (err) {
        console.error(
          JSON.stringify(
            {
              message: 'ShopTheLook error',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        );
      }
    }
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  const formatLookName = (lookName) =>
    lookName && lookName.toLowerCase()?.replaceAll && lookName.toLowerCase()?.replaceAll(' ', '_');

  if (shopTheLookData?.data?.story?.content[contentType] !== undefined) {
    return (
      <Container className={`${style.shopTheLook}`}>
        <div className={`${style.shopTheLook}__header`}>
          <h1>Shop The Look</h1>
          <p>Seeking inspiration for a home makeover? Explore our curated spaces and discover all that home can be.</p>
          <nav>
            <ul>
              {Object.keys(list).map((key, index) => (
                <li key={index}>
                  <Link
                    to={`shop-the-look/${list[key]}`}
                    onClick={() => {
                      dispatch({
                        type: EVENT_SHOP_THE_LOOK,
                        result: {
                          detailAction: 'tab_bar_click',
                          label: list[key],
                        },
                      });
                    }}
                  >
                    <button type="button" className={`${category === list[key] ? 'active' : ''}`}>
                      {key}
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {shopTheLookData.data.story.content[contentType].map((item, index) => (
          <TheLook
            id={formatLookName(item.look_name || item.collection_name)}
            key={item._uid}
            item={item}
            index={index}
            setShowNotification={setShowNotification}
          />
        ))}
        {showNotification && (
          <NotificationBar
            setShowNotification={setShowNotification}
            data={{
              msg1: 'Added to wishlist!',
              msg2: 'View wishlist',
              linkTo: '/wishlist/looks',
              undo: null,
            }}
          />
        )}
      </Container>
    );
  }
  return <NotFoundWithoutWrapPage location={location} />;
}

export default asyncLoad([
  ({ store: { dispatch } }) =>
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`)),
  ({ store: { dispatch } }) => dispatch(loadTheLookWishlist()),
])(wrapPage({ page: { title: `Shop The Look` } })(ShopTheLook));
