/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState, useContext } from 'react';
import ReactPicture from 'components/ReactPicture';
import Switch from 'components/Form/Switch';
import SvgIcon from 'components/SvgIcon';
import { useInView } from 'react-intersection-observer';
import { add, remove, load as loadTheLookWishlist } from 'redux/modules/theLookWishlist';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'components/Spinner';
import { FrameContext } from 'containers/Frame/FrameContext';
import { toPrice } from 'utils/number';
import { Link } from 'react-router';
import { getVariantLink } from 'utils/link';
import { load as loadCollectionRecommendations } from 'redux/modules/dyApiData';
import Slider from 'react-slick';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import Variant from 'components/VariantList/Variant';
import { loadIfNeeded as loadVariants } from 'redux/modules/variants';
import PriceDisplay from 'components/PriceDisplay';
import ReadMore from 'components/Review/ReadMore';

import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import HotSpot from './HotSpot';
import Tip from './Tip';
import style from '../style.scss';

export default function TheLook({ item, showWidgets = true, index, setShowNotification, id }) {
  const [inViewRef, inView] = useInView({
    threshold: 0,
  });
  const collectionRecommendations = useSelector((state) => state.dyApiData.campaign['Collection Recommendation']);
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const { image, hotspots, _uid, collection_name = null, tips = [] } = item;
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  const NextA = ({ className, style, onClick }) => (
    <div
      className={className}
      style={{ ...style }}
      onClick={() => {
        dispatch({
          type: EVENT_SHOP_THE_LOOK,
          result: {
            detailAction: 'by_collection_scroll',
            label: 'arrow_click_right',
            collection: collection_name || '',
          },
        });
        onClick();
      }}
    >
      <SvgIcon
        name="line-right-arrow"
        className={className}
        style={{ ...style }}
        onClick={() => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'by_collection_scroll',
              label: 'arrow_click_right',
              collection: collection_name || '',
            },
          });
          onClick();
        }}
      />
    </div>
  );
  const PrevA = ({ className, style, onClick }) => (
    <div
      className={className}
      style={{ ...style }}
      onClick={() => {
        dispatch({
          type: EVENT_SHOP_THE_LOOK,
          result: {
            detailAction: 'by_collection_scroll',
            label: 'arrow_click_left',
            collection: collection_name || '',
          },
        });
        onClick();
      }}
    >
      <SvgIcon
        name="line-left-arrow"
        className={className}
        style={{ ...style }}
        onClick={() => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'by_collection_scroll',
              label: 'arrow_click_left',
              collection: collection_name || '',
            },
          });
          onClick();
        }}
      />
    </div>
  );
  const settings = {
    dots: isMobile,
    arrows: !isMobile,
    infinite: true,
    speed: 500,
    lazyLoad: false,
    slidesToShow: isMobile ? 2 : 4,
    slidesToScroll: isMobile ? 2 : 4,
    nextArrow: <NextA />,
    prevArrow: <PrevA />,
  };
  const variantsData = useSelector((state) => state.variants);
  const variantIds = hotspots.map((h) => h.variant_id);
  const savedLooks = useSelector((state) => state.theLookWishlist?.data);
  const [liked, setLiked] = useState(savedLooks?.find((d) => d.shop_the_look_id === _uid));
  const [viewAllProduct, setViewAllProduct] = useState(false);
  const [viewAllTips, setViewAllTips] = useState(false);
  const [loadingLikebtn, setLoadingLikebtn] = useState(false);

  const toggleViewAllProduct = (status) => {
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: status ? 'view_all_products_on' : 'view_all_products_off',
        position: index,
        label: item._uid,
      },
    });
    setViewAllProduct(status);
  };

  const toggleViewAllTips = (status) => {
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: status ? 'view_all_tips_on' : 'view_all_tips_off',
        position: index,
        label: item._uid,
      },
    });
    setViewAllTips(status);
  };

  const openViewAll = () => {
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: 'view_all_products_on',
        position: index,
        label: item._uid,
      },
    });
    frame.openModal(
      'mobileModal',
      {
        content: (
          <div className={`${style.theLook}__viewAllModal`}>
            <h2>In This Look</h2>
            <span>
              {variantIds.reduce((acc, cur) => {
                if (variantsData[cur]) {
                  return acc + 1;
                }
                return acc;
              }, 0)}{' '}
              products displayed
            </span>
            {variantIds.map((id) => {
              const v = variantsData[id];
              return v ? (
                <Link to={getVariantLink(v)} key={v.id} className={`${style.theLook}__viewAllModal-container`}>
                  <div className={`${style.theLook}__viewAllModal-left`}>
                    <ReactPicture srcset={v.images[0]?.links} alt={v.name} />
                  </div>
                  <div className={`${style.theLook}__viewAllModal-right`}>
                    <div className={`${style.theLook}__viewAllModal-name`}>{v.product_name}</div>
                    <PriceDisplay price={v.price} originalPrice={v.list_price} />
                  </div>
                  <SvgIcon name="arrow-next" width={12} height={12} marginLeft={12} />
                </Link>
              ) : null;
            })}
          </div>
        ),
        styleOverflow: 'scroll',
        closeHandler: () => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'view_all_products_off',
              position: index,
              label: _uid,
            },
          });
        },
      },
      { height: 60, styleOverflow: 'auto' }
    );
  };

  const openTipsModal = () => {
    if (!isMobile) {
      return;
    }
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: 'view_all_tips_on',
        position: index,
        label: item._uid,
      },
    });
    frame.openModal(
      'mobileModal',
      {
        content: (
          <div className={`${style.theLook}__viewAllModal`}>
            <h2>In This Look</h2>
            <span style={{ color: '#565351' }}>{tips?.length || 0} styling tips</span>
            {tips &&
              tips.map((tip) => (
                <div className={`${style.theLook}__tip ${style.theLook}__viewAllModal__tip`} key={tip._uid}>
                  <div className={`${style.theLook}__tip__header`}>
                    <SvgIcon name="tip" />
                    <span className={`${style.theLook}__tip__title`}>{tip.title}</span>
                  </div>
                  <div className={`${style.theLook}__tip__description`}>
                    <ReadMore showLess underline maxLength={215} content={tip.description} color={style.primaryColor} />
                  </div>
                </div>
              ))}
          </div>
        ),
        styleOverflow: 'scroll',
        closeHandler: () => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'view_all_tips_off',
              position: index,
              label: item._uid,
            },
          });
        },
      },
      { height: 60, styleOverflow: 'auto' }
    );
  };

  const toggleLike = () => {
    if (liked) {
      setLoadingLikebtn(true);
      remove({ shop_the_look_id: _uid })(dispatch)
        .then(() => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'unsave_this_look',
              label: _uid,
              position: index,
            },
          });
          setLoadingLikebtn(false);
        })
        .catch(() => {
          dispatch(loadTheLookWishlist());
          setLoadingLikebtn(false);
        });
    } else {
      setLoadingLikebtn(true);
      add({
        shop_the_look_id: _uid,
        background_image: image,
        variant_ids: variantIds,
      })(dispatch)
        .then(() => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'save_this_look',
              label: _uid,
              position: index,
            },
          });
          setLoadingLikebtn(false);
          setShowNotification(true);
        })
        .catch(() => {
          dispatch(loadTheLookWishlist());
          setLoadingLikebtn(false);
        });
    }
  };

  const trackLookInview = () => {
    if (!inView) return;
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: 'stl_image_impression',
        label: _uid,
        position: index,
      },
    });
  };

  useEffect(() => {
    setLiked(savedLooks?.find((d) => d.shop_the_look_id === _uid));
  }, [savedLooks, _uid]);

  useEffect(() => {
    dispatch(loadVariants(variantIds));
  }, []);

  useEffect(() => {
    if (inView && collection_name && !collectionRecommendations?.[collection_name]) {
      dispatch(
        loadCollectionRecommendations({
          selectorArray: ['Collection Recommendation'],
          collectionName: collection_name,
        })
      );
    }
    trackLookInview();
  }, [inView]);

  return (
    <div className={style.theLook} ref={inViewRef} id={id}>
      {collection_name && <h2 className={`${style.theLook}__collectionName`}>{`${collection_name} Collection`}</h2>}
      <div className={`${style.theLook}__gridContainer`} key={_uid}>
        <ReactPicture
          srcset={image}
          loader={{
            ratio: 0.5625,
            customStyle: {
              width: '100%',
              gridColumn: '1/21',
              gridRow: '1/21',
            },
          }}
        />
        {hotspots &&
          hotspots.map((hotspot) => (
            <HotSpot
              key={hotspot._uid}
              lookId={_uid}
              position={index}
              hotspot={hotspot}
              viewAll={viewAllProduct}
              variantsData={variantsData}
              mobileClickHandler={openViewAll}
            />
          ))}
        {tips && tips.map((tip) => <Tip key={tip._uid} tip={tip} viewAll={viewAllTips} onClick={openTipsModal} />)}
      </div>
      {showWidgets && (
        <div className={style.saveLook}>
          {variantsData ? (
            isMobile ? (
              <>
                {hotspots?.length > 0 && (
                  <div className={`${style.saveLook}__tool`}>
                    <span role="button" onClick={openViewAll}>
                      View all products
                      <SvgIcon name="list" />
                    </span>
                  </div>
                )}

                {tips?.length > 0 && (
                  <div className={`${style.saveLook}__tool`}>
                    <span role="button" onClick={openTipsModal}>
                      View all styling tips
                      <SvgIcon name="tip" />
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className={`${style.saveLook}__tool`}>
                {hotspots?.length > 0 && (
                  <div className={`${style.saveLook}__tool`}>
                    <span
                      role="button"
                      onClick={() => {
                        toggleViewAllProduct(!viewAllProduct);
                      }}
                    >
                      View all products
                    </span>
                    <Switch id={_uid} onChange={toggleViewAllProduct} checked={viewAllProduct} />
                  </div>
                )}

                {tips?.length > 0 && (
                  <div className={`${style.saveLook}__tool`}>
                    <span
                      role="button"
                      onClick={() => {
                        toggleViewAllTips(!viewAllTips);
                      }}
                    >
                      View all styling tips
                    </span>
                    <Switch id={`${_uid}tips`} onChange={toggleViewAllTips} checked={viewAllTips} />
                  </div>
                )}
              </div>
            )
          ) : (
            <div className={`${style.saveLook}__tool`}>
              <span>
                View all products
                <Spinner className={`${style.theLook}__spinner`} />
              </span>
            </div>
          )}

          <div className={`${style.saveLook}__tool ${style.saveLook}__wishlist`}>
            <span role="button" onClick={toggleLike}>
              Add to Wishlist
              <button type="button" className={`${style.saveLook}__likeBtn`} disabled={loadingLikebtn}>
                {loadingLikebtn ? (
                  <Spinner className={`${style.theLook}__spinner`} />
                ) : (
                  <SvgIcon
                    className={`${liked ? 'liked' : ''}`}
                    width={25}
                    name="heart"
                    fillOpacity={`${liked ? 1 : 0}`}
                  />
                )}
              </button>
            </span>
          </div>
        </div>
      )}
      {collection_name && (
        <div className={`${style.theLook}__dyRecommendation`}>
          <div className={`${style.theLook}__dyRecommendation-title`}>
            <h1>More from this collection</h1>
            <Link to={`/collections/${collection_name.toLowerCase()}-collection`}>View full collection</Link>
          </div>
          <Slider
            dots={isMobile}
            arrows={!isMobile}
            infinite={collectionRecommendations?.[collection_name]?.length > 4}
            speed={500}
            lazyLoad={false}
            slidesToShow={isMobile ? 2 : 4}
            slidesToScroll={isMobile ? 2 : 4}
            nextArrow={<NextA />}
            prevArrow={<PrevA />}
          >
            {collectionRecommendations?.[collection_name]?.map(({ productData, slotId }) => {
              const variant = {
                tags: [
                  productData.is_clearance === 'true' ? 'Clearance' : '',
                  productData.is_new === 'true' ? 'New' : '',
                  productData.is_sale === 'true' ? 'Sale' : '',
                ],
                images: [{ links: productData.image_url }],
                product_name: productData.spu_name,
                list_price: productData.price,
                price: productData.sale_price === '' ? productData.price : productData.sale_price,
              };
              return <Variant key={slotId} variant={variant} url={productData.url.match(/\/products.*/)[0]} />;
            })}
          </Slider>
        </div>
      )}
    </div>
  );
}
