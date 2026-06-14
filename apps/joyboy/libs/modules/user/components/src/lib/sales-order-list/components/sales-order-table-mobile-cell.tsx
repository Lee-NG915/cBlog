import { Grid, Box, Card, Typography, TypographySystem } from '@castlery/fortress';
import { Order, setCurrentPage, setSaleListRowInfo } from '@castlery/modules-user-domain';
import moment from 'moment-timezone';
import { toPrice } from '@castlery/modules-order-services';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EcEnv } from '@castlery/config';

interface SalesOrderTableMobileCellProps {
  mobileCellData: Order;
  page: number;
}

const mobileDefaultConfig: Map<string, { label: string; xs: number }> = new Map([
  [
    'orderId',
    {
      label: 'Order No.',
      xs: 6,
    },
  ],
  [
    'orderPlaced',
    {
      label: 'Order Placed',
      xs: 6,
    },
  ],
  [
    'customer',
    {
      label: 'Customer',
      xs: 8,
    },
  ],
  [
    'total',
    {
      label: 'Total',
      xs: 6,
    },
  ],
  [
    'orderStatus',
    {
      label: 'Order Status',
      xs: 6,
    },
  ],
  [
    'detailInfo',
    {
      label: '',
      xs: 4,
    },
  ],
]);

export default function SalesOrderTableMobileCell(props: SalesOrderTableMobileCellProps) {
  const { reference_number, completed_at, email, total, order_status } = props.mobileCellData;
  const page = props.page;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const localCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();
  const gridSx = { width: '100%', border: 'none', '--Card-padding': '0.2rem' };
  const typographySx = {
    color: 'var(--fortress-palette-brand-charcoal-800)',
    wordBreak: 'break-all',
  };
  const gridData: {
    [key: string]: string;
  } = {
    orderId: reference_number,
    orderPlaced: moment(completed_at).format('L LT'),
    total: toPrice(Number(total)),
    orderStatus: order_status.split('_').join(' ').toUpperCase(),
    customer: email,
    detailInfo: 'detailInfo',
  };
  return (
    <Grid sx={{ width: '100%' }} container rowSpacing={2} columnSpacing={2}>
      {Object.keys(gridData).map((key) => {
        const config = mobileDefaultConfig.get(key);
        return (
          <Grid key={key} xs={config?.xs}>
            {key !== 'detailInfo' ? (
              <Card sx={gridSx}>
                <Typography level={'title-sm' as keyof TypographySystem | 'inherit'} sx={{ fontWeight: 600 }}>
                  {config?.label}
                </Typography>
                <Typography level={'body-sm' as keyof TypographySystem | 'inherit'} sx={typographySx}>
                  {gridData[key]}
                </Typography>
              </Card>
            ) : (
              <Card
                sx={Object.assign(
                  {
                    position: 'relative',
                    height: '100%',
                    weight: '100%',
                  },
                  gridSx
                )}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    dispatch(setSaleListRowInfo(props.mobileCellData));
                    dispatch(setCurrentPage(page));
                    router.push(`/${localCountry}/sale-history/order-detail`);
                  }}
                >
                  Details
                </Box>
              </Card>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
