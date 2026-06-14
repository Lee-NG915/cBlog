'use client';
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { toPrice } from '@castlery/utils';
import { useMemo } from 'react';
import { AddressV1, OrderPaymentV1, OrderDataV1 } from '@castlery/types';

export enum GridTypeV1 {
  'shippingAddress' = 'shippingAddress',
  'billingAddress' = 'billingAddress',
  'paymentDetails' = 'paymentDetails',
  'assemblyPreference' = 'assemblyPreference',
  'deliveryRemarks' = 'deliveryRemarks',
}

export function AddressInfoV1({ address }: { address: AddressV1 }) {
  return (
    <Stack direction="column" spacing={2}>
      <Typography level="body2">
        {address.firstname} {address.lastname}
      </Typography>
      {address.company && <Typography level="body2">{address.company}</Typography>}
      <Typography level="body2">{address.address1}</Typography>
      {address.address2 && <Typography level="body2">{address.address2}</Typography>}
      <Typography level="body2">
        {address.city} {address.stateName} {address.zipcode}
      </Typography>
      <Typography level="body2">
        {address.phone} {address.alternativePhone ? ` / ${address.alternativePhone}` : ''}
      </Typography>
    </Stack>
  );
}

// AddOnServices is deprecated in V1 - services are now part of shipment.service

export function PaymentDetailsV1({ payments }: { payments: OrderPaymentV1[] }) {
  if (!payments || !Array.isArray(payments) || payments.length === 0) return null;
  const validatedPayments = payments.filter((payment) => {
    return !payment.isVoided && payment.paymentState === 'PAYMENT_STATUS_PAID';
  });
  return (
    <Stack direction="column" spacing={2}>
      {validatedPayments.map((payment) => (
        <Typography level="body2" key={payment.id}>
          {payment.paymentDescription || ''}
        </Typography>
      ))}
    </Stack>
  );
}

export function AssemblyPreferenceV1({ assemblyPreferences }: { assemblyPreferences: string }) {
  if (!assemblyPreferences) return null;
  return (
    <Stack direction="column" spacing={2}>
      <Typography level="body2">{assemblyPreferences}</Typography>
    </Stack>
  );
}

export function OrderBaseInfoV1({ order }: { order: OrderDataV1 }) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const { desktop, tablet } = useBreakpoints();
  const gridMap = useMemo(() => {
    const map = [
      {
        type: GridTypeV1.shippingAddress,
        title: 'shippingAddress',
        data: order.shipAddress,
        hide: !order.shipAddress,
      },
      {
        type: GridTypeV1.billingAddress,
        title: 'billingAddress',
        data: order.billAddress,
        hide: !order.billAddress,
      },
      {
        type: GridTypeV1.assemblyPreference,
        title: 'assemblyPreference',
        data: order.assemblyPreferences,
        hide: !order.assemblyPreferences,
      },
      {
        type: GridTypeV1.deliveryRemarks,
        title: 'deliveryRemarks',
        data: order.note,
        hide: !order.note,
      },
      {
        type: GridTypeV1.paymentDetails,
        title: 'paymentDetails',
        data: order.payments,
        hide: !order.payments || order.payments.length === 0,
      },
    ];
    return desktop
      ? map.filter((item) => !item.hide)
      : map.filter((item) => !item.hide && item.type !== GridTypeV1.paymentDetails);
  }, [order, desktop]);

  return desktop ? (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 6,
        justifyContent: 'space-between',
        alignContent: 'space-between',
      }}
    >
      {gridMap.map((item) => (
        <Box key={item.type} sx={{ maxWidth: 380 }}>
          <Typography level="subh2" mb={2}>
            {(t as any)(item.title)}
          </Typography>

          {item.type === GridTypeV1.shippingAddress && order.shipAddress && (
            <AddressInfoV1 address={order.shipAddress} />
          )}
          {item.type === GridTypeV1.billingAddress && order.billAddress && (
            <AddressInfoV1 address={order.billAddress} />
          )}
          {item.type === GridTypeV1.assemblyPreference && order.assemblyPreferences && (
            <AssemblyPreferenceV1 assemblyPreferences={order.assemblyPreferences} />
          )}
          {item.type === GridTypeV1.deliveryRemarks && order.note && (
            <Typography level="body2">{order.note}</Typography>
          )}
          {item.type === GridTypeV1.paymentDetails && order.payments && <PaymentDetailsV1 payments={order.payments} />}
        </Box>
      ))}
    </Box>
  ) : (
    <Box
      sx={{
        width: '100vw',
        px: tablet ? 6 : 4,
        mt: 2,
      }}
    >
      <AccordionGroup>
        {gridMap.map((item) => (
          <Accordion key={item.type}>
            <AccordionSummary>
              <Typography
                level="subh2"
                sx={{
                  textTransform: 'uppercase',
                }}
              >
                {(t as any)(item.title)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.type === GridTypeV1.shippingAddress && order.shipAddress && (
                <AddressInfoV1 address={order.shipAddress} />
              )}
              {item.type === GridTypeV1.billingAddress && order.billAddress && (
                <AddressInfoV1 address={order.billAddress} />
              )}
              {item.type === GridTypeV1.assemblyPreference && order.assemblyPreferences && (
                <AssemblyPreferenceV1 assemblyPreferences={order.assemblyPreferences} />
              )}
              {item.type === GridTypeV1.deliveryRemarks && order.note && (
                <Typography level="body2">{order.note}</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
      <Box>
        <Typography
          level="subh2"
          sx={{
            textTransform: 'uppercase',
            py: 3,
          }}
        >
          {(t as any)('paymentDetails')}
        </Typography>
        {order.payments && <PaymentDetailsV1 payments={order.payments} />}
      </Box>
    </Box>
  );
}

export default OrderBaseInfoV1;
