'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Grid, Button, Divider } from '@castlery/fortress';
import { useGetPaymentMethodsQuery } from '@castlery/modules-checkout-domain';
import { AmountInput } from './amount-input';
import { PayTypesSelector } from './pay-types-selector';
import { PayRemark } from './pay-remark';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { AddStripeMethodButton } from '../add-stripe-method-button/add-stripe-method-button';
import { AddStripeLinkButton } from '../add-stripe-link-button/add-stripe-link-button';
import { AddPaymentButton } from '../add-payment-button/add-payment-button';
import { QuotationButton } from '../quotation-button/quotation-button';
import { enableQuotation } from '@castlery/config';

export interface AddPaymentsProps {
  defaultAmount: number;
  afterAddPayMethod: () => void;
}

const stripeTerminalPaymentTypes = ['Stripe', 'Stripe Terminal Affirm'];

export function AddPayments({ defaultAmount, afterAddPayMethod }: AddPaymentsProps) {
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const { data: payMethods } = useGetPaymentMethodsQuery();
  const [currentMethodId, setCurrentMethodId] = useState<number | null>(payMethods?.[0]?.id ?? null);
  const [comment, setComment] = useState<string>('');
  const [payType, setPayType] = useState<string>('');
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [quotationActive, setQuotationActive] = useState<boolean>(false);

  const currentPayMethod = useMemo(
    () => payMethods?.find((payMethod) => payMethod.id === currentMethodId),
    [payMethods, currentMethodId]
  );

  const disabled = useMemo(() => {
    if (!currentPayMethod?.id) return true;
    if (currentPayMethod?.response_code_required && !comment) {
      return true;
    }
    if (Array.isArray(currentPayMethod?.payment_types) && currentPayMethod.payment_types.length > 0 && !payType) {
      return true;
    }

    return !amount;
  }, [amount, payType, comment, currentPayMethod]);

  const addApiPayload = useMemo(() => {
    return currentPayMethod && orderNumber
      ? {
          orderNumber,
          id: currentPayMethod.id,
          name: currentPayMethod.name,
          amount,
          payType,
          comment,
        }
      : null;
  }, [currentPayMethod, orderNumber, amount, payType, comment]);

  const payMethodChange = (id: number) => setCurrentMethodId(id);
  const payTypeChange = (value: string) => {
    setPayType(value);
  };
  const amountChange = (value: number) => setAmount(() => (value ? Number(value.toFixed(2)) : ''));
  const commentChange = (value: string) => setComment(value);

  const handleClickQuotation = () => {
    setQuotationActive(true);
    setCurrentMethodId(null);
  };

  const handleClickPayMethod = (id?: number) => {
    setQuotationActive(false);
    if (id) {
      payMethodChange(id);
    }
  };

  useEffect(() => {
    const id = payMethods?.[0]?.id ?? null;
    id && setCurrentMethodId(id);
  }, [payMethods, setCurrentMethodId]);

  useEffect(() => {
    setPayType(currentPayMethod?.payment_types?.[0] ?? '');
    setAmount(() => (defaultAmount ? Number(defaultAmount.toFixed(2)) : 0));
    const staticCode = currentPayMethod?.auto_response_code ? (1000 + Math.floor(Math.random() * 8999)).toString() : '';
    setComment(staticCode);
  }, [currentPayMethod, defaultAmount, setPayType, setAmount, setComment]);

  return (
    <React.Fragment>
      <Grid container sx={{ gap: { xs: 1, md: 2 }, mb: 4 }}>
        {payMethods?.map(({ id, name }) => (
          <Grid key={id}>
            <Button
              variant="secondary"
              color={id === currentMethodId ? 'primary' : 'neutral'}
              onClick={() => handleClickPayMethod(id)}
            >
              <Typography level="body2" color={id === currentMethodId ? 'primary' : 'neutral'}>
                {name}
              </Typography>
            </Button>
          </Grid>
        ))}
        {enableQuotation && (
          <Grid key="quotation email">
            <Button
              variant="secondary"
              color={currentMethodId === null ? 'primary' : 'neutral'}
              onClick={handleClickQuotation}
            >
              <Typography level="body2" color={currentMethodId === null ? 'primary' : 'neutral'}>
                Quotation
              </Typography>
            </Button>
          </Grid>
        )}
      </Grid>
      {/* ------------------------------------------------------------------------------------------------ */}
      {/* ---------------------------------- Payment Type Details ----------------------------------------- */}
      <Box sx={{ border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}` }}>
        {!quotationActive && (
          <>
            <AmountInput value={amount} amountChange={amountChange} />
            <Divider />
          </>
        )}
        {Array.isArray(currentPayMethod?.payment_types) && currentPayMethod?.payment_types.length > 1 && (
          <PayTypesSelector
            value={payType}
            payTypeChange={payTypeChange}
            payTypes={currentPayMethod?.payment_types || []}
          />
        )}
        {currentPayMethod?.name !== 'Stripe Payment Link' && (
          <PayRemark value={comment} payMethod={currentPayMethod} commentChange={commentChange} />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1, paddingY: 2 }}>
        <Button variant="tertiary" onClick={afterAddPayMethod}>
          Cancel
        </Button>
        {quotationActive ? (
          <QuotationButton />
        ) : stripeTerminalPaymentTypes.includes(payType) ? (
          <AddStripeMethodButton
            disabled={disabled}
            addApiPayload={addApiPayload}
            afterAddPayMethod={afterAddPayMethod}
          />
        ) : currentPayMethod?.name === 'Stripe Payment Link' ? (
          <AddStripeLinkButton disabled={disabled} orderNumber={orderNumber} afterAddPayMethod={afterAddPayMethod} />
        ) : (
          <AddPaymentButton disabled={disabled} addApiPayload={addApiPayload} afterAddPayMethod={afterAddPayMethod} />
        )}
      </Box>
    </React.Fragment>
  );
}

export default AddPayments;
