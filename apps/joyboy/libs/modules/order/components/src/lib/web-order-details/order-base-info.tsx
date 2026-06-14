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

export enum GridType {
  'shippingAddress' = 'shippingAddress',
  'billingAddress' = 'billingAddress',
  // 'addOnServices' = 'addOnServices',
  'paymentDetails' = 'paymentDetails',
  'assemblyPreference' = 'assemblyPreference',
  'deliveryRemarks' = 'deliveryRemarks',
}

export function AddressInfo({ address }: { address: any }) {
  return (
    <Stack direction="column" spacing={2}>
      <Typography level="body2">
        {address.firstname} {address.lastname}
      </Typography>
      <Typography level="body2">{address.address1}</Typography>
      <Typography level="body2">{address.city}</Typography>
      <Typography level="body2">{address.phone}</Typography>
    </Stack>
  );
}

export function AddOnServices({ services }: { services: any }) {
  if (!services || services.length === 0) return null;
  return (
    <Stack direction="column" spacing={2}>
      {services.map((service) => (
        <Typography level="body2" key={service.product_name}>
          {toPrice(Number(service.price))} for {service.product_name}
        </Typography>
      ))}
    </Stack>
  );
}

export function PaymentDetails({ payments }: { payments: any }) {
  if (!payments || payments.length === 0) return null;
  return (
    <Stack direction="column" spacing={2}>
      {payments.map((payment) => (
        <Typography level="body2" key={payment.id}>
          {payment.description}
        </Typography>
      ))}
    </Stack>
  );
}

export function AssemblyPreference({ assemblyPreferences }: { assemblyPreferences: any[] }) {
  if (!assemblyPreferences || assemblyPreferences.length === 0) return null;
  return (
    <Stack direction="column" spacing={2}>
      {assemblyPreferences.map((item) => (
        <Typography level="body2" key={item.slug}>
          {item.title}
        </Typography>
      ))}
    </Stack>
  );
}

export function OrderBaseInfo({ order }: { order: any }) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const { desktop, tablet } = useBreakpoints();
  const gridMap = useMemo(() => {
    const map = [
      {
        type: GridType.shippingAddress,
        title: 'shippingAddress',
        data: order.ship_address,
        hide: !order.ship_address || Object.keys(order.ship_address).length === 0,
      },
      {
        type: GridType.billingAddress,
        title: 'billingAddress',
        data: order.bill_address,
        hide: !order.bill_address || Object.keys(order.bill_address).length === 0,
      },
      {
        type: GridType.assemblyPreference,
        title: 'assemblyPreference',
        data: order.selected_assembly_preferences,
        hide: !order.selected_assembly_preferences || order.selected_assembly_preferences.length === 0,
      },
      {
        type: GridType.deliveryRemarks,
        title: 'deliveryRemarks',
        data: order.special_instructions,
        hide: !order.special_instructions,
      },
      // {
      //   type: GridType.addOnServices,
      //   title: 'addOnServices',
      //   data: order.addon_service_line_items,
      //   hide:
      //     order.line_items.length === 0 ||
      //     !order.addon_service_line_items ||
      //     order.addon_service_line_items.length === 0,
      // },
      {
        type: GridType.paymentDetails,
        title: 'paymentDetails',
        data: order.payments,
        hide: !order.payments || order.payments.length === 0,
      },
    ];
    return desktop
      ? map.filter((item) => !item.hide)
      : map.filter((item) => !item.hide && item.type !== GridType.paymentDetails);
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
      {desktop &&
        gridMap.map((item) => (
          <Box key={item.type} sx={{ maxWidth: 380 }}>
            <Typography level="subh2" mb={2}>
              {t(item.title)}
            </Typography>

            {item.type === GridType.shippingAddress && <AddressInfo address={order.ship_address} />}
            {item.type === GridType.billingAddress && <AddressInfo address={order.bill_address} />}
            {item.type === GridType.assemblyPreference && (
              <AssemblyPreference assemblyPreferences={order.selected_assembly_preferences} />
            )}
            {item.type === GridType.deliveryRemarks && (
              <Typography level="body2">{order.special_instructions}</Typography>
            )}
            {/* {item.type === GridType.addOnServices && <AddOnServices services={order.addon_service_line_items} />} */}
            {item.type === GridType.paymentDetails && <PaymentDetails payments={order.payments} />}
          </Box>
        ))}
    </Box>
  ) : (
    <Box
      sx={{
        width: '100vw',
        px: tablet ? 6 : 4,
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
                {t(item.title)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.type === GridType.shippingAddress && <AddressInfo address={order.ship_address} />}
              {item.type === GridType.billingAddress && <AddressInfo address={order.bill_address} />}
              {item.type === GridType.assemblyPreference && (
                <AssemblyPreference assemblyPreferences={order.selected_assembly_preferences} />
              )}
              {item.type === GridType.deliveryRemarks && (
                <Typography level="body2">{order.special_instructions}</Typography>
              )}
              {/* {item.type === GridType.addOnServices && <AddOnServices services={order.addon_service_line_items} />} */}
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
          {t('paymentDetails')}
        </Typography>
        <PaymentDetails payments={order.payments} />
      </Box>
    </Box>
  );
}

export default OrderBaseInfo;
