'use client';
import React from 'react';
import { Divider, Typography, Skeleton, Card, Box } from '@castlery/fortress';
import type { Order } from '@castlery/types';
import { itemDescription } from './helper';
import { PosDeliveryCalendar } from '../pos-delivery-calendar/pos-delivery-calendar';
import { PosAddDisposalService } from '../../services/pos-add-disposal-service/pos-add-disposal-service';
import { PosAddCarryUpService } from '../../services/pos-add-carry-up-service/pos-add-carry-up-service';
import { FortressImage } from '@castlery/shared-components';
import { TagIcon } from '@castlery/modules-promotion-components';

export interface PosShipmentItemProps {
  disabled?: boolean;
  sort: number;
  shipment: Order['shipments'][0];
  itemGetter: (id: number) => Order['line_items'][0] | null;
  AdditionalServices: React.ReactNode;
  DeliveryServices: React.ReactNode;
  showDateBtn?: boolean;
  isMultiple?: boolean;
  basedState: string;
}

export function PosShipmentItem({
  isMultiple = false,
  disabled = false,
  sort,
  shipment,
  itemGetter,
  AdditionalServices,
  DeliveryServices,
  showDateBtn = false,
  basedState,
}: PosShipmentItemProps) {
  const { manifest, id, available_service_products, line_items } = shipment;
  const showService = Array.isArray(available_service_products) && available_service_products.length > 0;
  const getQty = (id: number) => {
    const item = line_items?.find((i) => i.id === id);
    return item?.quantity || 0;
  };
  return (
    <Card sx={{ padding: 2, gap: 1, opacity: disabled ? 0.2 : 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: showDateBtn ? '110px auto 115px' : '110px auto' },
          columnGap: { xs: 2, md: 0.5, lg: 2 },
          rowGap: 1,
          alignItems: 'center',
        }}
      >
        <Typography level="subh1">Shipment {sort}</Typography>
        <Typography
          level="body2"
          sx={{ textAlign: { xs: 'left', md: 'right', color: (theme) => theme.palette.brand.charcoal[500] } }}
        >
          {shipment.estimated_delivery_date_presentation
            ? `Estimated Delivery Date: ${shipment.estimated_delivery_date_presentation}`
            : `Estimated Dispatch Date:${shipment.estimated_dispatch_date_presentation}`}
        </Typography>
        {showDateBtn && (
          <PosDeliveryCalendar sort={isMultiple ? sort : 0} shipmentId={shipment.id} basedState={basedState} />
        )}
      </Box>
      <Divider />
      {manifest?.map((id) => {
        const item = itemGetter(id);
        const qty = getQty(id);
        if (!item) return null;
        const isFreeGift = item.is_gift || !!item.gift_id;
        return (
          <Box key={id} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 2 }}>
            <Skeleton loading={false}>
              <FortressImage
                src={item.variant?.images?.[0]?.links?.small_x2 || ''}
                alt="product"
                imageWidth="88px"
                imageHeight="88px"
              />
              <Typography
                level="body2"
                sx={{
                  color: (theme) => theme.palette.brand.charcoal[800],
                }}
              >
                {itemDescription(item, qty)}
              </Typography>
              {isFreeGift && <TagIcon text="GIFT" w={41} h={25} sx={{}} textSx={{ fontSize: 12 }} />}

              {item.preferred_stock_location && (
                <Typography level="body2" sx={{ fontWeight: 600 }}>
                  - from {item.preferred_stock_location.name}
                </Typography>
              )}
            </Skeleton>
          </Box>
        );
      })}
      {AdditionalServices}

      {showService && (
        <>
          <Divider />
          <Box sx={{ display: 'grid', rowGap: 1 }}>
            {DeliveryServices}

            <Box
              sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2 }}
            >
              <PosAddDisposalService shipmentId={id} />
              <PosAddCarryUpService shipmentId={id} />
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}

export default PosShipmentItem;
