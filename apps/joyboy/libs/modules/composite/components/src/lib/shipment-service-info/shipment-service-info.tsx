'use client';
import {
  Stack,
  Typography,
  Button,
  type Theme,
  IconButton,
  Tooltip,
  Accordion,
  AccordionGroup,
  AccordionDetails,
  AccordionSummary,
} from '@castlery/fortress';
import { InfoThin } from '@castlery/fortress/Icons';
import {
  DisposalPopup,
  CarryUpPopup,
  ShippingServicesPopup,
  ShippingServiceInformation,
} from '@castlery/modules-checkout-components';
import { selectServicesInShipment } from '@castlery/modules-checkout-domain';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { toPrice } from '@castlery/utils';
import { DeliveryServiceTypeEnum, DeliveryServiceItemSchema, ShipmentItemWithLineItemsSchema } from '@castlery/types';
import { ProductTypeMapping, accessInPos } from '@castlery/config';
import { selectPosOrderNumber } from '@castlery/modules-order-domain';

const ShippingFeeInfo = ({
  amount,
  originalShippingFee,
  freeShippingThreshold,
  showFreeShippingTooltip,
}: {
  amount: number;
  originalShippingFee: number;
  freeShippingThreshold: number;
  showFreeShippingTooltip: boolean;
}) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod',
  });
  return (
    <Stack gap={2}>
      <Typography level="subh2">{t('shippingFeeLabel')}</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body1">{'Standard'}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ height: 26 }}>
          {amount < originalShippingFee && (
            <Typography
              level="body1"
              sx={{ textDecoration: 'line-through', color: (theme) => theme.palette.brand.mono[500] }}
            >
              {toPrice(originalShippingFee)}
            </Typography>
          )}
          <Typography level="body1">{toPrice(amount, true)}</Typography>
          {showFreeShippingTooltip && (
            <Tooltip
              title={t('freeShippingFeeTooltip', {
                threshold: toPrice(freeShippingThreshold),
              })}
              theme="dark"
              placement="top-end"
              arrow
            >
              <IconButton sx={{ height: 20, width: 20, minHeight: 20, minWidth: 20 }}>
                <InfoThin />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

// Constants
const SHIPPING_SERVICE_TYPES = [
  DeliveryServiceTypeEnum.STANDARD,
  DeliveryServiceTypeEnum.STANDARD_SERVICE,
  DeliveryServiceTypeEnum.ROOM_OF_CHOICE,
  DeliveryServiceTypeEnum.WHITE_GLOVE,
] as const;

const ACTIVE_SERVICE_STYLE = {
  color: (theme: Theme) => theme.palette.brand.leafGreen[500],
} as const;

export const ShipmentServiceInfo = ({
  shipment,
  isPos = false,
}: {
  shipment: ShipmentItemWithLineItemsSchema;
  isPos?: boolean;
}) => {
  const [openDisposalPopup, setOpenDisposalPopup] = useState(false);
  const [openCarryUpPopup, setOpenCarryUpPopup] = useState(false);
  const [openShippingServicesPopup, setOpenShippingServicesPopup] = useState(false);

  const posOrderNumber = useAppSelector(selectPosOrderNumber);

  const hasBeenGeneratedOrder = accessInPos && !!posOrderNumber;

  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'shippingMethod',
  });

  const { shippingFee, originalShippingFee, freeShippingThreshold, hasFreeShippingThreshold } = useMemo(() => {
    const shippingFee = Number(shipment.amount?.actualShippingFee || 0);
    const originalShippingFee = Number(shipment.amount?.originalShippingFee || 0);
    const freeShippingThresholdValue = shipment.amount?.freeShippingThreshold;
    const hasFreeShippingThreshold =
      freeShippingThresholdValue !== undefined &&
      freeShippingThresholdValue !== null &&
      String(freeShippingThresholdValue).trim() !== '';
    const freeShippingThreshold = Number(freeShippingThresholdValue || 0);
    return { shippingFee, originalShippingFee, freeShippingThreshold, hasFreeShippingThreshold };
  }, [
    shipment.amount?.actualShippingFee,
    shipment.amount?.freeShippingThreshold,
    shipment.amount?.originalShippingFee,
  ]);

  const includeSwatchInShipment = useMemo(() => {
    return shipment.lineItems.some((item) => item.productType === ProductTypeMapping.SWATCH);
  }, [shipment.lineItems]);

  const showFreeShippingTooltip =
    shippingFee === 0 &&
    !includeSwatchInShipment &&
    hasFreeShippingThreshold &&
    Number.isFinite(freeShippingThreshold) &&
    freeShippingThreshold < 99999;

  const servicesInShipment = useAppSelector((state) => selectServicesInShipment(state, shipment.id));

  const disposalService = servicesInShipment[DeliveryServiceTypeEnum.DISPOSAL_SERVICE];
  const carryUpService = servicesInShipment[DeliveryServiceTypeEnum.CARRY_UP_SERVICE];

  const shippingServices = useMemo(() => {
    return SHIPPING_SERVICE_TYPES.reduce((acc, serviceType) => {
      const service = servicesInShipment[serviceType];
      if (service) {
        acc[serviceType] = service;
      }
      return acc;
    }, {} as Record<DeliveryServiceTypeEnum, DeliveryServiceItemSchema>);
  }, [servicesInShipment]);

  const shippingServicesValues = useMemo(() => Object.values(shippingServices), [shippingServices]);
  const showShippingService = shippingServicesValues.length > 0;
  const canUpgradeShippingService = shippingServicesValues.length > 1;

  const activeShippingService = useMemo(
    () => (showShippingService ? shippingServicesValues.find((service) => service?.active) : null),
    [showShippingService, shippingServicesValues]
  );

  const { showDisposalService, activeDisposalService, disposalStartingPrice } = useMemo(() => {
    const showDisposalService = !!disposalService;
    const activeDisposalService = showDisposalService && disposalService?.active ? disposalService : null;

    let disposalStartingPrice = 0;
    const disposalProducts = disposalService?.disposalProducts;

    if (showDisposalService && Array.isArray(disposalProducts) && disposalProducts.length > 0) {
      const prices = disposalProducts
        .flatMap((product) => product.variants)
        .map((variant) => Number(variant.sellingUnitPrice));

      disposalStartingPrice = Math.max(...prices, 0);
    }

    return { showDisposalService, activeDisposalService, disposalStartingPrice };
  }, [disposalService]);

  const activeDisposalServiceDescription = useMemo(() => {
    if (!activeDisposalService?.disposalProducts) return '';

    return activeDisposalService.disposalProducts
      .flatMap((product) =>
        product.variants
          .filter((variant) => variant.quantity > 0)
          .map((variant) => `${variant.variantName} x ${variant.quantity}`)
      )
      .join(', ');
  }, [activeDisposalService]);

  const { showCarryUpService, activeCarryUpService } = useMemo(() => {
    const showCarryUpService = !!carryUpService;
    const activeCarryUpService = showCarryUpService && carryUpService?.active ? carryUpService : null;
    return { showCarryUpService, activeCarryUpService };
  }, [carryUpService]);

  // Event handlers
  const handleOpenDisposalPopup = useCallback(() => setOpenDisposalPopup(true), []);
  const handleCloseDisposalPopup = useCallback(() => setOpenDisposalPopup(false), []);

  const handleOpenCarryUpPopup = useCallback(() => setOpenCarryUpPopup(true), []);
  const handleCloseCarryUpPopup = useCallback(() => setOpenCarryUpPopup(false), []);

  const handleOpenShippingServicesPopup = useCallback(() => setOpenShippingServicesPopup(true), []);
  const handleCloseShippingServicesPopup = useCallback(() => setOpenShippingServicesPopup(false), []);

  if (!showDisposalService && !showCarryUpService && !showShippingService) {
    return null;
  }

  return (
    <>
      <Stack spacing={8}>
        <ShippingFeeInfo
          amount={shippingFee}
          originalShippingFee={originalShippingFee}
          freeShippingThreshold={freeShippingThreshold}
          showFreeShippingTooltip={showFreeShippingTooltip}
        />
        {/* Shipping Service */}
        {showShippingService && activeShippingService && (
          <Stack>
            <Stack gap={2} mb={6}>
              <Typography level="subh2">{t('shippingService.servicesLabel')}</Typography>
              {isPos ? (
                <AccordionGroup>
                  <Accordion>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <AccordionSummary
                        sx={{
                          height: 'fit-content',
                          padding: 0,
                          minHeight: '25px',
                          '& .MuiAccordionSummary-button': {
                            padding: 0,
                            height: 'fit-content',
                            minHeight: 'fit-content',
                          },
                        }}
                      >
                        <Typography level="body1">{activeShippingService.name}</Typography>
                      </AccordionSummary>
                      {/* <Typography level="body1" sx={{ pt: 3, color: 'var(--fortress-palette-neutral-500)' }}>
                        {toPrice(Number(activeShippingService.sellingUnitPrice), true)}
                      </Typography> */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                        <Typography level="body1" sx={{ color: 'var(--fortress-palette-neutral-500)' }}>
                          {toPrice(
                            shipment?.waiveServiceFee ? 0 : Number(activeShippingService.sellingUnitPrice),
                            true
                          )}
                        </Typography>
                        {shipment?.waiveServiceFee && Number(activeShippingService.sellingUnitPrice) !== 0 && (
                          <Typography
                            level="body1"
                            sx={{
                              textDecoration: 'line-through',
                              color: (theme) => theme.palette.brand.mono[500],
                            }}
                          >
                            {toPrice(Number(activeShippingService.sellingUnitPrice), true)}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                    <AccordionDetails>
                      <ShippingServiceInformation type={activeShippingService.serviceType} />
                    </AccordionDetails>
                  </Accordion>
                </AccordionGroup>
              ) : (
                <Stack gap={4}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography level="body1">{activeShippingService.name}</Typography>
                    <Typography level="body1">
                      {toPrice(Number(activeShippingService.sellingUnitPrice), true)}
                    </Typography>
                  </Stack>
                  <ShippingServiceInformation type={activeShippingService.serviceType} />
                </Stack>
              )}
            </Stack>

            {canUpgradeShippingService && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenShippingServicesPopup}
                sx={{ width: 'fit-content' }}
                disabled={hasBeenGeneratedOrder}
              >
                {activeShippingService.serviceType === DeliveryServiceTypeEnum.STANDARD_SERVICE ||
                activeShippingService.serviceType === DeliveryServiceTypeEnum.STANDARD
                  ? t('upgradeService')
                  : t('updateService')}
              </Button>
            )}
          </Stack>
        )}

        {/* Disposal Service */}
        {showDisposalService && (
          <Stack>
            <Typography level="subh2" mb={2} sx={{ textTransform: 'uppercase' }}>
              {disposalService?.name}
            </Typography>

            {activeDisposalService ? (
              <Stack direction="row" justifyContent="space-between" gap={4}>
                <Typography level="body1" sx={ACTIVE_SERVICE_STYLE}>
                  {activeDisposalServiceDescription}
                </Typography>
                <Typography level="body1" sx={ACTIVE_SERVICE_STYLE}>
                  {toPrice(Number(activeDisposalService.totalAmount))}
                </Typography>
              </Stack>
            ) : (
              <Typography level="body1">
                {t('shipment.servicePriceHint', { price: toPrice(disposalStartingPrice) })}
              </Typography>
            )}

            <Stack mt={6}>
              <Button variant="secondary" size="sm" onClick={handleOpenDisposalPopup} disabled={hasBeenGeneratedOrder}>
                {activeDisposalService ? t('updateService') : t('addService')}
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Carry Up Service */}
        {showCarryUpService && (
          <Stack>
            <Typography level="subh2" mb={2} sx={{ textTransform: 'uppercase' }}>
              {carryUpService?.name}
            </Typography>

            {activeCarryUpService ? (
              <Stack direction="row" justifyContent="space-between" gap={4}>
                <Typography level="body1" sx={ACTIVE_SERVICE_STYLE}>
                  {t('shipment.activeCarryUpDescription', {
                    numberOfStories: activeCarryUpService.carryUp?.numberOfStories,
                    numberOfItems: activeCarryUpService.carryUp?.numberOfItems,
                  })}
                </Typography>
                <Typography level="body1" sx={ACTIVE_SERVICE_STYLE}>
                  {toPrice(Number(activeCarryUpService.totalAmount))}
                </Typography>
              </Stack>
            ) : (
              <Typography level="body1">
                {t('shipment.servicePriceHint', { price: toPrice(Number(carryUpService?.sellingUnitPrice)) })}
              </Typography>
            )}

            <Stack mt={6}>
              <Button variant="secondary" size="sm" onClick={handleOpenCarryUpPopup} disabled={hasBeenGeneratedOrder}>
                {activeCarryUpService ? t('updateService') : t('addService')}
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Modals */}
      {showDisposalService && disposalService && (
        <DisposalPopup
          openModal={openDisposalPopup}
          setOpenModal={handleCloseDisposalPopup}
          shipmentId={shipment.id}
          disposalService={disposalService}
        />
      )}

      {showCarryUpService && carryUpService && (
        <CarryUpPopup
          openModal={openCarryUpPopup}
          setOpenModal={handleCloseCarryUpPopup}
          shipmentId={shipment.id}
          carryUpService={carryUpService}
        />
      )}

      {showShippingService && (
        <ShippingServicesPopup
          openModal={openShippingServicesPopup}
          setOpenModal={handleCloseShippingServicesPopup}
          shipmentId={shipment.id}
          shippingServices={shippingServices}
          waiveServiceFee={shipment.waiveServiceFee}
        />
      )}
    </>
  );
};

export default ShipmentServiceInfo;
