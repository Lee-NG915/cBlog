'use client';
import { Order, setDetailJumpPage } from '@castlery/modules-user-domain';
import * as React from 'react';
import { Box, Button, Grid, useBreakpoints } from '@castlery/fortress';
import { useRouter } from 'next/navigation';
import { SalesOrderCell } from './components/sales-order-cell';
import { EcEnv } from '@castlery/config';
import { SalesOrderCellProps } from './components/sales-order-cell';
import { formatTime } from '@castlery/modules-user-services';
import { SaleAddressCard } from './components/address';
import { DetailsFooterV2 } from './components/details-footerV2';
import { SalesDetailsTableV2 } from './components/sales-details-tableV2';
import { useAppDispatch } from '@castlery/shared-redux-store';
/* eslint-disable-next-line */
export interface SalesOrderDetailsProps {
  detailInfo: Order;
  currentPage: number;
}

export function SalesOrderDetails(props: SalesOrderDetailsProps) {
  const localCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();
  const router = useRouter();
  const { detailInfo, currentPage } = props;
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const cellInfo: SalesOrderCellProps[] = React.useMemo(() => {
    return [
      {
        cellInfo: {
          label: 'Order No:',
          value: detailInfo.reference_number,
        },
        align: 'row',
        xs: !mobile ? 6 : 12,
        sx: !mobile
          ? {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: '1px',
                backgroundColor: '#eee',
              },
            }
          : '',
      },
      {
        cellInfo: {
          label: 'Order Placed:',
          value: formatTime(detailInfo.completed_at),
        },
        align: 'row',
        xs: !mobile ? 6 : 12,
        sx: {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#eee',
          },
        },
      },
      {
        cellInfo: {
          label: 'Shipping Address',
          renderOptions: (
            <SaleAddressCard
              address={detailInfo.ship_address}
              sx={{
                border: 'none',
                paddingLeft: 0,
                alignItems: 'start',
              }}
            />
          ),
        },
        align: 'column',
        xs: !mobile ? 6 : 12,
        sx:
          !mobile && !detailInfo.special_instructions
            ? {
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#eee',
                },
              }
            : '',
      },
      {
        cellInfo: {
          label: 'Billing Address',
          renderOptions: (
            <SaleAddressCard
              address={detailInfo.bill_address}
              sx={{
                border: 'none',
                paddingLeft: 0,
                alignItems: 'start',
              }}
            />
          ),
        },
        align: 'column',
        xs: !mobile ? 6 : 12,
        sx: !detailInfo.special_instructions
          ? {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: '1px',
                backgroundColor: '#eee',
              },
            }
          : {},
      },
      {
        cellInfo: {
          label: 'Delivery Requests:',
          value: detailInfo.special_instructions,
        },
        align: 'row',
        xs: 12,
        sx: {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#eee',
          },
        },
      },
      {
        cellInfo: {
          label: 'Item List',
          renderOptions: (
            <SalesDetailsTableV2
              sx={{
                borderBottom: 'none',
                '--TableCell-borderColor': '#eceeef',
                color: 'var(--fortress-palette-brand-charcoal-800)',
                minWidth: 500,
              }}
              order={detailInfo}
            />
          ),
        },
        align: 'column',
        xs: 12,
        sx: {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#eee',
          },
          overflowX: 'auto',
        },
      },
      {
        cellInfo: {
          label: ' ',
          value: ' ',
        },
        align: 'row',
        xs: 6,
      },
      {
        cellInfo: {
          label: '',
          renderOptions: (
            <DetailsFooterV2
              order={detailInfo}
              sx={{
                width: '100%',
              }}
            />
          ),
        },
        align: 'row',
        xs: !mobile ? 6 : 12,
      },
    ];
  }, [mobile, detailInfo]);
  return (
    <React.Fragment>
      <Button
        // variant="plain"
        sx={{
          bgcolor: 'var(--fortress-palette-common-white, #fff)',
          color: 'var(--fortress-palette-primary-500, #0B6BCB)',
          '&:hover': {
            bgcolor: 'var(--fortress-palette-common-white, #fff)',
          },
          '&:active:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
          },
          marginLeft: '0.2rem',
          marginTop: '0.2rem',
          marginBottom: '0.5rem',
        }}
        onClick={() => {
          dispatch(setDetailJumpPage(currentPage));
          router.replace(`/${localCountry}/sale-history`);
        }}
      >
        {'< Back'}
      </Button>
      <Box
        sx={{
          padding: '0 1rem',
          width: '100%',
        }}
      >
        <Grid sx={{ width: '100%' }} container rowSpacing={2} columnSpacing={2}>
          {cellInfo.map((cell) =>
            cell.cellInfo.value || cell.cellInfo.renderOptions ? (
              <SalesOrderCell key={typeof cell.cellInfo.label === 'string' ? cell.cellInfo.label : ''} {...cell} />
            ) : (
              ''
            )
          )}
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default SalesOrderDetails;
