/* eslint-disable no-unsafe-optional-chaining */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import lang from 'utils/lang';
import ReactSVG from 'components/ReactSVG';
import SvgIcon from 'components/SvgIcon';
import classNames from 'classnames';
import DeliveryService from 'components/DeliveryService';
import debounce from 'utils/debounce';
import { toPrice } from 'utils/number';
import { Stack, Typography, Button, useBreakpoints } from '@castlery/fortress';
import { Add } from '@castlery/fortress/Icons';
import { useSelector } from 'react-redux';
import {
  globalFeatureInSG,
  globalFeatureInUS,
  serviceConfig,
  enabledShowPreferredDeliveryButton,
  enabledShowFreeShippingTip,
} from 'config';
import ShipmentItems from './ShipmentItems';
import style from './style.scss';
import AddOnServicePrice from './AddOnServicePrice';
import ChangeDeliveryButton from './ChangeDeliveryButton';

const SERVICE_CONFIG = serviceConfig;

const MultipleItemsB = (
  {
    className,
    index,
    order,
    items,
    shipment,
    deliveryServices,
    selectedDeliveryServices,
    handleSelectDate,
    handleConfirmServices,
    tags,
    shipmentTotal,
    availableServiceTypes,
    orderShipmentOptions,
  },
  { frame }
) => {
  const selectedType = shipment.selected_service_type?.type;

  const selectedItem = availableServiceTypes?.find((item) => item.type === selectedType) || availableServiceTypes?.[0];

  const serviceLevel = availableServiceTypes?.map((item) => +item.amount).sort((a, b) => a - b);

  // const NYDisplayDisposal = React.useMemo(() => order?.country_state === 'NY', [order?.country_state]);

  const [disposalSelectedService, setDisposalSelectedService] = useState([]);

  const { processing } = useSelector((state) => state.cart);

  const { mobile } = useBreakpoints();

  const [showBlur, setShowBlur] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const ref = useRef();

  // only show request button when the shipment is the selected shipment
  // and the shipment has support_late_delivery
  // and the country is not US
  const showRequestButton = useMemo(() => {
    if (!enabledShowPreferredDeliveryButton) return false;
    const targetShipment = orderShipmentOptions?.shipments?.find((option) => option.shipment_id === shipment.id);
    return !!targetShipment?.support_late_delivery;
  }, [orderShipmentOptions?.shipments, shipment.id]);

  // const showRequest = __COUNTRY__  !== 'US' && order.delivery_option_manager.delivery_date_shipment_id === shipment.id;
  const showRequest = useMemo(() => {
    if (order.shipments?.length === 1) {
      return enabledShowPreferredDeliveryButton && showRequestButton;
    }
  }, [order.shipments, showRequestButton]);

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

  useEffect(() => {
    if (ref?.current) {
      const { scrollHeight, clientHeight } = ref.current;

      if (scrollHeight > clientHeight) {
        setShowBlur(true);
        setShowScrollbar(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!processing) {
      frame.removeModal();
    }
  }, [processing]);

  useEffect(() => {
    setDisposalSelectedService(selectedDeliveryServices.filter((service) => service.type === 'disposal'));
  }, [selectedDeliveryServices]);

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

  const selectDate = (date, warehouse) => (
    <span className={`${style.multipleItemsB}__chooseDate`} role="button" onClick={handleSelectDate}>
      <span className={`${style.multipleItemsB}__header__date is-editable`}>{date}</span>
      <span className={`${style.multipleItemsB}__chooseDate__icon`}>
        <SvgIcon name="edit" />
      </span>

      {warehouse && <span> (From {warehouse})</span>}
    </span>
  );

  const handleUpgrade = () => {
    frame.openModal('upgradeShippingMethods', {
      shipment,
    });
  };

  // const showFreeTip =
  // __COUNTRY__ === 'US' &&
  // order.free_shipping_threshold &&
  // availableServiceTypes?.[0]?.original_amount &&
  // +availableServiceTypes?.[0]?.amount === 0 &&
  // shipment.line_items.reduce((acc, cur) => acc + cur.line_item.price * cur.quantity, 0) >=
  //   order.free_shipping_threshold;

  const showFreeTip = React.useMemo(() => {
    if (!enabledShowFreeShippingTip) {
      return false;
    }
    const ship = order?.shipments[index];
    if (ship) {
      const shipThreshold = ship.free_shipping_threshold;
      if (!shipThreshold || Number.isNaN(shipThreshold)) {
        return false;
      }
      const amount = ship.line_items.reduce((acc, cur) => acc + cur.line_item.price * cur.quantity, 0);
      return amount >= Number(shipThreshold);
    }
    return false;
  }, [order?.shipments, index]);

  return (
    <>
      <div
        key={shipment.id}
        className={classNames(`${style.multipleItemsB}`, className, {
          'has-scrollbar': showScrollbar,
          'delivery-service': deliveryServices?.length > 0,
        })}
      >
        <div className={`${style.multipleItemsB}__left`}>
          <div ref={ref} onScrollCapture={handleScroll} className={`${style.multipleItemsB}__left__box`}>
            {showFreeTip && (
              <div className={`${style.multipleItemsB}__freeShipping`}>
                <ReactSVG name="warning-solid" />
                <span>
                  <strong>Standard</strong> Shipping is free when shipment value hits{' '}
                  {toPrice(order.free_shipping_threshold)}
                </span>
              </div>
            )}

            <div className={`${style.multipleItemsB}__header`}>
              <div className={`${style.multipleItemsB}__header__index`}>
                <Typography level="subh1" sx={{ color: '#844025' }}>
                  Shipment {index + 1}
                </Typography>
                <div className={`${style.multipleItemsB}__header__index__desc`}>
                  <span>{shipmentTotal} </span>
                  <span>
                    ({items.length} {items.length > 1 ? 'items' : 'item'})
                  </span>
                </div>
              </div>

              <div className={`${style.multipleItemsB}__header__estimate`}>
                <span>
                  {shipment.estimated_delivery_date_presentation ? (
                    <>
                      <span>Estimated delivery: </span>

                      {showRequest ? (
                        selectDate(shipment.estimated_delivery_date_presentation, shipment.warehouse_name)
                      ) : (
                        <>
                          <span className={`${style.multipleItemsB}__header__date`}>
                            {shipment.estimated_delivery_date_presentation}
                          </span>
                          {shipment.warehouse_name && <span> (From {shipment.warehouse_name})</span>}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span>{lang.t('common.dispatch')}</span>

                      {shipment.warehouse_name && <span> From {shipment.warehouse_name} </span>}

                      {showRequest ? (
                        selectDate(shipment.estimated_dispatch_date_presentation)
                      ) : (
                        <span className={`${style.multipleItemsB}__header__date`}>
                          {shipment.estimated_dispatch_date_presentation}
                        </span>
                      )}
                    </>
                  )}
                </span>

                {showRequestButton && (
                  <>
                    <br />
                    <ChangeDeliveryButton
                      onClick={(e) => {
                        handleSelectDate(e);
                      }}
                    >
                      Request for preferred delivery period
                    </ChangeDeliveryButton>
                  </>
                )}

                {shipment.messages?.map((message, indexMessage) => (
                  <p key={indexMessage} className={`${style.multipleItemsB}__message`}>
                    {message.message}
                  </p>
                ))}
              </div>

              {globalFeatureInSG && (
                <div className={`${style.multipleItemsB}__header__addon`}>
                  Subject to availability of delivery slots. Add-on charges apply for peak hour delivery slots on
                  Saturday. Extra fees charged separately upon confirmation of delivery slot.
                </div>
              )}

              {tags}
            </div>

            {items?.length > 0 && (
              <ShipmentItems
                items={items}
                className={classNames(`${style.multipleItemsB}__items`, {
                  withoutFreeTip: !showFreeTip,
                })}
              />
            )}
          </div>

          {showBlur && <div className={`${style.multipleItemsB}__blur`} />}
        </div>

        {availableServiceTypes?.length > 0 && (
          <div className={`${style.multipleItemsB}__right`}>
            <div className={`${style.multipleItemsB}__right__method`}>
              <div className={`${style.multipleItemsB}__right__name`}>Shipping method</div>

              <div className={`${style.multipleItemsB}__right__title`}>
                <div>{selectedItem?.display_name}</div>
                <AddOnServicePrice
                  shipment={shipment}
                  item={selectedItem}
                  className={`${style.multipleItemsB}__right__title__price`}
                />
              </div>

              <div className={`${style.multipleItemsB}__right__desc`}>
                {SERVICE_CONFIG?.[selectedType] ? (
                  <div className={`${style.shipService}__service__config`}>
                    <ul>
                      {SERVICE_CONFIG[selectedType].support?.map((support, i) => (
                        <li key={i}>
                          <ReactSVG name="check" className="check" />
                          <span>{support}</span>
                        </li>
                      ))}
                      {SERVICE_CONFIG[selectedType].nonsupport?.map((nonsupport, i) => (
                        <li key={i} className={`${style.shipService}__service__config__nonsupport`}>
                          <ReactSVG name="close" />
                          <span>{nonsupport}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>{selectedItem?.display_content}</div>
                )}
              </div>
            </div>

            {serviceLevel?.length > 1 && (
              <div className={`${style.multipleItemsB}__right__btn`} onClick={handleUpgrade} role="button">
                {serviceLevel[serviceLevel.length - 1] === +selectedItem?.amount ? 'Change plan' : 'Upgrade plan'}
              </div>
            )}
          </div>
        )}

        {deliveryServices?.length > 0 && globalFeatureInSG && (
          <div className={`${style.multipleItemsB}__right`}>
            <div className={`${style.multipleItemsB}__right__service`}>
              {deliveryServices.map((serviceProduct) => (
                <DeliveryService
                  key={serviceProduct.type}
                  itemsType="B"
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
      </div>
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
    </>
  );
};

MultipleItemsB.propTypes = {
  className: PropTypes.string,
  index: PropTypes.number,
  order: PropTypes.object,
  items: PropTypes.array,
  shipment: PropTypes.object,
  deliveryServices: PropTypes.array,
  selectedDeliveryServices: PropTypes.array,
  handleSelectDate: PropTypes.func,
  handleConfirmServices: PropTypes.func,
  tags: PropTypes.element,
  shipmentTotal: PropTypes.string,
  availableServiceTypes: PropTypes.array,
  orderShipmentOptions: PropTypes.object,
};
MultipleItemsB.contextTypes = {
  frame: PropTypes.object,
};

export default MultipleItemsB;
