import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import CustomScrollbar from 'components/CustomScrollbar';
import LazyLoad from 'react-lazyload';
import ResponsiveSlick from 'components/ResponsiveSlick';
import { useSelector, useDispatch } from 'react-redux';
import { getBreakpoint } from 'utils/breakpoints';
import Spinner from 'components/Spinner';
import { loadIfNeeded as loadList } from 'redux/modules/variantList';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { getVariantsCategories } from 'redux/modules/variants';
import { isOutdated } from 'utils/time';
import { toPrice, randomId } from 'utils/number';
import lang from 'utils/lang';
import { getVariantLinkObj } from 'utils/link';
import { EVENT_CART_RECO, EVENT_CART_PROCESS, EVENT_ADD_TO_WISHLIST } from 'utils/track/constants';
import { load as loadCartRecommendation } from 'redux/modules/dyApiData';
import { getCartContext } from 'utils/dy';
import { reportRecommendationsEngagement } from 'utils/dyReporting';
import { requestIdleCallback } from 'utils/request-idle-callback';
import classNames from 'classnames';
import { Container, Box, IconButton } from '@castlery/fortress';
import { Favorite, ShoppingBag, Check } from '@castlery/fortress/Icons';
import SvgIcon from '@mui/joy/SvgIcon';
import { getProductBySKU } from 'redux/modules/products';
import { recomendItemAddToCart } from 'redux/modules/cart';
import { add as addToWishlist, remove as removeWishlist } from 'redux/modules/wishlist';

import style from '../style.scss';
import { getToShowsBySkus } from '../utils/common';

const ProductFromDYTag = ({ tags }) => {
  if (tags.length === 0) {
    return null;
  }

  const background = ['Sale', 'Clearance', 'Extra 5% Off'].includes(tags[0]) ? '#DB7D49' : '#844025';

  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'absolute',
        top: '0',
        left: '20px',
        zIndex: 9,
        background,
        color: '#F6F3E7',
        lineHeight: 1.5,
        fontSize: '0.75rem',
        padding: '2px 8px',
      }}
    >
      {tags[0]}
    </div>
  );
};

const CartRecsWidget = ({ cartType, campaignName, showFallbackList = true, onItemClick, setToast }) => {
  const dyState = useSelector((state) => state.dyApiData.campaign);
  const recsCampaignName = campaignName;
  const data = dyState?.[recsCampaignName]?.data || null;
  const title = data?.custom?.title || data?.custom?.header || 'You May Also Like';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  // 修复：为每个商品单独维护状态，使用 Map 结构
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [cartStatus, setCartStatus] = useState({}); // { [sku]: { loading: boolean, success: boolean } }

  // 存储所有的 timer，用于组件卸载时清理
  const timersRef = useRef({});
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);

  const order = cart?.data;
  // const clickHandler = useAddProductToCart({});
  // const stockState = useSelector(selectedCurrentProductStockState);
  // const isOutOfStock = stockState === STOCK_STATE.OUT_OF_STOCK;
  // const cartLoading = cart.loading || cart.creating || cart.processing;
  const marketing = useSelector(
    (state) => state.marketing?.[`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/new-home-page`]
  );
  const bestsellerList = useSelector((state) => state.variantList?.bestseller?.data);
  const dispatch = useDispatch();

  const ids = useMemo(() => JSON.stringify(order?.line_items?.map((item) => item.id).sort((a, b) => a - b)), [order]);

  const handleAddToCart = async (item) => {
    const currentSku = item?.sku;
    if (cartStatus[currentSku]?.loading || cartStatus[currentSku]?.success) {
      return;
    }
    setCartStatus((prev) => ({
      ...prev,
      [currentSku]: { loading: true, success: false },
    }));
    let data = null;

    try {
      data = await getProductBySKU(item?.sku);
    } catch (error) {
      setToast({
        open: true,
        type: 'error',
        text: 'Action failed!',
      });
      setCartStatus((prev) => ({
        ...prev,
        [currentSku]: { loading: false, success: false },
      }));
      return;
    }
    const variantObj = data?.variants?.[0];
    const addToOrderData = {
      quantity: data?.min_sale_qty || 1,
      variant_id: Number(variantObj?.id),
    };
    const eventId = randomId('addToCart');
    const cartCopy = JSON.parse(JSON.stringify(order));
    await dispatch(recomendItemAddToCart(addToOrderData))
      .then((res) => {
        setCartStatus((prev) => ({
          ...prev,
          [currentSku]: { loading: false, success: true },
        }));
        setToast({
          open: true,
          type: 'addToCart',
          text: 'Added to cart!',
        });
        dispatch({
          type: EVENT_CART_PROCESS,
          result: {
            variant: variantObj,
            isSwatch: false,
            preCart: cartCopy,
            isIncreased: true,
            eventId,
          },
        });
      })
      .catch((error) => {
        setToast({
          open: true,
          type: 'error',
          text: 'Action failed!',
        });
        setCartStatus((prev) => ({
          ...prev,
          [currentSku]: { loading: false, success: false },
        }));
      });
  };
  const handleClickWishlist = (item) => {
    const currentSku = item?.sku;
    if (wishlistStatus[currentSku]?.loading) {
      return;
    }
    setWishlistStatus((prev) => ({
      ...prev,
      [currentSku]: { ...wishlistStatus[currentSku], loading: true },
    }));

    if (wishlistStatus[currentSku]?.success) {
      dispatch(removeWishlist(item?.productData?.variant_id))
        .then(() => {
          setWishlistStatus((prev) => ({
            ...prev,
            [currentSku]: { loading: false, success: false },
          }));
          setToast({
            open: true,
            type: 'removeWishlist',
            text: 'Removed from wishlist',
          });
        })
        .catch((error) => {
          setToast({
            open: true,
            type: 'error',
            text: 'Action failed!',
          });
          setWishlistStatus((prev) => ({
            ...prev,
            [currentSku]: { loading: false, success: false },
          }));
        });
    } else {
      dispatch(addToWishlist(item?.productData?.variant_id))
        .then((variant) => {
          console.log('variant----------', variant);
          setWishlistStatus((prev) => ({
            ...prev,
            [currentSku]: { loading: false, success: true },
          }));
          setToast({
            open: true,
            type: 'addWishlist',
            text: 'Added to wishlist',
          });

          const eventId = randomId('AddToWishList');
          dispatch({
            type: EVENT_ADD_TO_WISHLIST,
            result: { variant, eventId },
          });
        })
        .catch((error) => {
          setToast({
            open: true,
            type: 'error',
            text: 'Action failed!',
          });
          setWishlistStatus((prev) => ({
            ...prev,
            [currentSku]: { loading: false, success: false },
          }));
        });
    }
  };

  const cartItemCollections = useMemo(() => {
    const collections = [];
    order?.line_items &&
      order?.line_items.forEach((cartItem) => {
        const taxons = cartItem.variant?.product_taxons?.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
        if (taxons?.name && !collections.includes(taxons.name)) {
          collections.push(taxons.name);
        }
      });
    return collections.reverse();
  }, [order]);

  const cartItemCategories = useMemo(async () => {
    const variantIds = order?.line_items?.map((item) => item?.variant?.id) || [];
    const categories = await getVariantsCategories(variantIds);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.reverse();
  }, [order]);

  const getRecsSkusCondition = useCallback(async () => {
    // const skus = order?.line_items?.map((item) => item?.variant?.sku) || [];
    // 获取最后一个sku
    const lastSkus = order?.line_items?.slice(-1)?.map((item) => item?.variant?.sku) || [];
    const toShows = await getToShowsBySkus(lastSkus).catch((err) => {
      console.error(JSON.stringify({ message: 'getToShowsBySkus error', error: err }, null, 2));
    });
    if (!toShows || !Array.isArray(toShows) || !toShows.length) return [];

    const condition = [
      {
        field: 'sku',
        arguments:
          toShows.map((item) => ({
            action: 'IS',
            value: item,
          })) || [],
      },
    ];
    return condition;
  }, [order]);

  const loadCartRecs = useCallback(async () => {
    if (!recsCampaignName) {
      return;
    }
    const cartContext = order ? getCartContext(order) : null;
    setLoading(true);

    if (wishlist.data.length > 0) {
      wishlist.data.forEach((item) => {
        const currentSku = item.sku;
        setWishlistStatus((prev) => ({
          ...prev,
          [currentSku]: { ...wishlistStatus[currentSku], success: true },
        }));
      });
    }

    order?.line_items &&
      order?.line_items.forEach((item) => {
        const currentSku = item.variant?.sku;
        setCartStatus((prev) => ({
          ...prev,
          [currentSku]: { ...cartStatus[currentSku], success: true },
        }));
      });

    try {
      const [cartCollection1 = '', cartCollection2 = '', cartCollection3 = ''] = cartItemCollections;
      // const [CartCategory1 = '', CartCategory2 = '', CartCategory3 = '', CartCategory4 = ''] = await cartItemCategories;
      const categories = (await cartItemCategories) || [];
      const categoryString = categories.join('|');
      const setsCount = categories.reduce((acc, cur) => {
        if (cur?.includes('Sets')) {
          return acc + 1;
        }
        return acc;
      }, 0);
      const skusCondition = await getRecsSkusCondition();
      dispatch(
        loadCartRecommendation({
          selectorArray: [recsCampaignName],
          pageType: 'cart',
          customContext: cartContext,
          shouldCheckIfNeedLoad: false,
          campaignName: recsCampaignName,
          customPageAttribute: {
            cartCollection1,
            cartCollection2,
            cartCollection3,
            // CartCategory1,
            // CartCategory2,
            // CartCategory3,
            // CartCategory4,
            setsCount,
            // accessoriesCount,
            categoryString,
          },
          realtimeRulesData: skusCondition?.length && {
            // 将includeConditions中的sku排在前面
            // includeSlots: skusCondition[0]?.arguments.map((_, index) => index) || [],
            includeSlots: skusCondition[0].arguments?.[0] ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [],
            includeConditions: skusCondition,
          },
        })
      )
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error(JSON.stringify({ message: 'CartRecsWidget error', error: err }, null, 2));
          setLoading(false);
        });
    } catch (err) {
      console.error(JSON.stringify({ message: 'CartRecsWidget error', error: err }, null, 2));
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    requestIdleCallback(loadCartRecs);
  }, [loadCartRecs]);

  // 清理所有 timers，防止内存泄漏
  useEffect(
    () => () => {
      const timers = timersRef.current;
      Object.values(timers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    },
    []
  );

  // only one collection
  const handleFilter = (array) =>
    array.reduce((pre, cur) => {
      const collectionArr = pre.map((item) => item.productData.collection);
      return collectionArr.includes(cur.productData.collection) ? pre : pre.concat(cur);
    }, []);

  const getTargetData = useCallback(
    (name) => {
      const content = marketing?.data?.story?.content;
      if (Array.isArray(content?.[name])) {
        return content[name].find(
          (t) => !(t.disabled || isOutdated(t.published_at, t.ended_at)) && t.permalink === 'bestseller'
        );
      }
    },
    [marketing]
  );

  const linkCollections = useMemo(() => getTargetData('variant_collections'), [getTargetData]);

  const getFallbackList = useCallback(() => {
    if (!showFallbackList) {
      return;
    }
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/new-home-page`));

    if (linkCollections) {
      dispatch(loadList(['bestseller']));

      if (bestsellerList) {
        const fallbackData = bestsellerList?.variants?.map((item) => ({
          productData: {
            badges: item?.badges || [],
            url: getVariantLinkObj(item)?.pathname,
            image_url: item.images[0]?.links?.feed,
            lifestyle_image: item.life_style_image || item.images[0]?.links?.feed,
            name: item.product_name,
            spu_name: item.product_name,
            sale_price: item.price?.replace(lang.t('common.currency_symbol'), ''),
            dy_display_price:
              +item.price !== +item.list_price ? item.list_price?.replace(lang.t('common.currency_symbol'), '') : '',
          },
          sku: item.sku,
        }));

        setProducts(fallbackData);
      }
    }
  }, [showFallbackList, dispatch, linkCollections, bestsellerList]);

  useEffect(() => {
    if (!data || data?.slots?.length === 0) {
      getFallbackList();
    }
  }, [data, getFallbackList]);

  useEffect(() => {
    const slots = data?.slots;
    if (slots?.length > 0) {
      const groupIds = [];
      let tempProducts = [];
      slots.forEach((slot) => {
        const { productData } = slot;
        if (productData?.badges) {
          if (productData?.badges.indexOf(',') > -1) {
            const tempArr = [];
            productData?.badges.split(',').forEach((tag) => {
              tempArr.push(tag);
            });
            productData.badges = [tempArr[0]];
          } else {
            productData.badges = [productData.badges];
          }
        }
        if (!groupIds.includes(productData.group_id)) {
          groupIds.push(productData.groupId);
          tempProducts.push(slot);
        }
      });
      let productsLength = 50;
      try {
        if (typeof Number(data?.custom?.recommendationLength) === 'number') {
          productsLength = Number(data.custom.recommendationLength);
        }
      } catch (e) {
        console.log('recommendationLength configuration illegal');
      }
      if (isNaN(productsLength)) {
        productsLength = tempProducts.length;
      }
      tempProducts = tempProducts.slice(0, productsLength);
      // const filterProducts = cartItemCollections && cartItemCollections.length ? slots : handleFilter(slots);
      if (tempProducts.length > 0) {
        setProducts(tempProducts);
      } else {
        getFallbackList();
      }
    }
  }, [data, getFallbackList, cartItemCollections]);

  const removeBgColor = (url) => {
    // 'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_750/v1645672842/crusader/variants/50440748-AM4001/Madison-Left-Chaise-Sectional-Sofa-Bisque-Front.jpg';
    let newUrl = url;

    if (url?.startsWith('https://res.cloudinary.com/')) {
      const reg = /(.*)\/(private|upload)\/(.*?)\/(.*)/;

      newUrl = url.replace(reg, (match, ...args) => {
        args[2] = args[2].replace(/b_rgb:*((?!,).)*/, '');
        return args.splice(0, 4).filter(Boolean).join('/');
      });
    }
    return newUrl;
  };

  const handleView = async (sku, spuName, slotId, url, event) => {
    const reportEvent = () => {
      dispatch({
        type: EVENT_CART_RECO,
        result: {
          detailAction: 'click_product_reco',
          skuId: sku,
          skuName: spuName,
        },
      });

      if (slotId) {
        reportRecommendationsEngagement({
          slotId,
        });
      }
    };
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      await reportEvent();
    } else {
      reportEvent();
    }
    if (typeof onItemClick === 'function') {
      onItemClick();
    }
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className={`${style.recommendPage}__loading`}>
        <Spinner />
      </div>
    );
  }

  if (products?.length === 0) {
    return null;
  }

  const priceDisplay = (productData) => (
    <div className={style.price}>
      {productData?.sale_price && productData?.dy_display_price ? (
        <>
          <span>{toPrice(productData?.sale_price, true)}</span>
          <span>{toPrice(productData?.dy_display_price, true)}</span>
        </>
      ) : (
        toPrice(productData?.dy_display_price || productData?.sale_price, true)
      )}
    </div>
  );

  if (cartType === 'fullPage') {
    return (
      <>
        <div className={style.recommendPage}>
          <Container
            sx={{
              padding: {
                xs: '0 24px',
                '@media (max-width: 600px)': '0 32px',
                md: '0 32px',
              },
            }}
          >
            <div className={`${style.recommendPage}__title`}>{title}</div>

            <LazyLoad offset={300} once>
              <div className={`${style.recommendPage}__content`}>
                <ResponsiveSlick
                  mediaQueries={[
                    {
                      query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 2,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                      numPerPage: 5,
                    },
                  ]}
                >
                  {products?.map((item, index) => (
                    <div
                      className={`${style.recommendPage}__item`}
                      data-selenium={`widget_item${index}`}
                      key={item?.sku}
                    >
                      {item?.productData?.badges?.length > 0 && (
                        <ProductFromDYTag tags={item.productData?.badges || []} />
                      )}

                      <a
                        href={item?.productData?.url}
                        onClick={(event) =>
                          handleView(
                            item?.sku,
                            item?.productData?.spu_name,
                            item?.slotId,
                            item?.productData?.url,
                            event
                          )
                        }
                      >
                        <div className={`${style.recommendPage}__image`}>
                          <img src={item?.productData?.image_url} alt="Cart Recommendation" />
                        </div>
                        <div className={`${style.recommendPage}__name`}>{item?.productData?.spu_name}</div>
                      </a>

                      <div className={`${style.recommendPage}__price`}>{priceDisplay(item?.productData)}</div>

                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'top' }}>
                        <IconButton
                          size="sm"
                          aria-label="Cart Action"
                          disabled={cartStatus[item?.sku]?.loading || cartStatus[item?.sku]?.success}
                          sx={{
                            borderRadius: '50%',
                            border: `1px solid #3C101E`,
                            mr: '12px',
                            backgroundColor: '#F6F3E7',
                            width: '34px',
                            height: '34px',
                            '&:hover': {
                              border: `1px solid #3C101E`,
                              backgroundColor: '#F9F7F3',
                            },
                            '@media (max-width: 600px)': {
                              width: '34px',
                              height: '34px',
                            },
                            cursor:
                              cartStatus[item?.sku]?.loading || cartStatus[item?.sku]?.success ? 'default' : 'pointer',
                          }}
                          onClick={() => handleAddToCart(item)}
                        >
                          {cartStatus[item?.sku]?.success ? (
                            <Check
                              sx={{
                                fill: '#3C101E',
                                width: '16px',
                                height: '16px',
                                '@media (max-width: 600px)': {
                                  width: '16px',
                                  height: '16px',
                                },
                              }}
                            />
                          ) : cartStatus[item?.sku]?.loading ? (
                            <SvgIcon
                              sx={{
                                width: '16px',
                                height: '16px',
                                '@media (max-width: 600px)': {
                                  width: '16px',
                                  height: '16px',
                                },
                                svg: {
                                  fill: '#3C101E',
                                  stroke: '#3C101E',
                                  borderRadius: 'inherit',
                                },
                                '@keyframes rotate': {
                                  from: {
                                    transform: 'rotate(0deg)',
                                  },
                                  to: {
                                    transform: 'rotate(360deg)',
                                  },
                                },
                                animation: 'rotate .5s linear infinite',
                              }}
                            >
                              <path d="M11 20.9C8.7 20.6667 6.79167 19.696 5.275 17.988C3.75833 16.2793 3 14.2667 3 11.95C3 9.63333 3.75833 7.629 5.275 5.937C6.79167 4.24567 8.7 3.26667 11 3V4.225C9.05 4.50833 7.43333 5.375 6.15 6.825C4.86667 8.275 4.225 9.98333 4.225 11.95C4.225 13.9167 4.86667 15.625 6.15 17.075C7.43333 18.525 9.05 19.3917 11 19.675V20.9ZM13 20.9V19.675C14.7667 19.4417 16.2583 18.704 17.475 17.462C18.6917 16.2207 19.4417 14.7167 19.725 12.95H20.95C20.75 15.0667 19.9043 16.871 18.413 18.363C16.921 19.8543 15.1167 20.7 13 20.9ZM19.725 10.95C19.475 9.18333 18.7333 7.679 17.5 6.437C16.2667 5.19567 14.7667 4.45833 13 4.225V3C15.1333 3.2 16.9417 4.04167 18.425 5.525C19.9083 7.00833 20.75 8.81667 20.95 10.95H19.725Z" />
                            </SvgIcon>
                          ) : (
                            <ShoppingBag
                              sx={{
                                fill: '#3C101E',
                                width: '16px',
                                height: '16px',
                                '@media (max-width: 600px)': {
                                  width: '16px',
                                  height: '16px',
                                },
                              }}
                            />
                          )}
                        </IconButton>

                        <IconButton
                          size="sm"
                          aria-label="Wishlist Action"
                          sx={{
                            borderRadius: '50%',
                            width: '34px',
                            height: '34px',
                            '@media (max-width: 600px)': {
                              width: '34px',
                              height: '34px',
                            },
                            border: `1px solid #3C101E`,
                            backgroundColor: wishlistStatus[item?.sku]?.success ? '#3c101e' : '#f6f3e7',
                            '&:hover': {
                              border: `1px solid #3C101E`,
                              backgroundColor: wishlistStatus[item?.sku]?.success ? '#3c101e' : '#a59198',
                            },
                            '--variant-plainColor': wishlistStatus[item?.sku]?.success ? '#F6F3E7' : '#3C101E',
                          }}
                          loading={wishlistStatus[item?.sku]?.loading}
                          onClick={() => {
                            handleClickWishlist(item);
                          }}
                        >
                          {wishlistStatus[item?.sku]?.success ? (
                            <Favorite
                              sx={{
                                fill: '#f6f3e7',
                                width: '16px',
                                height: '16px',
                                '@media (max-width: 600px)': {
                                  width: '16px',
                                  height: '16px',
                                },
                              }}
                            />
                          ) : (
                            <Favorite
                              sx={{
                                fill: '#3c101e',
                                width: '16px',
                                height: '16px',
                                '@media (max-width: 600px)': {
                                  width: '16px',
                                  height: '16px',
                                },
                              }}
                            />
                          )}
                        </IconButton>
                      </Box>
                    </div>
                  ))}
                </ResponsiveSlick>
              </div>
            </LazyLoad>
          </Container>
        </div>
      </>
    );
  }

  return (
    <div className={style.recommendations}>
      <div className={`${style.recommendations}__title`}>{title}</div>
      <CustomScrollbar
        content={
          <div className={`${style.recommendations}__content`}>
            {products?.map((item) => (
              <a
                key={item?.sku}
                href={item?.productData?.url}
                onClick={(event) =>
                  handleView(item?.sku, item?.productData?.spu_name, item?.slotId, item?.productData?.url, event)
                }
                className={`${style.recommendations}__item`}
              >
                <div
                  className={classNames(`${style.recommendations}__image`, {
                    'is-fallback': !item?.productData?.lifestyle_image,
                  })}
                >
                  <img
                    src={item?.productData?.lifestyle_image || removeBgColor(item?.productData?.image_url)}
                    alt="Cart Recommendation"
                  />
                </div>
                <div className={`${style.recommendations}__name`}>{item?.productData?.spu_name}</div>
                <div className={`${style.recommendations}__price`}>{priceDisplay(item?.productData)}</div>
              </a>
            ))}
          </div>
        }
      />
    </div>
  );
};

CartRecsWidget.propTypes = {
  cartType: PropTypes.string,
  campaignName: PropTypes.string,
  showFallbackList: PropTypes.bool,
  onItemClick: PropTypes.func,
  setToast: PropTypes.func,
};

export default CartRecsWidget;
