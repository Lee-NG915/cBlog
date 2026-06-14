'use client';
import { Badge, Box, IconButton, Typography } from '@castlery/fortress';
import { Delete, Plus } from '@castlery/fortress/Icons';
import { selectCouponProcessing, selectOrder, selectOrderLoading } from '@castlery/modules-order-domain';
import { selectCouponProcessingV2 } from '@castlery/modules-promotion-domain';
import { trackOfflineCoupon } from '@castlery/modules-tracking-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { removeCouponCommand } from '@castlery/shared-services';
import { toPrice } from '@castlery/utils';
import { useAsyncFn } from 'react-use';

export interface CouponRowItemProps {
  coupon: any;
  editToggle: () => void;
  hasCoupons: boolean;
}

export function CouponRowItem({ coupon, editToggle, hasCoupons }: CouponRowItemProps) {
  const orderLoading = useAppSelector(selectOrderLoading);
  const order = useAppSelector(selectOrder);
  const dispatch = useAppDispatch();
  const couponProcessing = useAppSelector(selectCouponProcessing);
  const couponProcessingV2 = useAppSelector(selectCouponProcessingV2);

  const applyLoading = couponProcessing || couponProcessingV2;
  const [removeState, handleRemove] = useAsyncFn(async () => {
    if (!coupon?.code) return Promise.resolve();
    return await dispatch(removeCouponCommand({ couponCode: coupon.code }));
  }, [dispatch, coupon]);

  const handleOpen = async () => {
    if (orderLoading || applyLoading) return;
    await dispatch(trackOfflineCoupon('add'));
    editToggle && editToggle();
  };

  return (
    <Box
      role="button"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onClick={handleOpen}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
        <Typography level="body2">Coupon Code</Typography>
        <Typography level="caption1" color="primary">
          {coupon ? `${coupon?.code}` : ''}
        </Typography>
        {coupon && (
          <IconButton loading={removeState.loading} onClick={handleRemove} sx={{ p: 0, minWidth: 24, minHeight: 24 }}>
            <Delete color="danger" />
          </IconButton>
        )}
      </Box>
      {coupon ? (
        <Typography level="body2">
          {coupon?.free_gift
            ? 'Free Gift'
            : `${toPrice(+coupon?.amount + (Number(order?.warranty_total_discount) || 0))}`}
        </Typography>
      ) : (
        <IconButton sx={{ p: 0, minWidth: 24, minHeight: 24 }} loading={orderLoading || applyLoading}>
          <Badge invisible={!hasCoupons}>
            <Plus sx={{ color: (theme) => theme.palette.brand?.charcoal?.[800] }} />
          </Badge>
        </IconButton>
      )}
    </Box>
  );
}

export default CouponRowItem;
