'use client';
import { Pagination, Table, CircularProgress, useBreakpoints, Box } from '@castlery/fortress';
import SalesOrderTableMobileCell from './components/sales-order-table-mobile-cell';
import {
  selectDetailJumpPage,
  setCurrentPage,
  setDetailJumpPage,
  setSaleListRowInfo,
  useGetSaleListQuery,
} from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useRouter } from 'next/navigation';
import { SaleListReq, SaleListResp } from '@castlery/modules-user-domain';
import moment from 'moment-timezone';
import { toPrice } from '@castlery/utils';
import * as React from 'react';
import { EcEnv } from '@castlery/config';
/* eslint-disable-next-line */
export interface SalesOrderListProps {}

interface DesktopTableHeaderProps {
  id: string;
  label: string;
  minWidth: number;
  width: string;
}

const desktopTableHeaderConfig: Array<DesktopTableHeaderProps> = [
  {
    id: 'orderId',
    label: 'Order No.',
    minWidth: 170,
    width: '15%',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'orderPlaced',
    label: 'Order Placed',
    minWidth: 180,
    width: '15%',
  },
  {
    id: 'customer',
    label: 'Customer',
    minWidth: 170,
    width: '32%',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'total',
    label: 'Total',
    minWidth: 170,
    width: '8%',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'orderStatus',
    label: 'Order Status',
    minWidth: 170,
    width: '15%',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'detailInfo',
    label: '',
    minWidth: 170,
    width: '10%',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
];

export function SalesOrderList(props: SalesOrderListProps) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const detailJumpPage = useAppSelector(selectDetailJumpPage);
  const localCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();
  const [pageParams, setPageParams] = React.useState<SaleListReq>({
    page: 1,
    per_page: !mobile ? 10 : 4,
  });
  const { currentData, isFetching, error } = useGetSaleListQuery(pageParams);

  React.useEffect(() => {
    let tempPage: null | number = null;
    if (detailJumpPage) {
      tempPage = detailJumpPage;
      dispatch(setDetailJumpPage(null));
    }
    setPageParams({
      page: !tempPage ? pageParams.page : +tempPage,
      per_page: !mobile ? 10 : 4,
    });
  }, [mobile, pageParams.page, detailJumpPage, dispatch]);
  // React.useEffect(() => {
  //   if (currentData?.count) {
  //     if (pageParams.page * (!mobile ? 10 : 4) > currentData?.count) {
  //       setPageParams({
  //         page: 1,
  //         per_page: !mobile ? 10 : 4,
  //       });
  //     }
  //   }
  // }, [pageParams, currentData, mobile]);
  const onChange = (e: any, pageNumber: number) => {
    if (pageNumber !== pageParams.page) {
      setPageParams({
        page: pageNumber,
        per_page: pageParams.per_page,
      });
    }
  };

  if (isFetching)
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress variant="plain" />
      </Box>
    );
  if (error) {
    return '';
  }
  if ((currentData as SaleListResp).count === 0) {
    return !mobile ? (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.8rem',
          paddingTop: '3rem',
          color: 'var(--fortress-palette-text-primary)',
          fontFamily: 'var(--fortress-fontFamily-display)',
        }}
      >
        Your sales history is empty
      </Box>
    ) : (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2rem',
          color: 'var(--fortress-palette-brand-charcoal-500)',
        }}
      >
        Your sales history is empty
      </Box>
    );
  }
  return (
    <React.Fragment>
      <Box
        sx={{
          flex: 1,
          marginBottom: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: { xs: '0.625rem 0', md: '1rem 0' },
          }}
        >
          {`${(pageParams.page - 1) * pageParams.per_page + 1} - ${Math.min(
            (pageParams.page - 1) * pageParams.per_page + pageParams.per_page,
            (currentData as SaleListResp).count
          )} of ${(currentData as SaleListResp).count} orders`}
        </Box>
        <Box
          sx={{
            padding: '0 1rem',
          }}
        >
          <Table
            borderAxis="xBetween"
            stickyHeader
            sx={{
              '--TableCell-borderColor': 'var(--fortress-palette-brand-wheat-500)',
              '--Table-headerUnderlineThickness': '0.1rem',
              '--TableCell-paddingX': '0.5rem',
              '--TableCell-paddingY': '1rem',
              '& th': {
                color: 'var(--fortress-palette-text-primary);',
              },
              '& tbody > tr > td:first-child': {
                borderLeft: '0.1rem solid var(--fortress-palette-brand-wheat-500)',
              },
              '& tbody > tr > td:last-child': {
                borderRight: '0.1rem solid var(--fortress-palette-brand-wheat-500)',
                color: 'var(--fortress-palette-wheat-700);',
              },
              '& tbody > tr > td': {
                color: 'var(--fortress-palette-text-primary);',
              },
              borderBottom: '0.1rem solid var(--fortress-palette-brand-wheat-500)',
              borderTop: mobile ? '0.1rem solid var(--fortress-palette-brand-wheat-500)' : undefined,
              lineHeight: '2rem',
            }}
          >
            {!mobile && (
              <thead>
                <tr>
                  {desktopTableHeaderConfig.map((config) => (
                    <th
                      key={config.id}
                      style={{
                        minWidth: config.minWidth,
                        width: config.width,
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        verticalAlign: 'middle',
                      }}
                    >
                      {config.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(currentData as SaleListResp).results.map((row, index) =>
                !mobile ? (
                  <tr key={index}>
                    <td>{row.reference_number}</td>
                    <td>{moment(row.completed_at).format('L LT')}</td>
                    <td>{row.email}</td>
                    <td>{toPrice(Number(row.total))}</td>
                    <td>{row.order_status.split('_').join(' ').toUpperCase()}</td>
                    <td>
                      <Box
                        sx={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          dispatch(setSaleListRowInfo(row));
                          dispatch(setCurrentPage(pageParams.page));
                          router.push(`/${localCountry}/sale-history/order-detail`);
                        }}
                      >
                        Details
                      </Box>
                    </td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td>
                      <SalesOrderTableMobileCell mobileCellData={row} page={pageParams.page} />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </Box>
      </Box>
      <Pagination
        sx={{
          flex: 'none',
          marginBottom: '1rem',
          width: '100%',
        }}
        count={(currentData as SaleListResp).total_pages}
        page={detailJumpPage || pageParams.page}
        onChange={onChange}
      />
    </React.Fragment>
  );
}

export default SalesOrderList;
