'use client';
import React, { useState } from 'react';
import { Button, Container, Stack, Typography, useDecNiceModal } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectOrderComment, sendQuotationEmail, updateOrderForPay } from '@castlery/modules-checkout-domain';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { CheckCircle } from '@castlery/fortress/Icons';
import { useRouter } from 'next/navigation';
import { enableQuotationSevenDays, posRoutes } from '@castlery/config';
import { useAsyncFn } from 'react-use';
import { createANewPosOrder } from '@castlery/modules-order-services';
import { logger } from '@castlery/observability/client';

export function QuotationButton() {
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const orderComment = useAppSelector(selectOrderComment);
  const { NiceModal } = useDecNiceModal();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleButtonClick = async () => {
    setIsLoading(true);
    await dispatch(
      updateOrderForPay.initiate({
        special_instructions: orderComment || '',
        assembly_preferences: ['free_assembly'],
        exchange_order_number: '',
        trade_partner_id: '',
        number: orderNumber || '',
      })
    );
    await dispatch(sendQuotationEmail.initiate({ number: orderNumber || '' }));
    setIsLoading(false);
    setModalOpen(true);
  };

  const [newOrderState, handleCreateNewOrderClick] = useAsyncFn(async () => {
    try {
      await dispatch(createANewPosOrder());
      await router.replace(posRoutes.products);
      window.location.reload();
    } catch (error) {
      logger.error('Failed to create new POS order after quotation', { error });
    }
  });

  const handleClickNextOrder = () => {
    handleCreateNewOrderClick();
  };

  const renderAfterSevenDays = () => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 7);

    // 获取日期的日、月和年份
    const day = String(futureDate.getDate()).padStart(2, '0');
    const month = String(futureDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const year = futureDate.getFullYear();

    // 格式化为 dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  return (
    <React.Fragment>
      <Button onClick={handleButtonClick} loading={isLoading}>
        Generate Quotation
      </Button>
      <NiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title=""
        fullScreen={true}
        dialogSx={{
          border: 'none',
        }}
        showDefaultFooter={false}
        showCloseBtn={false}
        border={false}
      >
        <Container
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 1,
              }}
            >
              <CheckCircle
                sx={{
                  width: 42,
                  height: 42,
                  marginRight: 1,
                }}
              />
              <Typography
                level="h2"
                sx={{
                  fontSize: 28,
                  color: '#323433',
                }}
              >
                Quotation has been send to customer
              </Typography>
            </Stack>
            <Stack
              sx={{
                marginBottom: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  color: '#323433',
                }}
              >
                Quotation Date
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#323433',
                }}
              >
                {`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
              </Typography>
            </Stack>
            <Stack
              sx={{
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  color: '#323433',
                }}
              >
                Quotation Expiry Date
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#323433',
                }}
              >
                {enableQuotationSevenDays ? renderAfterSevenDays() : orderComment}
              </Typography>
            </Stack>
            <Button loading={newOrderState.loading} onClick={handleClickNextOrder} sx={{ m: 3, width: 173 }}>
              Next Order
            </Button>
          </Stack>
        </Container>
      </NiceModal>
    </React.Fragment>
  );
}
