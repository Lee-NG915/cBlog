import React, { useCallback, useEffect, useContext, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Spinner from 'components/Spinner';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { LLT_STATUS } from 'containers/Frame/LLTModal/constants';
import { EVENT_LONG_LEAD_TIME, EVENT_PDP_DETAILS, EVENT_CART_SHIPPING } from 'utils/track/constants';
import { useDispatch, useSelector } from 'react-redux';
import { FrameContext } from 'containers/Frame/FrameContext';
// import { NewGoogleMap } from 'components/GoogleMap';
import { useAsync } from 'react-use';
import { postEstimatesLeadtime } from 'api/product';
import { Link, Box, Typography, Drawer, Divider } from '@castlery/fortress';
import { OpenInNew, Close } from '@castlery/fortress/Icons';

import {
  handleCalculateFee,
  selectCurrentVariantIds,
  selectedCurrentProductStockState,
  STOCK_STATE,
} from 'redux/modules/productOptions';
import { handleUpdateProduct } from 'redux/modules/products';
import { handleChangeShippingLocation, selectedShippingLocation } from 'redux/modules/geolocation';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import {
  enableDisplayProductShipping,
  enableHasShowroom,
  enablePostcode,
  enableWarehouseFrom,
  globalFeatureInUK,
} from 'config';
import { useMobileFrame, useProductOptions, useCurrentVariant, useLocation } from '../hooks/product';
import { ShippingPopup } from './Shipping';
import { useThreeDOrAR } from '../hooks/gallery';
import ProductUSP from './ProductUSP';
import style from './style.scss';

const LongLeadTimeContentAndPopup = () => {
  const variant = useCurrentVariant();
  const { isLongLeadTime } = useProductOptions();
  const stockState = useSelector(selectedCurrentProductStockState);
  const dispatch = useDispatch();
  const [ref, inView] = useInView({
    threshold: 1,
    triggerOnce: true,
  });
  const { desktop } = useBreakpoints();

  const trackLeadTime = useCallback(
    (detailAction) => {
      dispatch({
        type: EVENT_LONG_LEAD_TIME,
        result: {
          detailAction,
          label: `${variant.sku} | ${variant.name}`,
        },
      });
    },
    [dispatch, variant.sku, variant.name]
  );
  const { frame } = useMobileFrame();

  useEffect(() => {
    if (isLongLeadTime && inView) {
      trackLeadTime('pdp_text_impression');
    }
  }, [isLongLeadTime, inView, trackLeadTime]);
  const handleLongLeadTimePopup = useCallback(() => {
    trackLeadTime('pdp_text_click');

    let options = [];
    if (desktop) {
      options = [
        {
          params: { frame, status: LLT_STATUS.SHOW_NOTIFY },
        },
        {
          position: 'right',
          maxWidth: 500,
        },
      ];
    } else {
      options = [
        {
          params: { frame, status: LLT_STATUS.SHOW_NOTIFY },
          subOption: {
            styleOverflow: 'scroll',
          },
        },
        { height: 50, styleOverflow: 'auto' },
      ];
    }

    frame.openModal('lltNotify', ...options);
  }, [frame, trackLeadTime, desktop]);

  if (!(isLongLeadTime && stockState !== STOCK_STATE.OUT_OF_STOCK)) return '';
  return (
    <>
      <div className={`${style.productShipping}__longLeadTime feature-list__content`} ref={ref}>
        <div className="long-lead-time__row">
          <ReactSVG
            name="warn-round"
            style={{
              width: '16px',
              height: '16px',
              'flex-shrink': '0',
            }}
          />
          <span>
            Long delivery time expected,{' '}
            <a role="button" onClick={handleLongLeadTimePopup} data-selenium="llt_expand">
              keep me updated.
            </a>
          </span>
        </div>
      </div>
    </>
  );
};

const ShowroomPopup = ({ open, setOpen }) => {
  const { retailIds, variantId, quantity, selectedVariants } = useProductOptions();
  const { zipcode, city, state } = useSelector(selectedShippingLocation);
  const { mobile } = useBreakpoints();

  const retailAndStockInfo = useAsync(async () => {
    if (!retailIds || retailIds.length === 0 || !open) return [];
    const params = {
      quantity,
      variant_id: variantId,
      zipcode,
      city,
      state,
    };

    // set bundle options if selectedVariants is not empty (bundle)
    if (Object.keys(selectedVariants).length > 0) {
      params.options = {
        bundle_options: Object.keys(selectedVariants).map((key) => ({
          bundle_option_id: key,
          bundle_option_variant_id: selectedVariants[key],
        })),
      };
    }
    const { retail_details = [] } = await postEstimatesLeadtime(params);
    const inStockRetailDetails = retail_details?.filter((a) => a.stock_state !== 'OUT_OF_STOCK') || [];
    const outOfStockRetailDetails = retail_details?.filter((a) => a.stock_state === 'OUT_OF_STOCK') || [];
    return [...inStockRetailDetails, ...outOfStockRetailDetails];
  }, [retailIds, open, quantity, variantId, selectedVariants, zipcode, city, state]);

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      disableCloseButton
      hideCloseButton
      sx={{
        padding: 0,
        '& .MuiDrawer-content': {
          width: mobile ? '100%' : '496px',
        },
        '& .MuiModalClose-root': {
          display: 'none',
        },
        '& .MuiDialogContent-root': {
          paddingTop: mobile ? '16px' : '24px',
        },
      }}
    >
      <section className={style.showroomPopup}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: mobile ? '16px' : '24px',
            paddingTop: 0,
            '& svg': {
              width: '24px',
              height: '24px',
            },
          }}
        >
          <Typography level="h2">Visit our showroom</Typography>
          <Close onClick={() => setOpen(false)} />
        </Box>
        {retailAndStockInfo.loading ? (
          <Spinner />
        ) : (
          retailAndStockInfo.value &&
          retailAndStockInfo.value.map((info, index) => (
            <>
              <article key={info?.id} className={`${style.showroomPopup}__content`}>
                <div className="content__item">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                    sx={{
                      mb: '8px',
                    }}
                  >
                    <Typography level="h3">{info?.name}</Typography>
                    <Link
                      href={info?.map_url}
                      target="_blank"
                      sx={{
                        textDecorationLine: 'underline',
                        flexShrink: 0,
                      }}
                    >
                      Get Directions
                      <OpenInNew
                        style={{
                          marginLeft: '8px',
                          color: '#A45B37',
                        }}
                      />
                    </Link>
                  </Box>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: info?.address,
                    }}
                  />
                </div>
                <div className="content__item">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                      mb: '8px',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15.65 16.35L16.35 15.65L12.5 11.8V7H11.5V12.2L15.65 16.35ZM12 21C10.75 21 9.57933 20.7627 8.488 20.288C7.396 19.8127 6.446 19.1707 5.638 18.362C4.82933 17.554 4.18733 16.604 3.712 15.512C3.23733 14.4207 3 13.25 3 12C3 10.75 3.23733 9.579 3.712 8.487C4.18733 7.39567 4.82933 6.44567 5.638 5.637C6.446 4.829 7.396 4.18733 8.488 3.712C9.57933 3.23733 10.75 3 12 3C13.25 3 14.421 3.23733 15.513 3.712C16.6043 4.18733 17.5543 4.829 18.363 5.637C19.171 6.44567 19.8127 7.39567 20.288 8.487C20.7627 9.579 21 10.75 21 12C21 13.25 20.7627 14.4207 20.288 15.512C19.8127 16.604 19.171 17.554 18.363 18.362C17.5543 19.1707 16.6043 19.8127 15.513 20.288C14.421 20.7627 13.25 21 12 21ZM12 20C14.2167 20 16.1043 19.221 17.663 17.663C19.221 16.1043 20 14.2167 20 12C20 9.78333 19.221 7.89567 17.663 6.337C16.1043 4.779 14.2167 4 12 4C9.78333 4 7.896 4.779 6.338 6.337C4.77933 7.89567 4 9.78333 4 12C4 14.2167 4.77933 16.1043 6.338 17.663C7.896 19.221 9.78333 20 12 20Z"
                        fill="#212121"
                      />
                    </svg>
                    <Typography
                      level="subh2"
                      style={{
                        fontWeight: '600',
                      }}
                    >
                      Opening Hours
                    </Typography>
                  </Box>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: info?.operating_hours,
                    }}
                  />
                </div>
                <div className="content__item">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                      mb: '8px',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6.5 20V4H12.5C13.8667 4 15.0417 4.49167 16.025 5.475C17.0083 6.45833 17.5 7.63333 17.5 9C17.5 10.3667 17.0083 11.5417 16.025 12.525C15.0417 13.5083 13.8667 14 12.5 14H8.5V20H6.5ZM8.5 12H12.55C13.3667 12 14.071 11.7043 14.663 11.113C15.2543 10.521 15.55 9.81667 15.55 9C15.55 8.18333 15.2543 7.479 14.663 6.887C14.071 6.29567 13.3667 6 12.55 6H8.5V12Z"
                        fill="#A45B37"
                      />
                    </svg>
                    <Typography
                      level="subh2"
                      style={{
                        fontWeight: '600',
                      }}
                    >
                      Free Parking Available
                    </Typography>
                  </Box>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: info?.parking_info,
                    }}
                  />
                </div>
                <Typography
                  level="body2"
                  style={{ color: info?.stock_state === 'OUT_OF_STOCK' ? '#CC0025' : '#00A676' }}
                >
                  {info?.stock_state === 'OUT_OF_STOCK'
                    ? 'Item is unavailable in showroom'
                    : 'Item is available in showroom'}
                </Typography>
              </article>
              {index !== retailAndStockInfo.value.length - 1 && <Divider />}
            </>
          ))
        )}
      </section>
    </Drawer>
  );
};
ShowroomPopup.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

const StockAndShowRoom = () => {
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const { retailIds } = useProductOptions();
  const stockState = useSelector(selectedCurrentProductStockState);
  const [{ isSupportThreeD, uid }] = useThreeDOrAR();
  const [openShowroomDrawer, setOpenShowroomDrawer] = useState(false);
  const handleGetDirections = () => {
    setOpenShowroomDrawer(true);
  };
  const renderContent = () => (
    <div className="feature-list__content">
      {/* showroom */}
      {retailIds && retailIds.length ? (
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Typography
            level="caption1"
            sx={{
              marginRight: '8px',
            }}
          >
            Item is available for viewing in showroom
          </Typography>
          <Box display="flex" alignItems="center">
            <Link className="select-input--underline" onClick={handleGetDirections} role="button">
              Find Showroom
            </Link>
            <svg
              style={{ width: '20px', height: '20px', margin: 'auto' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 21"
              fill="none"
            >
              <path
                d="M8.08333 14.9167L7.5 14.3334L11.3333 10.5L7.5 6.66671L8.08333 6.08337L12.5 10.5L8.08333 14.9167Z"
                fill="#A45B37"
              />
            </svg>
          </Box>
        </Box>
      ) : enableHasShowroom ? (
        `Item is unavailable for viewing in showroom.`
      ) : null}
      {/* 360  */}
      {uid && isSupportThreeD ? (
        <div>
          <a
            href="#dimensions-3d"
            className="select-input--underline"
            onClick={() => {
              dispatch({
                type: EVENT_PDP_DETAILS,
                result: {
                  detailAction: 'view_click',
                  label: '360_view',
                },
              });
            }}
            role="button"
          >
            Explore 360 View
          </a>
        </div>
      ) : (
        ''
      )}
      <ShowroomPopup frame={frame} open={openShowroomDrawer} setOpen={setOpenShowroomDrawer} />
    </div>
  );

  const renderStockState = () => {
    switch (stockState) {
      case STOCK_STATE.OUT_OF_STOCK:
        return (
          <>
            <div className="feature-list__icon">
              <ReactSVG name="out-of-stock" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="feature-list__desc">
              <div className="feature-list__title feature-list__title--error">Unavailable</div>
              {renderContent()}
            </div>
          </>
        );

      case STOCK_STATE.LOW_IN_STOCK: {
        if (globalFeatureInUK) {
          return (
            <>
              <div className="feature-list__icon">
                <ReactSVG name="selling-fast" style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="feature-list__desc">
                <div className="feature-list__title feature-list__title--selling-fast">Selling Fast</div>
                {renderContent()}
              </div>
            </>
          );
        }
        return (
          <>
            <div className="feature-list__icon">
              <ReactSVG name="low-in-stock" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="feature-list__desc">
              <div className="feature-list__title feature-list__title--warning">Low in stock</div>
              {renderContent()}
            </div>
          </>
        );
      }
      default:
        return (
          <>
            <div className="feature-list__icon">
              <ReactSVG name="in-stock-green" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="feature-list__desc">
              <div className="feature-list__title feature-list__title--success">In stock</div>
              {renderContent()}
            </div>
          </>
        );
    }
  };

  return <>{renderStockState()}</>;
};

const ProductShipping = () => {
  const dispatch = useDispatch();

  const { estimating, warehouseName, deliveryLeadTimeDisplay } = useProductOptions();
  const stockState = useSelector(selectedCurrentProductStockState);
  const shippingLocation = useSelector(selectedShippingLocation);
  const location = useLocation();

  const currentVariantIds = useSelector(selectCurrentVariantIds);
  const { desktop } = useBreakpoints();

  const hashVal = location?.hash?.substring(1);

  useEffect(() => {
    dispatch(handleCalculateFee());
  }, [dispatch, hashVal, shippingLocation.zipcode, currentVariantIds]);

  const { frame } = useMobileFrame();

  const handleSubmit = useCallback(
    async (locationValue) => {
      await dispatch(handleUpdateProduct({ locationFromContext: location, shippingLocation: locationValue }));
      dispatch(handleChangeShippingLocation(locationValue));
      frame.removeModal();
    },
    [dispatch, frame, location]
  );

  const handleZipCodeClick = useCallback(() => {
    dispatch({
      type: EVENT_CART_SHIPPING,
      result: {
        action: 'click_default_zipcode',
      },
    });
    const content = (
      <ShippingPopup
        onSubmit={handleSubmit}
        title="Shipping Location"
        description={`Enter your location ${
          enablePostcode ? 'postcode' : 'zip code'
        } to get an accurate estimate shipping info.`}
        useGooglePlace={false}
      />
    );

    if (!desktop) {
      frame.openModal(
        'mobileModal',
        {
          content,
        },
        { height: 40, styleOverflow: 'initial' }
      );
    } else {
      frame.addModal(content, 'side', {
        dismiss: () => frame.removeModal(),
        position: 'right',
        maxWidth: 500,
      });
    }
  }, [dispatch, handleSubmit, desktop, frame]);

  return (
    <>
      <div className={style.productShipping}>
        {enableDisplayProductShipping && (
          /* --------------------------------- zipcode -------------------------------- */
          <div className="feature-list">
            <div className="feature-list__icon">
              <ReactSVG name="map-pin" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="feature-list__desc">
              <div className="select">
                Ship to{' '}
                <a className="select-input--underline" onClick={handleZipCodeClick} role="button">
                  {`${shippingLocation.city ? `${shippingLocation.city}, ` : ''}${shippingLocation.zipcode}`}
                  <ReactSVG
                    className="select-icon"
                    name="custom-arrow"
                    style={{ width: '10px', height: '10px', stroke: 'black' }}
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        {!estimating ? (
          <>
            {/* ------------------------------- stock state + showroom + 360 ------------------------------ */}
            <div className="feature-list">
              <StockAndShowRoom />
            </div>

            {stockState !== STOCK_STATE.OUT_OF_STOCK && (
              <>
                {/* -------------------------------- warehouse ------------------------------- */}
                {warehouseName && enableWarehouseFrom && (
                  <div className="feature-list">
                    <div className="feature-list__icon">
                      <ReactSVG name="package" style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div className="feature-list__desc">Ship from {warehouseName}</div>
                  </div>
                )}
                {/* -------------------------------- delivery ------------------------------- */}
                {deliveryLeadTimeDisplay && (
                  <div className="feature-list">
                    <div className="feature-list__icon">
                      <ReactSVG name="new-calendar" style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div className="feature-list__desc">
                      <span>
                        {deliveryLeadTimeDisplay && 'Delivery estimated '}
                        <span className="feature-list__desc--bold">{deliveryLeadTimeDisplay}</span>
                        <LongLeadTimeContentAndPopup />
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '101px',
              position: 'relative',
            }}
          >
            <Spinner />
          </div>
        )}
        {/* ----------------------------------- USP ---------------------------------- */}
        <ProductUSP />
      </div>
    </>
  );
};

export default ProductShipping;
