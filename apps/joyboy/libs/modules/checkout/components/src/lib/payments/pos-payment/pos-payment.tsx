'use client';
import React, { useMemo, useState } from 'react';
import { Card, Typography, Box, IconButton, Button, Drawer, Divider } from '@castlery/fortress';
import { Close, Plus } from '@castlery/fortress/Icons';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { AddPayments } from '../add-payments/add-payments';
import { removePayMethodCommand } from '@castlery/modules-checkout-services';
import { useAsyncFn } from 'react-use';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { toPrice } from '@castlery/utils';
import { selectPayments } from '@castlery/modules-checkout-domain';
import { brandIconsMaps } from './card-brand-svg';
import { FreePayment } from './free-payment';

export function PosPayment() {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.order.order);
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const deliveryError = useAppSelector((state) => state.checkout.deliveryError);
  const payments = useAppSelector(selectPayments);

  const hasError = order?.state !== 'payment' || deliveryError;

  const total = useMemo(() => order?.total, [order]);
  const [open, setOpen] = useState<boolean>(false);
  const toggle = () => setOpen((pre) => !pre);
  const [activeId, setActiveId] = useState<number | null>(null);

  const payableTotal = useMemo(() => {
    if (!order || !order?.total) return 0;
    return Number(order.total) - (order.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0);
  }, [order]);

  const cardBrandIcon = (brand: string | undefined | null) => {
    if (!brand) return null;
    return brandIconsMaps.has(brand) ? brandIconsMaps.get(brand) : '';
  };

  const [removeState, handleRemove] = useAsyncFn(
    async (id: number) => {
      if (!orderNumber) return Promise.resolve();
      setActiveId(id);
      return await dispatch(removePayMethodCommand({ id, number: orderNumber }));
    },
    [dispatch, orderNumber, setActiveId]
  );

  if (Number(total) === 0) return <FreePayment hasError={deliveryError} />;

  return (
    <React.Fragment>
      <Card sx={{ gap: 1 }}>
        <Box sx={{ display: 'flex', flexFlow: 'row wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="subh1">Payment Type</Typography>
          <Typography level="body2">
            Total Sale: <b>{toPrice(Number(total), false)}</b>
          </Typography>
          <Typography level="body2">
            Amount Payable: <b>{toPrice(payableTotal, false)}</b>
          </Typography>
        </Box>
        <Divider />
        {payments?.map((payment) => (
          <Box
            key={payment.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'auto 60px 24px', sm: 'auto 60px 24px' },
              alignItems: 'center',
              columnGap: { xs: 1, sm: 2 },
              paddingX: { xs: 1, sm: 2 },
              paddingY: 0.5,
            }}
          >
            <Typography
              level="body2"
              sx={{ fontWeight: 600 }}
              startDecorator={cardBrandIcon(payment.offline_payment_source?.card_brand)}
            >
              {payment.label}
            </Typography>
            <Typography level="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
              {toPrice(Number(payment.amount), false)}
            </Typography>
            <IconButton
              sx={{ width: 24, height: 24, minHeight: 24, minWidth: 24, ml: 1 }}
              loading={removeState?.loading && activeId === payment.id}
              onClick={() => handleRemove(payment.id)}
            >
              <Close sx={{ width: 24, height: 24 }} color="neutral" />
            </IconButton>
          </Box>
        ))}
        <Box>
          <Button disabled={hasError} startDecorator={<Plus />} onClick={toggle}>
            <Typography level="body2" sx={{ color: 'inherit' }}>
              Add Payment
            </Typography>
          </Button>
        </Box>
      </Card>
      <Box></Box>
      <Drawer open={open} onClose={toggle} title="Add Payment">
        <AddPayments defaultAmount={open ? payableTotal : 0} afterAddPayMethod={() => setOpen(false)} />
      </Drawer>
    </React.Fragment>
  );
}

export default PosPayment;
