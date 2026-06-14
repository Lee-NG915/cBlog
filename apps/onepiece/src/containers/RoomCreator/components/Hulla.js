import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { add as addToCart } from 'redux/modules/cart';
import { add as addToWishlist, remove as removeWishlist, load as loadWishlist } from 'redux/modules/wishlist';
import { trackAddToWishList } from 'utils/tracking';
import { EVENT_ADD_TO_WISHLIST } from 'utils/track/constants';
import { randomId } from 'utils/number';
import Spinner from 'components/Spinner';
import style from './style.scss';

const HullaIntegrate = ({ hullaId, folder, retailer }, { frame }) => {
  const cart = useSelector((state) => state.cart);
  const order = cart?.data;

  const [loaded, setLoaded] = useState(false);

  // const [appPath, setAppPath] = useState(null);
  const bucketUrl = 'https://castlery.hulla-cdn.com';
  const hullaDivRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!document.getElementById('hintegrate')) {
      const script = document.createElement('script');
      script.src = 'https://castlery.hulla-cdn.com/hintegrate.js';
      script.id = 'hintegrate';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        setLoaded(true);
        if (window?.HIntegrate) {
          window.HIntegrate?.initialiseExperience(folder, '#hulla-room-designer');
        }
      };
    } else {
      setLoaded(true);
      window?.HIntegrate?.checkStartupHullabalook?.();
      if (window?.HIntegrate) {
        window.HIntegrate?.initialiseExperience(folder, '#hulla-room-designer');
      }
    }

    return () => {
      if (!window.hintegrate) window.hintegrate = window.Hulla;
    };
  }, [bucketUrl, folder]);

  const handleGetWishlist = useCallback(() => {
    let currentWishlist = [];
    dispatch(loadWishlist())
      .then((result) => {
        if (result?.length > 0) {
          currentWishlist = result.map((item) => ({
            product: {
              ident: (item?.id).toString(),
            },
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        const message = {
          messageType: 'current_wishlist',
          items: currentWishlist,
        };

        hullaDivRef.current.firstChild.contentWindow.postMessage(message, bucketUrl);
      });
  }, [bucketUrl, dispatch]);

  const handleGetCart = useCallback(() => {
    let currentCart = [];
    if (order?.line_items) {
      currentCart = order.line_items.map((item) => ({
        product: {
          ident: item.variant?.id,
        },
        quantity: item.quantity,
      }));
    }
    const message = {
      messageType: 'current_cart',
      items: currentCart,
    };

    hullaDivRef.current.firstChild.contentWindow.postMessage(message, bucketUrl);
  }, [order, bucketUrl]);

  const handleWishlistUpdate = useCallback(
    async (items, type) => {
      const failedItems = [];
      const updateFunc = (id) => (type === 'add' ? dispatch(addToWishlist(id)) : dispatch(removeWishlist(id)));

      const updatePromises = items.map((item) =>
        updateFunc(item?.product?.ident)
          .then((variant) => {
            if (type === 'add') {
              const eventId = randomId('AddToWishList');
              trackAddToWishList(variant, { eventId });

              dispatch({
                type: EVENT_ADD_TO_WISHLIST,
                result: { variant, eventId },
              });
            }
          })
          .catch((error) => {
            failedItems.push({
              name: item.product?.name,
              error: error?.errors?.[0]?.detail || error,
            });
          })
      );

      await Promise.all(updatePromises);
      if (failedItems.length > 0) {
        const errorMessages = failedItems.map((item) => `${item.name}`);
        frame.openModal('response', {
          body: `An error has occurred. The ${errorMessages.join(' and ')} cannot be ${
            type === 'add' ? 'added to wishlist' : 'removed from wishlist'
          }.`,
        });
      }

      handleGetWishlist();
    },
    [dispatch, frame, handleGetWishlist]
  );

  const handleAddToCart = useCallback(
    async (items) => {
      const failedItems = [];
      for (const item of items) {
        const { quantity, product } = item || {};
        try {
          await dispatch(
            addToCart({
              type: 'hulla',
              variant: {
                id: product.ident,
              },
              quantity,
            })
          ).catch((error) => {
            failedItems.push({
              id: product?.ident,
              name: product?.name,
              error: error?.errors?.[0]?.detail || error,
            });
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (failedItems.length > 0) {
        const errorMessages = failedItems.map((item) => `${item.name}`);
        frame.openModal('response', {
          body: `An error has occurred. The ${errorMessages.join(' and ')} cannot be added to cart.`,
        });
      } else {
        frame.openModal('cart');
      }

      const message = {
        messageType: 'add_to_cart_response',
        items: items.map((item) => {
          item.status = failedItems.find((failItem) => failItem?.id === item?.product?.ident) ? 'failure' : 'success';
          return item;
        }),
      };

      hullaDivRef.current.firstChild.contentWindow.postMessage(message, bucketUrl);
    },
    [bucketUrl, dispatch, frame]
  );

  const handleMessage = useCallback(
    (event) => {
      const { messageType, items } = event?.data || {};
      if (event.origin !== bucketUrl || !messageType) return;

      switch (messageType) {
        case 'hulla_get_wishlist':
          handleGetWishlist();
          break;
        case 'hulla_get_cart':
          handleGetCart();
          break;
        case 'hulla_add_to_wishlist':
          handleWishlistUpdate(items, 'add');
          break;
        case 'hulla_remove_from_wishlist':
          handleWishlistUpdate(items, 'remove');
          break;
        case 'hulla_add_to_cart':
          handleAddToCart(items);
          break;
        default:
          break;
      }
    },
    [bucketUrl, handleAddToCart, handleGetCart, handleGetWishlist, handleWishlistUpdate]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return (
    <>
      {!loaded && (
        <div className={`${style.hulla}__loading`}>
          <Spinner />
        </div>
      )}
      <div
        ref={hullaDivRef}
        className="hulla"
        id="hulla-room-designer"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          minHeight: 'calc(100vh - 150px)',
        }}
      />
    </>
  );
};

HullaIntegrate.propTypes = {
  hullaId: PropTypes.string,
  folder: PropTypes.string.isRequired,
  retailer: PropTypes.string.isRequired,
};

HullaIntegrate.defaultProps = {
  hullaId: 'hulla',
};

HullaIntegrate.contextTypes = {
  frame: PropTypes.object,
};

export default HullaIntegrate;
