'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Autocomplete, autocompleteClasses, useBreakpoints } from '@castlery/fortress';
import { getYotpoCustomerDetails, getYotpoRedemptionOptions } from '@castlery/modules-order-domain';
import { getCouponsByOrderNumberV2 } from '@castlery/modules-promotion-domain';
// import { formatter, checkEligible, formatterRedeemOptions, type CouponItemType } from './helper';
import { checkEligible, formatter, formatterRedeemOptions, type CouponItemType } from './helperV2';
import { renderOptionV2 } from './coupon-dropdown-optionV2';
import { groupBy, renderGroup } from './render-group';
import { CouponApplyButtonV2 } from '../coupon-apply-button/coupon-apply-buttonV2';
import { CouponCancelButtonV2 } from '../coupon-cancel-button/coupon-cancel-buttonV2';
import { redeemYotpoCreditsCommand } from '@castlery/modules-order-services';
import { applyCouponCommand } from '@castlery/shared-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { trackOfflineCoupon } from '@castlery/modules-tracking-services';
import { useMount } from 'react-use';
import { selectApplyCouponLoadingV2, getGiftsByOrderNumberV2 } from '@castlery/modules-promotion-domain';
import { VoucherType } from '@castlery/types';

export interface CouponDropdownProps {
  editToggle: () => void;
  // coupons: CouponItem[];
  openCouponGiftModal: (code: string) => void;
  modal: any;
}

export const CouponDropdownV2 = ({ editToggle, openCouponGiftModal, modal }: CouponDropdownProps) => {
  const { mobile } = useBreakpoints();
  // const [modal, contextHolder] = useNiceModal();

  const orderNumber = makePersistenceHandles().orderNumber.getItem() as string;
  const customer = useAppSelector(selectedCurrentCustomer) as { email: string; id: number } | null;

  // 使用 useMemo 获取选择器
  const getCoupons = useMemo(() => getCouponsByOrderNumberV2.select(orderNumber), [orderNumber]);
  const getPoints = useMemo(() => getYotpoCustomerDetails.select(customer?.email || ''), [customer]);
  const getRedeemOptions = useMemo(
    () => getYotpoRedemptionOptions.select({ customerEmail: customer?.email || '', customerId: customer?.id || 0 }),
    [customer]
  );

  // 获取数据
  // eslint-disable-next-line
  const { data: coupons = [], isLoading: couponsLoading, error: couponsError } = useAppSelector(getCoupons);
  const { data: yotpoCustomerDetails = {} } = useAppSelector(getPoints);

  const points = yotpoCustomerDetails?.points_balance || 0;
  const { data: redeemOptions = [] } = useAppSelector(getRedeemOptions);

  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectApplyCouponLoadingV2);

  const [couponCode, setCouponCode] = React.useState<string>('');
  const [open, setOpen] = useState(false);
  const [couponGiftVerify, setCouponGiftVerify] = useState<boolean>(false);

  const newCoupons = formatter(coupons);
  const newRedeemOptions = formatterRedeemOptions(redeemOptions, points);
  const mergeList = [...newCoupons, ...newRedeemOptions];
  const value = mergeList.find((item: any) => {
    if (item.couponType === 'coupon') {
      return item.code === couponCode;
    }
    return false;
  });
  // return <>完成</>;

  const getCouponGift = async (couponCode: string) => {
    setCouponGiftVerify(true);
    try {
      const { data } = await dispatch(
        getGiftsByOrderNumberV2.initiate({ orderNumber: orderNumber, coupon_code: couponCode })
      );
      const couponGift = data?.find((item: any) => item.control_type === 2 && item.is_eligible);
      return couponGift;
    } catch (error) {
      return null;
    } finally {
      setCouponGiftVerify(false);
    }
  };
  const apply = async (code: string) => {
    await dispatch(trackOfflineCoupon('select'));
    await dispatch(applyCouponCommand({ couponCode: code }));
    editToggle && editToggle();
  };

  const redeem = async (id: number) => {
    await dispatch(trackOfflineCoupon('redeem'));
    modal.warning({
      title: 'This redemption cannot be undone.',
      subDesc: 'Once redeem, action cannot be reversed. Would you like to proceed?',
      confirmText: 'Confirm',
      onConfirm: async () => await dispatch(redeemYotpoCreditsCommand(id)),
      beforeClose: () => setOpen(true),
      // 禁止掉autoFocus，是因为focus从autocomplete转移到modal,会导致autocomplete失焦而触发onclose事件
      disableAutoFocus: true,
    });
  };

  const onSelect = async (event: React.SyntheticEvent, value: CouponItemType | null) => {
    if (!value) return;
    if (value.couponType === 'coupon') {
      const { expired_at, available, code, voucherType } = value;
      const eligible = checkEligible({ available, expired_at });
      if (eligible && code) {
        setCouponCode(code);
        setOpen(false);

        if (voucherType === VoucherType.FREE_GIFT) {
          const couponGift = await getCouponGift(code);
          if (couponGift) {
            openCouponGiftModal && openCouponGiftModal(code);
          }
        } else {
          await apply(code);
        }
      }
    }
    if (value.couponType === 'credits') {
      setOpen(false);
      await redeem(value.id);
    }
  };

  const onOpen = () => setOpen(true);
  const onClose = (event: React.SyntheticEvent, reason: string) => {
    if (['toggleInput'].includes(reason)) return;

    if (!loading) {
      setOpen(false);
      editToggle && editToggle();
    }
  };
  const onInputChange = (event: React.SyntheticEvent, newInputValue: string, reason: string) => {
    if (reason === 'input') {
      setCouponCode(newInputValue);
    }
  };

  const inputCodeApply = async (code: string) => {
    const couponGift = await getCouponGift(code);
    if (couponGift) {
      openCouponGiftModal && openCouponGiftModal(code);
    } else {
      setOpen(false);
      apply(code);
    }
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && couponCode) {
      inputCodeApply(couponCode);
    }
  };

  useMount(() => {
    if (mobile) {
      setOpen(true);
    }
  });

  useEffect(() => {
    function checkFocus() {
      // 因为mobile禁用掉了autoFocus，所以coupon dropdown 首次打开时，不受focus控制，
      // 点击其他地方弹出dialog时，focus不会blur掉，所以不会触发autocomplete的onClose事件，需要手动关闭autocomplete
      if (mobile && open && (document?.activeElement as HTMLInputElement)?.name !== 'couponInput') {
        setOpen(false);
      }
      return false;
    }

    window?.addEventListener('focus', checkFocus, true);
    return () => {
      window?.removeEventListener('focus', checkFocus, true);
    };
  }, [mobile, open]);

  return (
    <>
      <Autocomplete
        openOnFocus
        autoComplete
        autoFocus={!mobile}
        open={open}
        value={value as any}
        name="couponInput"
        inputValue={couponCode}
        sx={{
          paddingY: 0.65,
          flex: 1,
          border: 'none',
          boxShadow: 'none',
          [`& .${autocompleteClasses.popupIndicator}, & .${autocompleteClasses.clearIndicator}`]: {
            display: 'none',
          },
          [`& .${autocompleteClasses.input}`]: {
            sm: { maxWidth: 'auto' },
            md: { maxWidth: 110 },
            lg: { maxWidth: 'auto' },
          },
        }}
        endDecorator={
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <CouponApplyButtonV2
              couponCode={couponCode}
              inputCodeApply={inputCodeApply}
              verifyLoading={couponGiftVerify}
            />
            <CouponCancelButtonV2 editToggle={editToggle} />
          </Box>
        }
        options={mergeList as any[]}
        getOptionLabel={(option) => {
          return option.code || option.id.toString();
        }}
        isOptionEqualToValue={(option, value) => {
          // 对于 coupon 类型，使用 code 进行比较
          if (option.couponType === 'coupon' && value.couponType === 'coupon') {
            return option.code === value.code;
          }
          // 对于 credits 类型，使用 id 进行比较
          if (option.couponType === 'credits' && value.couponType === 'credits') {
            return option.id === value.id;
          }
          return false;
        }}
        onChange={onSelect}
        onOpen={onOpen}
        onClose={onClose}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        renderOption={renderOptionV2}
        groupBy={groupBy}
        renderGroup={(params) => renderGroup(params, points)}
        getOptionDisabled={(option) => {
          if (option.couponType === 'coupon') {
            return !checkEligible({ available: option.available, expired_at: option.expired_at as any });
          }
          return false;
        }}
        // ------------------------------ note -------------------------------
        // 不能用getOptionDisabled，因为auto complete的disabled会导致被禁用option项中的tootip不能响应事件 是因为 css 属性覆盖了事件触发
        // disabledItemsFocusable
        // getOptionDisabled={}
        // ------------------------------- test ------------------------------
        // isOptionEqualToValue
      />
      {/* {contextHolder} */}
    </>
  );
};
