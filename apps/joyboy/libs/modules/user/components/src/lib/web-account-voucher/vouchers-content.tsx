'use client';
import { Box, Card, Loading, Stack, Tooltip, Typography } from '@castlery/fortress';
import { Info } from '@castlery/fortress/Icons';
import { useGetVouchersQuery } from '@castlery/modules-user-domain';
import { TooltipEllipsis } from '@castlery/shared-components';
import { formatDate } from '@castlery/utils';
import { useEffect, useState } from 'react';
import VoucherBanner from './voucherBanner';

export function VouchersPage() {
  const { data, isLoading, error } = useGetVouchersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [vouchers, setVouchers] = useState<any[]>([]);
  useEffect(() => {
    if (!isLoading && data?.data?.vouchers) {
      setVouchers(data?.data?.vouchers);
    }
  }, [data, isLoading, error]);

  const stateText = (voucher: any) => {
    // state 0: available, 1: unavailable, 2: expired, 未开始不返回
    const state = voucher.state;
    if (state === 0) {
      return `Valid through ${formatDate(new Date(voucher.voucherTime.endTime * 1000))}`;
    }
    if (state === 1) {
      return 'Invalidated';
    }
    if (state === 2) {
      return `Expired on ${formatDate(new Date(voucher.voucherTime.endTime * 1000))}`;
    }
    return '';
  };

  const renderVoucherCard = (voucher: any) => {
    const isExpired = voucher.state !== 0; //0: available, 1: unavailable, 2: expired, 3: used

    return (
      <Card
        key={voucher.code}
        variant="outlined"
        sx={{
          paddingTop: '24px',
          position: 'relative',
          opacity: isExpired ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
          width: '317px',
          height: '204px',
          borderRadius: '8px',
          border: '1px solid var(--fortress-palette-brand-mono-200)',
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          // 分割线
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '0',
            right: '0',
            top: '105px',
            height: '1px',
            borderBottom: '1px dashed var(--fortress-palette-brand-mono-300)',
            zIndex: 1,
          },
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="114"
          height="71"
          viewBox="0 0 114 71"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <path
            d="M113.344 0.620605C101.612 40.7001 55.3801 70.6206 0.131836 70.6206L0.130859 70.6196V9.62061C0.130859 4.65004 4.1603 0.620605 9.13086 0.620605H113.344Z"
            fill="var(--fortress-palette-brand-warmLinen-500)"
          />
        </svg>

        {/* 左侧圆形装饰 */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '107px',
            width: '22.6px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            border: '1px solid var(--fortress-palette-brand-mono-300)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              bottom: '-1px',
              left: '-1px',
              width: '50%',
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            },
          }}
        />

        {/* 右侧圆形装饰 */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '107px',
            width: '22.6px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            border: '1px solid var(--fortress-palette-brand-mono-300)',
            transform: 'translate(50%, -50%)',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              bottom: '-1px',
              right: '-1px',
              width: '50%',
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 3,
            width: '24px',
            height: '24px',
          }}
        >
          <Tooltip
            title={
              voucher?.content?.usingRuleDetail ? (
                <Stack spacing={1}>
                  {voucher?.content?.usingRuleDetail.split('\n').map((line: string) => (
                    <Box key={line}>{line}</Box>
                  ))}
                </Stack>
              ) : (
                voucher?.content?.usingRuleDescription
              )
            }
            placement="top"
            arrow
            theme="dark"
            enterTouchDelay={0}
            leaveTouchDelay={500}
          >
            <Box>
              <Info width={16} height={16} sx={{ color: 'var(--fortress-palette-netural-900)' }} />
            </Box>
          </Tooltip>
        </Box>

        <Box
          sx={{
            textAlign: 'center',
            zIndex: 2,
            mt: 1,
          }}
        >
          <Box sx={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <TooltipEllipsis title={voucher?.content?.discountDescription} placement="top" hideIcon>
              <Typography
                level="h3"
                sx={{
                  width: '90%',
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '30px !important',
                }}
              >
                {voucher?.content?.discountDescription}
              </Typography>
            </TooltipEllipsis>
          </Box>

          <Typography
            level="caption1"
            sx={{ mt: 1, fontSize: '16px !important', color: 'var(--fortress-palette-brand-mono-700)' }}
          >
            {stateText(voucher)}
          </Typography>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 35, left: 0, width: '100%', textAlign: 'center' }}>
          <Typography
            level="caption1"
            sx={{ color: 'var(--fortress-palette-brand-mono-700)', fontSize: '16px !important' }}
          >
            Use code:
          </Typography>
          <Typography
            level="h4"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              textAlign: 'center',
              fontSize: '24px !important',
            }}
          >
            {voucher.code}
          </Typography>
        </Box>
      </Card>
    );
  };

  return (
    <Stack spacing={8}>
      <Typography level="h2">My Vouchers</Typography>
      <VoucherBanner />

      {error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography level="body1" sx={{ color: 'text.secondary' }}>
            {typeof error === 'string' ? error : 'An error occurred while loading vouchers'}
          </Typography>
        </Box>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', width: '100%' }}>
          <Loading theme="dark" />
        </Box>
      ) : vouchers.length === 0 ? (
        <Typography level="body1" sx={{ mt: 6 }}>
          You have no vouchers right now.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 317px)',
              gap: {
                xs: 4,
                sm: 6,
                md: 8,
              },
            }}
          >
            {vouchers.map(renderVoucherCard)}
          </Box>
          <Typography level="body1">Voucher code can be applied at cart.</Typography>
        </>
      )}
    </Stack>
  );
}
