'use client';
import {
  Stack,
  Button,
  Autocomplete,
  IconButton,
  Typography,
  autocompleteClasses,
  useBreakpoints,
  CircularProgress,
  Box,
} from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { CouponWalletAutocompleteOption } from './coupon-wallet-autocomplete-option';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  selectYotpoRedemptionOptions,
  selectYotpoDetails,
  type CouponWalletOption,
  CouponWalletOptionType,
  useLazyGetGiftsByCouponCodeQuery,
  useRedeemYotpoCreditsMutation,
  redeemableVoucherClickedEvent,
} from '@castlery/modules-promotion-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { RedemptionActionModal, CheckoutGiftCouponDisabledModal } from './redemption-modals';
import { DateTime } from 'luxon';
import { useDebounce } from 'react-use';
import { logger } from '@castlery/observability';
import { ChooseCouponGiftModal } from '@castlery/modules-promotion-components';
import { accessInWeb } from '@castlery/config';
import { type CouponListSchema, type GiftPoolSchema } from '@castlery/types';
import {
  type CouponWalletMode,
  isFreeGiftCouponOption,
  isFreeGiftVoucherType,
  shouldDisableFreeGiftCouponInCheckout,
} from '../coupon-wallet-policy';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';

interface CouponWalletAutocompleteProps {
  mode: CouponWalletMode;
  active: boolean;
  exitEditMode: () => void;
  currentUser: { email: string; id: number };
  usedInvalidCoupon: { code: string; amount: string | number; invalidReason: string } | null;
  applyCoupon: (couponCode: string) => Promise<{ error?: unknown }>;
  applyLoading: boolean;
  availableCoupons: CouponListSchema[] | null;
  onAfterRedeemCredits?: () => Promise<void>;
}

export function CouponWalletAutocomplete({
  mode,
  active,
  exitEditMode,
  usedInvalidCoupon,
  currentUser,
  applyCoupon,
  applyLoading,
  availableCoupons,
  onAfterRedeemCredits,
}: CouponWalletAutocompleteProps) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const isMiniCartMode = useAppSelector(selectMiniCartMode);
  // @ts-ignore - Type definitions may not be up to date
  const redemptionOptions = useAppSelector(selectYotpoRedemptionOptions);
  // @ts-ignore - Type definitions may not be up to date
  const yotpoDetails = useAppSelector(selectYotpoDetails);
  const yotpoPoints = yotpoDetails?.points_balance || 0;
  const applyState = { isLoading: applyLoading };
  const [getGiftsByCouponTrigger, { isFetching: isLoadingGiftsByCouponCode }] = useLazyGetGiftsByCouponCodeQuery();
  const [redeemYotpoCreditsTrigger] = useRedeemYotpoCreditsMutation();

  const [inputValue, setInputValue] = useState(usedInvalidCoupon?.code || '');
  const [selectedOption, setSelectedOption] = useState<CouponWalletOption | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [reLoadingWalletOptions, setReLoadingWalletOptions] = useState(false);
  const [rewardFailTips, setRewardFailTips] = useState(usedInvalidCoupon?.invalidReason || '');
  const [openGiftModal, setOpenGiftModal] = useState(false);
  const [openGiftCouponDisabledModal, setOpenGiftCouponDisabledModal] = useState(false);
  const [activeGiftCouponCode, setActiveGiftCouponCode] = useState('');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  /** Remount Autocomplete when entering edit mode so MUI list state (highlight / aria-selected) does not stick across sessions. */
  const [autocompleteMountKey, setAutocompleteMountKey] = useState(0);

  const usedInvalidCouponRef = useRef(usedInvalidCoupon);
  usedInvalidCouponRef.current = usedInvalidCoupon;
  const containerRef = useRef<HTMLDivElement>(null);
  /** Prevents exitEditMode when blur is caused by selecting an option (modal may be opening). */
  const selectionJustHappenedRef = useRef(false);

  const isCheckoutMode = mode === 'checkout';

  // Reset state and focus when edit mode becomes active (driven by parent)
  useEffect(() => {
    if (active) {
      setAutocompleteMountKey((k) => k + 1);
      setInputValue(usedInvalidCouponRef.current?.code || '');
      setSelectedOption(null);
      setRewardFailTips(usedInvalidCouponRef.current?.invalidReason || '');
      if (!usedInvalidCouponRef.current?.invalidReason) {
        const timeout = setTimeout(() => {
          (document.querySelector('#coupon_wallet_autocomplete') as HTMLInputElement)?.focus();
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [active]);

  // Sync invalidReason from summary into inline error message
  useEffect(() => {
    if (active) {
      setRewardFailTips(usedInvalidCoupon?.invalidReason || '');
    }
  }, [active, usedInvalidCoupon?.invalidReason]);

  // Re-focus after redeeming credits (internal trigger)
  useEffect(() => {
    if (openDropdown) {
      const timeout = setTimeout(() => {
        (document.querySelector('#coupon_wallet_autocomplete') as HTMLInputElement)?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [openDropdown]);

  useDebounce(
    () => {
      if (!inputValue.trim() && !!rewardFailTips) {
        setRewardFailTips('');
      }
    },
    500,
    [inputValue]
  );

  const couponExpiredDate = useCallback(
    (expiredAt: string) =>
      expiredAt && new Date(expiredAt) instanceof Date
        ? DateTime.fromSeconds(Number(expiredAt)).minus({ days: 1 }).toFormat('MMM d, yyyy')
        : 'Forever',
    []
  );

  const creditsExpiredDate = useCallback(() => DateTime.now().plus({ days: 30 }).toFormat('MMM d, yyyy'), []);

  const walletOptions = useMemo(() => {
    const reCoupons =
      // @ts-ignore - Type definitions may not be up to date
      availableCoupons?.map((coupon: any) => {
        return {
          type: CouponWalletOptionType.COUPON,
          voucherType: coupon.voucherType,
          label: coupon.content.discountDescription,
          value: coupon.code,
          ruleDescription: coupon.content.usingRuleDescription,
          usingRuleDetail: coupon.content.usingRuleDetail,
          discountDescription: coupon.content.discountDescription,
          upgradeDescription: coupon.content.upgradeDescription,
          unavailableReason:
            mode === 'checkout' && isFreeGiftVoucherType(coupon.voucherType)
              ? 'Gift coupon code can only be used in the cart.'
              : coupon.content.unavailableReason,
          expiredAt: couponExpiredDate(coupon.voucherTime.endTime || ''),
          state: coupon.state,
        } as CouponWalletOption;
      }) || [];
    const reYotpoRedemptionOptions =
      redemptionOptions?.map((option, index) => {
        return {
          type: CouponWalletOptionType.CREDITS,
          voucherType: '',
          label: option.name,
          value: option.id.toString(),
          ruleDescription: option.description,
          usingRuleDetail: '',
          discountDescription: '',
          unavailableReason: '',
          upgradeDescription: '',
          expiredAt: creditsExpiredDate(),
          state: 0,
          cost: option.amount,
          insertHint:
            index === 0 && yotpoPoints > 0 ? (
              <Typography level="caption2" textAlign="center">
                You have{' '}
                <Typography level="caption2" color="primary">
                  {yotpoPoints} credits
                </Typography>
                ! Redeem now.
              </Typography>
            ) : null,
        } as CouponWalletOption;
      }) || [];
    return [...reCoupons, ...reYotpoRedemptionOptions];
  }, [availableCoupons, redemptionOptions, couponExpiredDate, creditsExpiredDate, yotpoPoints, mode]);

  /**
   * Add coupon handler
   * @param couponCode - The code of the coupon to add
   */
  const applyCouponHandler = useCallback(
    async (couponCode: string) => {
      setRewardFailTips('');
      const res = await applyCoupon(couponCode);
      if ('error' in res) {
        const error = res.error as any;
        let errorMsg = '';
        if (typeof error?.message === 'string') {
          try {
            const parsed = JSON.parse(error.message);
            errorMsg = String(parsed.msg || '');
          } catch {
            errorMsg = error.message;
          }
        }
        setRewardFailTips(errorMsg);
        return;
      }
      if ('data' in res && (res.data as any)?.isValid === false) {
        setRewardFailTips((res.data as any).invalidReason || '');
        return;
      }
      if (document?.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      exitEditMode();
    },
    [applyCoupon, exitEditMode]
  );

  /**
   * Get gifts by coupon code.
   * Returns a discriminated result so the caller can distinguish API failure from an empty gift list —
   * on failure the cart error listener surfaces the toast and the caller should halt.
   */
  const getGiftsByCouponHandler = useCallback(
    async (couponCode: string): Promise<{ error: true } | { error: false; gifts: GiftPoolSchema[] }> => {
      const result = await getGiftsByCouponTrigger(couponCode);
      if (result.error) {
        return { error: true };
      }
      return { error: false, gifts: (result.data as GiftPoolSchema[] | undefined) ?? [] };
    },
    [getGiftsByCouponTrigger]
  );

  const handleRedeemCredits = async () => {
    if (!selectedOption) return Promise.resolve();
    if (selectedOption.type === CouponWalletOptionType.CREDITS && selectedOption.value) {
      try {
        setReLoadingWalletOptions(true);
        await redeemYotpoCreditsTrigger({
          redemptionOptionId: selectedOption.value,
          customerEmail: currentUser.email,
          customerId: currentUser.id,
        });

        return new Promise((resolve) => {
          const timeout = setTimeout(async () => {
            resolve(true);
            setReLoadingWalletOptions(false);
            setOpenDropdown(true);
            await onAfterRedeemCredits?.();
            clearTimeout(timeout);
          }, 1000);
        });
      } catch (error) {
        logger.error('handleRedeemCredits error', { error });
      }
    }
  };

  const getOptionDisabled = useCallback(
    (option: CouponWalletOption) => {
      if (option.type === CouponWalletOptionType.COUPON) {
        return !!option.unavailableReason || option.state !== 0 || shouldDisableFreeGiftCouponInCheckout(mode, option);
      }
      return false;
    },
    [mode]
  );

  /**
   * Handle input change
   */
  const onInputChange = useCallback(
    (event: React.SyntheticEvent, value: string, reason: string) => {
      if (reason === 'reset') {
        return;
      }

      const isCoupon = walletOptions.some(
        (option) => option.type === CouponWalletOptionType.COUPON && option.value.includes(value)
      );

      if (isCoupon || reason === 'input') {
        setInputValue(value);
        if (reason === 'input') setSelectedOption(null);
        if (rewardFailTips) setRewardFailTips('');
      }
    },
    [walletOptions, rewardFailTips]
  );

  /**
   * Handle autocomplete change
   */
  const onAutoCompleteChange = useCallback(
    async (event: React.SyntheticEvent, value: CouponWalletOption | CouponWalletOption[], reason: string) => {
      if (reason === 'selectOption') {
        selectionJustHappenedRef.current = true;
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        const nextSelectedOption = Array.isArray(value) ? value[0] : value;
        if (!Array.isArray(value) && nextSelectedOption && getOptionDisabled(nextSelectedOption)) {
          return;
        }
        setSelectedOption(nextSelectedOption);

        if (!Array.isArray(value) && value?.type === CouponWalletOptionType.COUPON) {
          setInputValue(nextSelectedOption?.value || '');
          if (shouldDisableFreeGiftCouponInCheckout(mode, value)) {
            setOpenGiftCouponDisabledModal(true);
            return;
          }
          if (isFreeGiftCouponOption(value)) {
            setActiveGiftCouponCode(value.value);
            setOpenGiftModal(true);
          } else {
            applyCouponHandler(value.value);
          }
        }
        if (!Array.isArray(value) && value?.type === CouponWalletOptionType.CREDITS) {
          dispatch(redeemableVoucherClickedEvent({ creditsCost: nextSelectedOption?.cost ?? 0 }));
          setOpenModal(true);
        }
      }
    },
    [applyCouponHandler, dispatch, getOptionDisabled, mode]
  );

  const onClickApply = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (applyState.isLoading || isLoadingGiftsByCouponCode) {
        return;
      }
      if (selectedOption?.type === CouponWalletOptionType.COUPON) {
        const couponCode = selectedOption.value;
        if (!couponCode) {
          logger.warn('No coupon code to apply');
          return;
        }
        if (shouldDisableFreeGiftCouponInCheckout(mode, selectedOption)) {
          setOpenGiftCouponDisabledModal(true);
          return;
        }
        applyCouponHandler(couponCode);
        return;
      }

      const couponCode = inputValue?.trim();
      if (!couponCode) {
        logger.warn('No coupon code to apply');
        return;
      }
      const result = await getGiftsByCouponHandler(couponCode);
      if (result.error) {
        // Cart error listener surfaces the toast; keep edit mode so the user can retry.
        return;
      }
      if (result.gifts.length > 0) {
        if (isCheckoutMode) {
          setOpenGiftCouponDisabledModal(true);
        } else {
          setActiveGiftCouponCode(couponCode);
          setOpenGiftModal(true);
        }
      } else {
        applyCouponHandler(couponCode);
      }
    },
    [
      selectedOption,
      inputValue,
      applyCouponHandler,
      getGiftsByCouponHandler,
      applyState,
      isLoadingGiftsByCouponCode,
      mode,
      isCheckoutMode,
    ]
  );

  // const isLoading = isLoadingGiftsByCouponCode || reLoadingWalletOptions;
  const applyButtonDisabled = (!inputValue.trim() && !selectedOption) || !!rewardFailTips;

  const filteredOptions = useMemo(
    () => walletOptions.filter((option) => option.value.toLowerCase().includes(inputValue.toLowerCase())),
    [walletOptions, inputValue]
  );
  // Only open dropdown when input is focused AND (nothing typed yet OR there are matching options)
  const dropdownOpen = isInputFocused && (!inputValue.trim() || filteredOptions.length > 0);

  /**
   * Handle keyboard events: prevent form submission on Enter, and trigger apply when input is non-empty
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (inputValue.trim() && !applyButtonDisabled) {
          onClickApply(e as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }
    },
    [inputValue, applyButtonDisabled, onClickApply]
  );

  /**
   * Exit edit mode when focus leaves the entire coupon wallet area (click on blank space outside).
   * Skipped when a selection just happened (modal may be about to open).
   */
  const handleContainerBlur = useCallback(
    (e: React.FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      // Focus stayed within the component — do nothing
      if (relatedTarget && containerRef.current?.contains(relatedTarget)) return;
      // Selection just happened (dropdown option clicked, modal may be opening) — skip exit
      if (selectionJustHappenedRef.current) {
        selectionJustHappenedRef.current = false;
        return;
      }
      exitEditMode();
    },
    [exitEditMode]
  );

  const dropdownStyles = useMemo(() => {
    return accessInWeb
      ? {
          outerStyles: {
            py: 5,
          },
          innerWrapperStyles: {
            pr: accessInWeb ? 6 : 1,
            [`& .${autocompleteClasses.root}`]: {
              px: accessInWeb ? 6 : 3,
              py: 0,
              height: accessInWeb ? 38 : 28,
              borderBottom: 'none',
              '&:hover': {
                borderBottom: 'none',
              },
            },
          },
          autocompleteStyles: {
            '--Input-minHeight': accessInWeb ? '38px' : '28px',
            '--Input-lineHeight': accessInWeb ? '38px' : '28px',
          },
          listboxStyles: {
            gap: { xs: 2, sm: 4, md: 3, lg: 4 },
            py: { xs: 4, sm: 6, md: 4, lg: 6 },
            px: { xs: 4, sm: 6, md: 4, lg: 6 },
            width: { xs: 358, sm: 544, md: 370, lg: 400, xl: 544 },
            minWidth: { xs: 358, sm: 496, md: 370, lg: 400, xl: 535 },
            maxWidth: { xs: 358, sm: 544, md: 370, lg: 400, xl: 544 },
            mt: (theme: any) => `${theme.spacing(5)} !important`,
            backgroundColor: (theme: any) => theme.palette.brand.warmLinen[500],
            [`& .${autocompleteClasses.noOptions}`]: {
              fontFamily: 'var(--font-aime, "Aime")',
              color: (theme: any) => theme.palette.text.secondary,
            },
            zIndex: isMiniCartMode ? 'calc(var(--fortress-zIndex-modal) + 100)' : 'var(--Popover-zIndex)',
          },
          rewardFailTipsStyles: {
            px: accessInWeb ? 6 : 3,
          },
        }
      : {
          innerWrapperStyles: {
            pr: 1,
            [`& .${autocompleteClasses.root}`]: {
              px: 3,
              py: 0,
              height: 28,
              borderBottom: 'none',
              '&:hover': {
                borderBottom: 'none',
              },
              '& .MuiAutocomplete-wrapper': {
                input: {
                  padding: 0,
                  color: 'var(--fortress-palette-brand-maroon-velvet-500)',
                  fontFamily: 'var(--fortress-fontFamily-display)',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '140%',
                  width: 'fit-content',
                },
              },
            },
          },
          autocompleteStyles: {
            '--Input-minHeight': '28px',
            '--Input-lineHeight': '28px',
          },
          listboxStyles: {
            mt: (theme: any) => `${theme.spacing(1)} !important`,
            gap: { xs: 2, sm: 4, md: 2, lg: 4 },
            py: { xs: 4, sm: 6, md: 4, lg: 6 },
            px: { xs: 4, sm: 6, md: 4, lg: 6 },
            width: { xs: 358, sm: 544, md: 358 },
            minWidth: { xs: 358, sm: 496, md: 358 },
            maxWidth: { xs: 358, sm: 544, md: 358 },
            mb: 4,
            backgroundColor: (theme: any) => theme.palette.brand.warmLinen[500],
            zIndex: 'calc(var(--fortress-zIndex-modal) + 100)',
          },
          rewardFailTipsStyles: {
            px: 3,
          },
        };
  }, [mobile, isMiniCartMode]);

  return (
    <>
      <Stack
        ref={containerRef}
        gap={accessInWeb ? 3 : 1}
        onBlur={handleContainerBlur}
        sx={{
          position: 'relative',
          ...dropdownStyles.outerStyles,
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ ...dropdownStyles.innerWrapperStyles }}>
          <Autocomplete
            key={autocompleteMountKey}
            id="coupon_wallet_autocomplete"
            name="coupon_wallet_autocomplete"
            disableClearable
            disableListWrap
            forcePopupIcon={false}
            blurOnSelect={true}
            open={dropdownOpen}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onClose={(_, reason) => {
              if (reason === 'escape') {
                setIsInputFocused(false);
                exitEditMode();
              }
            }}
            variant="plain"
            noOptionsText="No coupon available."
            value={selectedOption ?? undefined}
            inputValue={inputValue}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              ...dropdownStyles.autocompleteStyles,
            }}
            slotProps={{
              listbox: {
                sx: {
                  position: 'relative',
                  p: 0,
                  boxShadow: 'lg',
                  zIndex: 'var(--Popover-zIndex)',
                  ...dropdownStyles.listboxStyles,
                },
                placement: accessInWeb ? 'bottom-start' : 'top-start',
              },
            }}
            options={walletOptions}
            getOptionDisabled={getOptionDisabled}
            isOptionEqualToValue={(option, value) => option.value === value?.value}
            renderOption={(props, option) => {
              return (
                <CouponWalletAutocompleteOption propsRawData={props} option={option} loading={reLoadingWalletOptions} />
              );
            }}
            onInputChange={onInputChange}
            filterOptions={() => filteredOptions}
            getOptionLabel={(option) => option.value}
            onChange={onAutoCompleteChange}
          />
          <Button
            type="button"
            variant="secondary"
            loading={applyState.isLoading || isLoadingGiftsByCouponCode}
            disabled={applyButtonDisabled}
            sx={{ flex: 'none', mr: 1 }}
            size="sm"
            onClick={onClickApply}
          >
            Apply
          </Button>
          <IconButton
            variant="plain"
            color="neutral"
            sx={{ flex: 'none', p: 0 }}
            disabled={applyState.isLoading || isLoadingGiftsByCouponCode}
            onClick={exitEditMode}
          >
            <Close width={24} height={24} sx={{ color: 'var(--fortress-palette-brand-maroonVelvet-500)' }} />
          </IconButton>
        </Stack>
        {!!rewardFailTips && (
          <Typography level="caption2" color="danger" sx={{ ...dropdownStyles.rewardFailTipsStyles }}>
            {rewardFailTips}
          </Typography>
        )}
      </Stack>
      <RedemptionActionModal open={openModal} close={() => setOpenModal(false)} onConfirm={handleRedeemCredits} />
      <ChooseCouponGiftModal
        couponCode={activeGiftCouponCode}
        open={openGiftModal}
        onClose={() => {
          setOpenGiftModal(false);
          exitEditMode();
        }}
      />
      <CheckoutGiftCouponDisabledModal
        open={openGiftCouponDisabledModal}
        close={() => setOpenGiftCouponDisabledModal(false)}
      />
    </>
  );
}
