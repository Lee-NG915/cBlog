import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toPrice } from 'utils/number';
import ReactPicture from 'components/ReactPicture';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { FrameContext } from 'containers/Frame/FrameContext';
import PropTypes from 'prop-types';
import { LineItemProductImage, LineItemOptions, LineItemName } from 'components/LineItem';
import { process, updateWarranty } from 'redux/modules/cart';
import { useDispatch } from 'react-redux';
import lang from 'utils/lang';
import Bem from 'utils/bem';
import SvgIcon from 'components/SvgIcon';
import { LLT_STATUS } from 'containers/Frame/LLTModal/constants';
import Quantity from 'components/Quantity';
import StrikeoffPrice, { calcItemStrikeThroughPrice } from 'components/StrikeoffPrice';
import { Typography, Stack } from '@castlery/fortress';

import {
  EVENT_MULBERRY_WARRANTY,
  EVENT_PRICE_CHANGED_BANNER_IMPRESSION,
  EVENT_OUT_OF_STOCK_BANNER_IMPRESSION,
} from 'utils/track/constants';

import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import CartItemReview from './CartItemReview';
import FreeGift from './Campaign/FreeGift';
import style from './style.scss';

const CartItemV2 = (props) => {
  const [loading, setLoading] = useState(false);
  const [warrantyBtnIsDisabled, setWarrantyBtnIsDisabled] = useState(false);
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const { item, processing, className, handleShowUndo, showMask, hadInitMulberry = false, fullCart } = props;
  const { desktop } = useBreakpoints();
  const [openChangeGift, setOpenChangeGift] = useState(false);

  const changeQuantity = (num) => {
    const handleProcess = () => {
      dispatch(process(item))
        .then(() => {
          handleShowUndo({ showUndo: true, undoItem: item });
        })
        .catch((error) => frame.openModal('response', { body: error }));
    };

    if (typeof num === 'number') {
      // only show loading animation when change quantity
      setWarrantyBtnIsDisabled(true);
      setLoading(true);
      dispatch(process(item, num))
        .catch((error) => frame.openModal('response', { body: error }))
        .then(() => {
          setLoading(false);
          setWarrantyBtnIsDisabled(false);
        });
    } else if (item.show_leadtime_explanation && item.stock_state !== 'OUT_OF_STOCK') {
      let options = [];
      if (desktop) {
        options = [
          {
            params: {
              frame,
              status: LLT_STATUS.REMOVE_QUERY,
              process: handleProcess,
              deleteItem: item,
            },
          },
          {
            dismiss: () => {
              frame.removeModal();
            },
            position: 'right',
            maxWidth: 500,
            showMask,
          },
        ];
      } else {
        options = [
          {
            params: {
              frame,
              status: LLT_STATUS.REMOVE_QUERY,
              process: handleProcess,
              deleteItem: item,
            },
            subOption: {
              closeSVG: (
                <ReactSVG
                  name="close"
                  style={{
                    height: '12px',
                    width: '12px',
                  }}
                />
              ),
              styleOverflow: 'scroll',
            },
          },
          { height: 60, styleOverflow: 'auto' },
        ];
      }

      frame.openModal('lltNotify', ...options);
    } else {
      dispatch(process(item))
        .then(() => {
          handleShowUndo({ showUndo: true, undoItem: item });
        })
        .catch((error) => frame.openModal('response', { body: error }));
    }
  };
  const [offers, setOffers] = useState(null);
  const mulberryModalRef = useRef(null);
  const firstRender = useRef(true);

  const trackAddWarranty = useCallback(
    (warranty) => {
      dispatch({
        type: EVENT_MULBERRY_WARRANTY,
        result: {
          detailAction: 'add_extended_warranty',
          label: `${warranty.duration_months / 12} years`,
          skuId: item.variant.sku,
          skuName: item.variant.product_name,
          position: 'popup',
          price: warranty.customer_cost,
        },
      });
    },
    [item, dispatch]
  );

  const trackNotInterested = useCallback(() => {
    dispatch({
      type: EVENT_MULBERRY_WARRANTY,
      result: {
        detailAction: 'not_interested_popup',
        label: null,
        skuId: item.variant.sku,
        skuName: item.variant.product_name,
        position: 'popup',
        price: null,
      },
    });
  }, [item, dispatch]);

  useEffect(() => {
    const getOfferAndInitModal = async () => {
      setOffers(null);
      let price = item.variant.list_price;
      let title = item.variant.name;
      let id = item.variant.sku;
      if (item.product_type === 'bundle') {
        title = item.bundle_line_items.reduce((acc, cur) => `${acc}, ${cur.variant.name}`, item.variant.name);
        price = item.bundle_line_items.reduce((acc, cur) => acc + cur.quantity * Number(cur.variant.list_price), 0);
        id = `${item.bundle_line_items.reduce(
          (pre, cur, index) =>
            `${pre}${index === 0 ? '' : '&'}bundle_option[${cur?.bundle_option?.id}]=${cur?.variant?.id}`,
          `${item.variant.sku}?`
        )}`;
      }
      const imagesSrc = item.variant.images.map((image) => ({
        src: image.links.medium,
      }));
      const breadcrumbs = item.variant.product_taxons
        .filter((taxon) => taxon.name !== 'Category' && !taxon.name.includes('Collection'))
        .map((taxon) => ({
          category: taxon.name,
        }));
      const payload = {
        title,
        id,
        price,
        images: imagesSrc,
        meta: {
          breadcrumbs,
        },
      };
      try {
        const mulberryOffers = await window.mulberry.core.getWarrantyOffer(payload);
        if (mulberryOffers?.length > 0) {
          mulberryModalRef.current = await window.mulberry.modal.init({
            offers: mulberryOffers,
            settings: window.mulberry.core.settings,
            onWarrantySelect: async (warranty) => {
              trackAddWarranty(warranty);
              try {
                await updateWarranty(item, warranty.warranty_offer_id)(dispatch);
                mulberryModalRef.current.close();
              } catch (err) {
                mulberryModalRef.current.close();
                frame.openModal('response');
              }
            },
            onWarrantyDecline: () => {
              trackNotInterested();
            },
          });
        } else {
          mulberryModalRef.current = null;
        }

        setOffers(mulberryOffers);
      } catch (e) {
        console.error(
          JSON.stringify(
            {
              message: 'getOfferAndInitModal error',
              error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e),
            },
            null,
            2
          )
        );
      }
    };
    if (__MULBERRY_PUBLIC_TOKEN__ !== '' && hadInitMulberry) {
      if (firstRender.current) {
        getOfferAndInitModal();
        firstRender.current = false;
      } else if (mulberryModalRef.current) {
        mulberryModalRef.current.onWarrantySelect = async (warranty) => {
          trackAddWarranty(warranty);
          try {
            await updateWarranty(item, warranty.warranty_offer_id)(dispatch);
            mulberryModalRef.current.close();
          } catch (err) {
            mulberryModalRef.current.close();
            frame.openModal('response');
          }
        };
        mulberryModalRef.current.onWarrantyDecline = () => {
          trackNotInterested();
        };
      }
    }
  }, [item, frame, dispatch, trackAddWarranty, trackNotInterested, hadInitMulberry]);

  const block = new Bem(style.item).mix(className);
  const isOutdated = item.is_price_outdated || item.is_region_outdated || item.stock_state === 'OUT_OF_STOCK';
  const isGift = item.gift_id;

  const strikeoffPrice = calcItemStrikeThroughPrice(item);

  const isShowStrikeoffPrice = React.useMemo(
    () =>
      strikeoffPrice !== null &&
      +item.variant?.list_price > +item.variant?.price &&
      strikeoffPrice !== +item.amount + (+item.manual_discount_total || 0),
    [strikeoffPrice, item]
  );

  React.useEffect(() => {
    if (!isOutdated) return false;
    if (item.is_price_outdated) {
      dispatch({ type: EVENT_PRICE_CHANGED_BANNER_IMPRESSION });
    } else {
      dispatch({ type: EVENT_OUT_OF_STOCK_BANNER_IMPRESSION });
    }
  }, [isOutdated, item.is_price_outdated, dispatch]);

  return (
    <div className={block}>
      {isOutdated && (
        <div className={block.elm('warning')}>
          {item.is_price_outdated
            ? `Sorry, the price of this product is outdated. Please refresh the cart in order to check out.`
            : __COUNTRY__ === 'SG'
            ? `Sorry, this product is out of stock. Please remove it in order to check out.`
            : `Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.`}
        </div>
      )}

      <div className={block.elm('item').state('is-outdated', isOutdated)}>
        <div className={block.elm('wrapper')}>
          <div>
            <div className={block.elm('imageWrapper')}>
              <LineItemProductImage className={block.elm('image').toString()} lineItem={item} mediaQuery="130px" />
            </div>

            <CartItemReview className={block.elm('review').toString()} lineItem={item} />
          </div>

          <div className={block.elm('main')}>
            {item.show_leadtime_explanation && item.stock_state !== 'OUT_OF_STOCK' && (
              <div className={block.elm('longLeadTime')}>
                <SvgIcon name="long-lead-time-v2" />
                Long delivery time expected
              </div>
            )}

            <div className={block.elm('main').elm('content')}>
              <div>
                <div className={block.elm('name')}>
                  <LineItemName lineItem={item} />
                </div>

                <LineItemOptions lineItem={item} className={block.elm('options').toString()} type="joint" />

                {item.delivery_lead_time_presentation && (
                  <p
                    className={block.elm('leadTime')}
                    dangerouslySetInnerHTML={{
                      __html: `Delivery estimated: ${item.warehouse_name ? `From ${item.warehouse_name}<br />` : ''} ${
                        item.delivery_lead_time_presentation
                      }`,
                    }}
                  />
                )}

                {__MULBERRY_PUBLIC_TOKEN__ !== '' ? (
                  item.warranty_items && Object.keys(item.warranty_items) !== 0 ? (
                    <div className={`${style.removeWarrantyContainer}`}>
                      <div className={`${style.removeWarrantyContainer}__header`}>
                        <span>{`Extended warranty: ${item.warranty_items.duration_months} months`}</span>
                        <span className={`${style.removeWarrantyContainer}__price`}>
                          {toPrice(item.warranty_items.warranty_offer_cost)}
                        </span>
                      </div>
                      <div>
                        <button
                          type="button"
                          disabled={warrantyBtnIsDisabled}
                          onClick={async () => {
                            setWarrantyBtnIsDisabled(true);
                            await updateWarranty(item, null)(dispatch);
                            setWarrantyBtnIsDisabled(false);
                            dispatch({
                              type: EVENT_MULBERRY_WARRANTY,
                              result: {
                                detailAction: 'remove_extended_warranty',
                                label: `${item.warranty_items.duration_months / 12} years`,
                                skuId: item.variant.sku,
                                skuName: item.variant.product_name,
                                position: 'cart',
                                price: item.warranty_items.warranty_offer_price,
                              },
                            });
                          }}
                        >
                          Remove plan
                        </button>
                      </div>
                    </div>
                  ) : offers === null ? (
                    <div className={`${style.addWarrantyContainer}`}>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    offers?.length > 0 &&
                    !isOutdated && (
                      <div className={`${style.addWarrantyContainer}`}>
                        <button
                          type="button"
                          disabled={warrantyBtnIsDisabled}
                          onClick={() => {
                            dispatch({
                              type: EVENT_MULBERRY_WARRANTY,
                              result: {
                                detailAction: 'open_popup',
                                label: null,
                                skuId: item.variant.sku,
                                skuName: item.variant.product_name,
                                position: 'cart',
                                price: null,
                              },
                            });
                            mulberryModalRef.current.open();
                          }}
                        >
                          <span>Add extended warranty</span>
                        </button>
                      </div>
                    )
                  )
                ) : null}

                {item.lead_time_presentation && !item.delivery_lead_time_presentation && (
                  <p
                    className={block.elm('leadTime')}
                    dangerouslySetInnerHTML={{
                      __html: `${lang.t('common.dispatch')} ${
                        item.warehouse_name ? `From ${item.warehouse_name}<br />` : ''
                      } ${item.lead_time_presentation}`,
                    }}
                  />
                )}

                <div className={block.elm('bottom')}>
                  {isGift ? (
                    <div
                      role="button"
                      className={block.elm('changeGift')}
                      onClick={() => {
                        setOpenChangeGift(true);
                      }}
                      style={{
                        textDecoration: 'underline',
                      }}
                    >
                      Change gift
                    </div>
                  ) : (
                    <div className={style.quantity}>
                      <Quantity
                        minusDataSelenium="cart-item-minus"
                        plusDataSelenium="cart-item-plus"
                        onMinus={() => changeQuantity(-item.variant.qty_increments)}
                        onPlus={() => changeQuantity(item.variant.qty_increments)}
                        minusDisabled={
                          !!(
                            item.quantity <= item.variant.min_sale_qty ||
                            item.quantity - item.variant.qty_increments < item.variant.min_sale_qty ||
                            processing ||
                            item.is_free_item
                          )
                        }
                        plusDisabled={
                          !!(
                            item.quantity >= item.variant.max_sale_qty ||
                            item.quantity + item.variant.qty_increments > item.variant.max_sale_qty ||
                            processing ||
                            item.is_free_item ||
                            item.is_swatch
                          )
                        }
                        quantity={loading ? <span className={style.loading}>&nbsp;</span> : item.quantity}
                        className={classNames(`${style.quantity}__btn`, {
                          'is-loading': processing,
                        })}
                      />
                    </div>
                  )}
                  <Stack direction="row" spacing={1}>
                    {!isGift ? (
                      <StrikeoffPrice
                        price={toPrice(+item.amount + (+item.manual_discount_total || 0), true)}
                        strikeoffPrice={toPrice(strikeoffPrice, true)}
                        showStrikeoffPrice={isShowStrikeoffPrice}
                      />
                    ) : (
                      <Typography level="body2" color="#3C101E">
                        FREE
                      </Typography>
                    )}
                  </Stack>
                </div>
              </div>

              <button
                type="button"
                data-selenium="cart-item-remove"
                disabled={processing}
                className={`${block.elm('remove')} btn`}
                onClick={changeQuantity}
              >
                <ReactSVG name="close" />
              </button>
            </div>
          </div>
        </div>
        {item.product_type === 'bundle' && item.product_layout !== 'bundle_overlay' && (
          <div className={block.elm('bundleOptions')}>
            {item.bundle_line_items.map((i) => (
              <div key={i.id}>
                <div className={block.elm('bundleOptions').elm('img')}>
                  {i.variant.images[0] ? (
                    <ReactPicture
                      srcset={i.variant.images[0].links}
                      alt={i.variant.product_name}
                      loader={{
                        ratio: 0.667,
                        widths: [100, 200],
                        sizes: '100px',
                      }}
                      lazy={false}
                    />
                  ) : (
                    <ReactPicture alt={i.variant.product_name} loader={{ ratio: 0.667 }} />
                  )}
                </div>
                <div className={block.elm('bundleOptions').elm('info')}>
                  <p>
                    {i.quantity} x {i.variant.product_name}
                  </p>
                  {i.variant.variant_option_values.map((v) => (
                    <p key={v.option_type_id}>
                      {v.option_type_presentation}: {v.presentation}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isGift && openChangeGift && (
        <FreeGift giftPoolId={item.gift_id} removeFreeGift={() => setOpenChangeGift(false)} isFullCart={!!fullCart} />
      )}
    </div>
  );
};

CartItemV2.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
  processing: PropTypes.bool.isRequired, // disable all buttons if true
  handleShowUndo: PropTypes.func,
  showMask: PropTypes.bool,
  hadInitMulberry: PropTypes.bool,
  fullCart: PropTypes.bool,
};

export default CartItemV2;
