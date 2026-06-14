import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import lang from 'utils/lang';
import ReactSVG from 'components/ReactSVG';
import DeliveryService from 'components/DeliveryService';
import classNames from 'classnames';
import debounce from 'utils/debounce';
import { toPrice } from 'utils/number';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Stack, Typography, Button } from '@castlery/fortress';
import { Add } from '@castlery/fortress/Icons';
import { useMobileFrame } from 'containers/Product/hooks/product';
import { useSelector } from 'react-redux';
import {
  enableDisplayItemsInA,
  globalFeatureInUS,
  enabledShowPreferredDeliveryButton,
  enabledShowFreeShippingTip,
  enabledShowECOTipOnTop,
} from 'config';
import ShipmentService from './ShipmentService';
import ShipmentItems from './ShipmentItems';
import style from './style.scss';
import EcoDeliveryTip from './EcoDeliveryTip';
import ChangeDeliveryButton from './ChangeDeliveryButton';

const MultipleItemsA = ({
  order,
  items,
  shipment,
  deliveryServices,
  selectedDeliveryServices,
  handleSelectDate,
  handleConfirmServices,
  tags,
  isSingleDate,
  shipmentTotal,
  availableServiceTypes,
  orderShipmentOptions,
}) => {
  const [showBlur, setShowBlur] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [disposalSelectedService, setDisposalSelectedService] = useState([]);
  const ref = useRef();
  const { desktop, mobile } = useBreakpoints();
  const { frame } = useMobileFrame();
  const { processing } = useSelector((state) => state.cart);

  const showRequestButton = useMemo(() => {
    if (!enabledShowPreferredDeliveryButton) return false;
    const targetShipment = orderShipmentOptions?.shipments?.find((option) => option.shipment_id === shipment.id);
    return targetShipment?.support_late_delivery || false;
  }, [orderShipmentOptions?.shipments, shipment.id]);

  const showFreeTip = React.useMemo(() => {
    if (order?.shipments && order?.item_total) {
      const shipThreshold = order.shipments[0].free_shipping_threshold;
      if (!enabledShowFreeShippingTip || !shipThreshold || Number.isNaN(shipThreshold)) {
        return false;
      }
      return Number(order.item_total) >= Number(shipThreshold);
    }
    return false;
  }, [order?.shipments, order?.item_total]);

  // const NYDisplayDisposal = React.useMemo(() => order?.country_state === 'NY', [order?.country_state]);

  useEffect(() => {
    if (!processing) {
      frame.removeModal();
    }
  }, [processing]);

  useEffect(() => {
    setDisposalSelectedService(selectedDeliveryServices.filter((service) => service.type === 'disposal'));
  }, [selectedDeliveryServices]);

  const handleScroll = debounce(() => {
    if (ref?.current) {
      const { scrollTop, clientHeight, scrollHeight } = ref.current;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        setShowBlur(false);
      } else {
        setShowBlur(true);
      }
    }
  }, 40);

  const renderNYDisposalServiceList = useCallback(() => {
    if (disposalSelectedService.length === 0) {
      return null;
    }
    let disposalText = '';
    let disposalPrice = 0;
    disposalSelectedService.forEach((item, index) => {
      disposalText += `${item.quantity} x ${item.name}${index !== disposalSelectedService.length - 1 ? ', ' : ''}`;
      disposalPrice += item.total;
    });
    disposalText += `: ${toPrice(disposalPrice)}`;
    return <Typography>{disposalText}</Typography>;
  }, [disposalSelectedService]);

  useEffect(() => {
    if (ref?.current) {
      const { scrollHeight, clientHeight } = ref.current;

      if (scrollHeight > clientHeight) {
        setShowBlur(true);
        setShowScrollbar(true);
      }
    }
  }, []);

  return (
    <div className={`${style.multipleItemsA}__collapse`}>
      <div className={`${style.multipleItemsA}__title`}>Shipping method</div>
      {enabledShowECOTipOnTop && <EcoDeliveryTip sx={{ mb: 2.5 }} />}
      <div
        className={classNames(`${style.multipleItemsA}__collapse__content`, {
          'no-border': __COUNTRY__ === 'SG',
          'has-scrollbar': showScrollbar,
        })}
      >
        <div
          ref={ref}
          onScrollCapture={handleScroll}
          className={classNames(`${style.multipleItemsA}__collapse__content__box`, {
            showBlur,
          })}
        >
          <div
            className={classNames(`${style.multipleItemsA}__collapse__header`, {
              'no-padding': __COUNTRY__ === 'SG',
              'without-content': __COUNTRY__ === 'SG' && deliveryServices?.length === 0,
              'has-scrollbar': showScrollbar,
            })}
          >
            <div className={`${style.multipleItemsA}__collapse__header__box`}>
              <div className={`${style.multipleItemsA}__collapse__header__estimate`}>
                <span>
                  {shipment.estimated_delivery_date_presentation ? (
                    <>
                      <span>Estimated delivery: </span>
                      <span className={`${style.multipleItemsA}__collapse__header__date`}>
                        {shipment.estimated_delivery_date_presentation}
                      </span>
                      {shipment.warehouse_name && <span> (From {shipment.warehouse_name})</span>}
                    </>
                  ) : (
                    <>
                      <span>{lang.t('common.dispatch')}</span>
                      {shipment.warehouse_name && <span> From {shipment.warehouse_name} </span>}
                      <span className={`${style.multipleItemsA}__collapse__header__date`}>
                        {shipment.estimated_dispatch_date_presentation}
                      </span>
                    </>
                  )}
                </span>

                {showRequestButton && (
                  <>
                    <br />
                    <ChangeDeliveryButton onClick={handleSelectDate}>
                      {isSingleDate ? 'Request a delivery date' : 'Request for preferred delivery period'}
                    </ChangeDeliveryButton>
                  </>
                )}
              </div>

              {desktop && __COUNTRY__ !== 'SG' && (
                <div className={`${style.multipleItemsA}__collapse__header__desc`}>
                  <span>{shipmentTotal} </span>
                  <span>
                    ({items.length} {items.length > 1 ? 'items' : 'item'})
                  </span>
                </div>
              )}
            </div>

            <div>
              {shipment.messages?.map((message, indexMessage) => (
                <p key={indexMessage} className={`${style.multipleItemsA}__collapse__message`}>
                  {message.message}
                </p>
              ))}
            </div>

            {__COUNTRY__ === 'SG' && (
              <div className={`${style.multipleItemsA}__collapse__header__addon`}>
                Subject to availability of delivery slots. Add-on charges apply for peak hour delivery slots on
                Saturday. Extra fees charged separately upon confirmation of delivery slot.
              </div>
            )}

            {tags}
            {!enabledShowECOTipOnTop && <EcoDeliveryTip />}
          </div>

          {items?.length > 0 && enableDisplayItemsInA && (
            <ShipmentItems items={items} className={classNames(`${style.multipleItemsA}__items`)} />
          )}
        </div>
      </div>

      {showFreeTip && (
        <div className={`${style.multipleItemsA}__collapse__freeShipping`}>
          <ReactSVG name="warning-solid" />
          <span>
            <strong>Standard</strong> Shipping is free when shipment value hits {toPrice(order.free_shipping_threshold)}
          </span>
        </div>
      )}

      <div className={`${style.multipleItemsA}__collapse__service`}>
        <div>
          {availableServiceTypes?.length > 0 && <ShipmentService shipment={shipment} />}

          {deliveryServices?.length > 0 && __COUNTRY__ === 'SG' && (
            <div className={`${style.multipleItemsA}__collapse__deliveryServices-container`}>
              <div className={`${style.multipleItemsA}__collapse__deliveryServices`}>
                {deliveryServices.map((serviceProduct) => (
                  <DeliveryService
                    key={serviceProduct.type}
                    itemsType="A"
                    className={`${style.multipleItemsA}__collapse__deliveryService`}
                    serviceProduct={serviceProduct}
                    handleConfirmServices={(type, services) =>
                      handleConfirmServices(shipment, type, services, selectedDeliveryServices)
                    }
                    selectedService={selectedDeliveryServices.filter((s) => s.type === serviceProduct.type)}
                  />
                ))}
              </div>
            </div>
          )}
          {deliveryServices?.length > 0 && globalFeatureInUS && (
            <Stack
              sx={{
                marginTop: mobile ? 1 : 0,
                marginBottom: mobile ? 1 : 0,
                boxSizing: 'border-box',
                width: '100%',
                border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                borderTop: mobile ? (theme) => `1px solid ${theme.palette.brand.wheat[500]}` : 'none',
                padding: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '24.5px',
                  color: (theme) => theme.palette.brand.charcoal[800],
                  marginBottom: 1,
                }}
              >
                Additional Services
              </Typography>
              {disposalSelectedService.length > 0 && !mobile && (
                <Stack
                  sx={{
                    position: 'relative',
                    paddingLeft: 2,
                    paddingRight: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      minWidth: '200px',
                      marginRight: 3,
                    }}
                  >
                    Disposal Service
                  </Typography>
                  {renderNYDisposalServiceList()}
                  <Button
                    sx={{
                      position: 'absolute',
                      right: 0,
                      maxWidth: '24px !important',
                      minHeight: '24px !important',
                      background: 'transparent',
                      padding: 0,
                      svg: {
                        minWidth: 16,
                        height: 16,
                        fill: (theme) => theme.palette.brand.wheat[500],
                      },
                      '&:hover': {
                        background: 'transparent',
                      },
                      '&:focus': {
                        boxShadow: 'none',
                      },
                      '&:active': {
                        background: 'transparent',
                      },
                    }}
                    onClick={() => {
                      handleConfirmServices(shipment, 'disposal', [], selectedDeliveryServices);
                    }}
                  >
                    <ReactSVG name="close" />
                  </Button>
                </Stack>
              )}
              {disposalSelectedService.length > 0 && mobile && (
                <Stack
                  sx={{
                    display: 'flex',
                    paddingLeft: 2,
                    paddingRight: 2,
                    marginBottom: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      lineHeight: '24.5px',
                      marginBottom: 1,
                    }}
                  >
                    Disposal Service
                  </Typography>
                  {disposalSelectedService.map((item, index) => (
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        paddingRight: 2,
                        marginBottom: 1,
                      }}
                      key={index}
                    >
                      <Typography
                        sx={{
                          fontSize: '14px',
                          lineHeight: '24.5px',
                        }}
                      >
                        {item.quantity} x {item.name}: {toPrice(item.total)}
                      </Typography>
                      <Button
                        sx={{
                          maxWidth: '24px !important',
                          minHeight: '24px !important',
                          background: 'transparent',
                          padding: 0,
                          svg: {
                            minWidth: 16,
                            height: 16,
                            fill: (theme) => theme.palette.brand.wheat[500],
                          },
                          '&:hover': {
                            background: 'transparent',
                          },
                          '&:focus': {
                            boxShadow: 'none',
                          },
                          '&:active': {
                            background: 'transparent',
                          },
                        }}
                        onClick={() => {
                          const newArr = disposalSelectedService.filter((service) => service.sku !== item.sku);
                          handleConfirmServices(shipment, 'disposal', newArr, selectedDeliveryServices);
                        }}
                      >
                        <ReactSVG name="close" />
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}
              <Button
                variant="secondary"
                sx={{
                  background: 'transparent',
                  width: 'fit-content',
                  color: '#3C101E',
                  backgroundColor: 'transparent',
                  '--variant-outlinedHoverBg': '#63404B',
                  '--variant-outlinedActiveBg': '#3C101E',
                  '--variant-outlinedHoverColor': '#F6F3E7',
                  '--variant-outlinedColor': '#3C101E',
                  '--variant-outlinedHoverBorder': '#3C101E',
                  '--variant-outlinedActiveBorder': '#3C101E',
                  '--variant-outlinedActiveColor': '#F6F3E7',
                  textDecoration: 'none',
                  borderColor: '#3C101E',
                  transition: '0.2s ease-out',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  svg: {
                    fill: '#3C101E',
                  },
                  '&:active': {
                    color: '#F6F3E7',
                  },
                  '&:hover': {
                    svg: {
                      fill: '#F6F3E7',
                    },
                  },
                  fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  '@media (min-width: 0px) and (max-width: 600px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 601px) and (max-width: 900px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 901px)': {
                    fontSize: '0.875rem',
                  },
                }}
                onClick={() => {
                  const disposalService = deliveryServices.find((service) => service.type === 'disposal');
                  frame.openModal('deliveryServicesDetail', {
                    serviceProduct: disposalService,
                    selectedService: disposalSelectedService,
                    handleConfirmServices: (type, services) => {
                      handleConfirmServices(shipment, type, services, selectedDeliveryServices);
                    },
                  });
                }}
              >
                <Add />
                Disposal Service
              </Button>
            </Stack>
          )}
        </div>
      </div>
    </div>
  );
};

MultipleItemsA.propTypes = {
  order: PropTypes.object,
  items: PropTypes.array,
  shipment: PropTypes.object,
  deliveryServices: PropTypes.array,
  selectedDeliveryServices: PropTypes.array,
  handleSelectDate: PropTypes.func,
  handleConfirmServices: PropTypes.func,
  tags: PropTypes.element,
  isSingleDate: PropTypes.bool,
  shipmentTotal: PropTypes.string,
  availableServiceTypes: PropTypes.array,
  orderShipmentOptions: PropTypes.object,
};

export default MultipleItemsA;
