'use client';
import React, { useState, useMemo } from 'react';
import { Stack, Typography, Button, Drawer, Divider, IconButton } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { Close, Search } from '@castlery/fortress/Icons';
import { TradePartnerSelectorContent } from './trade-partner-selector-content';
import { useGetTradePartnersQuery } from '@castlery/modules-checkout-domain';
import { updateTradePartnerId } from '@castlery/modules-checkout-services';

export function PosTradePartner() {
  const dispatch = useAppDispatch();
  const { currentData: tradePartners } = useGetTradePartnersQuery();
  const tradePartnerId = useAppSelector((state) => state.checkout.tradePartnerId);
  const [open, setOpen] = useState(false);
  const data = useMemo(
    () =>
      tradePartners?.map((item) => ({
        label: `${item.companyname} - ${item.firstname}  ${item.lastname} - ${item.entityid}`,
        id: item.entityid,
      })) || [],
    [tradePartners]
  );
  const partnerChange = (id: string) => {
    dispatch(updateTradePartnerId(id));
    setOpen(false);
  };
  const tradePartnerName = useMemo(
    () => data?.find((item) => item.id === tradePartnerId)?.label ?? '',
    [data, tradePartnerId]
  );
  const handleRemove = () => {
    dispatch(updateTradePartnerId(''));
  };
  return (
    <React.Fragment>
      {tradePartnerId ? (
        <>
          <Divider />
          <Stack sx={{ background: (theme) => theme.palette.brand.wheat[50], paddingX: { sm: 2, lg: 3 }, paddingY: 1 }}>
            <Typography level="subh2">Trade Partner</Typography>
            <Typography
              level="caption2"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              endDecorator={
                <IconButton onClick={handleRemove} sx={{ minWidth: 24, minHeight: 24, p: 0 }}>
                  <Close sx={{ width: 24, height: 24 }} />
                </IconButton>
              }
            >
              {tradePartnerName}
            </Typography>
          </Stack>
        </>
      ) : (
        <Button
          variant="secondary"
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            textAlign: 'left',
            paddingX: { sm: 2, lg: 3 },
            marginY: 2,
          }}
          onClick={() => setOpen(true)}
        >
          <Typography
            level="caption1"
            sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}
            startDecorator={
              <Search sx={{ width: 24, height: 24, color: (theme) => theme.palette.brand.charcoal[500] }} />
            }
          >
            Search for Trade Partner
          </Typography>
        </Button>
      )}

      <Drawer
        title="Select Trade Partner"
        showCloseButton
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <TradePartnerSelectorContent tradePartners={data} partnerChange={partnerChange} />
      </Drawer>
    </React.Fragment>
  );
}

export default PosTradePartner;
