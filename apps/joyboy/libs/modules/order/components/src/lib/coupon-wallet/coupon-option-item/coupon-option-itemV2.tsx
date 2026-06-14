'use client';
import { Stack, Typography, Divider, Button } from '@castlery/fortress';
import { type CouponItemType } from '../coupon-dropdown/helperV2';
import { CouponTooltip } from '../coupon-tooltip/coupon-tooltip';
import { formatDate } from '@castlery/utils';

interface CouponOptionItemProps {
  coupon: CouponItemType;
  disabled?: boolean;
}
export const CouponOptionItemV2 = ({ coupon, disabled = false }: CouponOptionItemProps) => {
  const { couponType, code, expired_at, title, highlightedCode, cost, content, min_spend, upgradeDescription } = coupon;

  let expiredDate = 'Forever';
  if (expired_at) {
    if (couponType === 'coupon') {
      expiredDate = formatDate(+expired_at * 1000, 'MMM dd, yyyy');
    } else if (couponType === 'credits') {
      expiredDate = formatDate(expired_at, 'MMM dd, yyyy');
    }
  }
  return (
    <>
      <Stack sx={{ flex: 1, width: 'calc(100% - 92px)', mr: 0.5, opacity: disabled ? 0.4 : 1 }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 0.5 }}>
          <Typography
            level="subh2"
            noWrap
            sx={{
              flex: 1, // 占用剩余空间
              minWidth: 0, // 允许收缩到0宽度
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>

          {upgradeDescription ? (
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 0.5,
                flex: 'none', // 防止被压缩
                minWidth: 'auto', // 保持最小宽度
              }}
            >
              <Typography level="caption2" sx={{ flex: 'none', whiteSpace: 'nowrap' }}>
                Upgrade
              </Typography>
              <CouponTooltip title={upgradeDescription?.split('\n')} />
            </Stack>
          ) : null}
        </Stack>

        {couponType === 'coupon' ? (
          <>
            {content?.usingRuleDescription && <Typography level="caption2">{content?.usingRuleDescription}</Typography>}
          </>
        ) : (
          <>{Number(min_spend) > 0 && <Typography level="caption2">min. spend ${min_spend}</Typography>}</>
        )}
        <Typography level="caption2">Valid Till: {expiredDate}</Typography>
      </Stack>
      <Divider orientation="vertical" sx={{ flex: 'none', opacity: disabled ? 0.4 : 1 }} />
      {couponType === 'coupon' && (
        <Stack sx={{ flex: 'none', width: 75, alignItems: 'center' }}>
          {content?.unavailableReason && (
            <CouponTooltip title={content.unavailableReason?.split('\n')} position="left" />
          )}
          <Typography
            level="caption2"
            noWrap
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              opacity: disabled ? 0.4 : 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {highlightedCode || code}
          </Typography>
        </Stack>
      )}
      {couponType === 'credits' && (
        <Stack sx={{ flex: 'none', width: 75, gap: 0.5, opacity: disabled ? 0.4 : 1 }}>
          <Typography
            level="caption2"
            noWrap
            sx={{
              textAlign: 'center',
            }}
          >
            {cost} Credits
          </Typography>
          <Button
            variant="tertiary"
            color="primary"
            sx={{
              fontSize: 'sm',
              minHeight: '24px',
              p: 0,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Redeem
          </Button>
        </Stack>
      )}
    </>
  );
};

export default CouponOptionItemV2;
