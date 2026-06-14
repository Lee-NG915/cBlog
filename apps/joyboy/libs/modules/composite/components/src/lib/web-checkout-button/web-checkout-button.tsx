'use client';
import { Button } from '@castlery/fortress';
import {
  cartCheckoutClickedEvent,
  selectCheckoutDisabled,
  selectCheckoutLoading,
  selectCartCustomizedItems,
  selectCartGiftItems,
  selectGiftPools,
  selectMiniCartMode,
  selectRefreshLoading,
  selectReloadCartLoading,
  webInitiatedCheckoutEvent,
} from '@castlery/modules-cart-domain';
import { initCheckoutCommand } from '@castlery/modules-cart-services';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { CustomizedItemPopup, SelectGiftReminderPopup } from '@castlery/modules-cart-components';
import { ChooseCampaignGiftModal } from '@castlery/modules-promotion-components';
import { useState } from 'react';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useRouter } from 'nextjs-toploader/app';
import { logger } from '@castlery/observability';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

// 待统一优化，获取内部地址的方法
export const checkoutAccountUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY}/${basePageConfig['checkout-account']}`.toLowerCase();
export const checkoutUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY}/${basePageConfig['checkout-shipping-address']}`.toLowerCase();

/**
 * Web 端 checkout 按钮
 * description:
 * 1. checkout disabled 状态
 * 2. 点击checkout按钮， 首先校验 login， 未登录，redirect to login page
 * 3. 登录态下继续校验 [交易规则 ] https://castlery.atlassian.net/wiki/spaces/PM/pages/3017113702/Cart+Transaction+Verification?atlOrigin=eyJpIjoiM2NiZTBkOTkzNzU1NDFlMWIwZTI4NzA2ZGI3YzA0OTUiLCJwIjoiYyJ9
 * 4.
 * @returns
 */
export function WebCheckoutButton({ fullFillWidth = false }: { fullFillWidth?: boolean }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCheckoutButton' });
  const customer = useAppSelector(selectedActiveUser);
  const hasLogin = !!customer?.id;
  const [openCustomizedPopup, setOpenCustomizedPopup] = useState(false);
  const [openGiftReminderPopup, setOpenGiftReminderPopup] = useState(false);
  const [openCampaignGiftModal, setOpenCampaignGiftModal] = useState(false);

  const checkoutDisabled = useAppSelector(selectCheckoutDisabled);
  const checkoutLoading = useAppSelector(selectCheckoutLoading);
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const refreshLoading = useAppSelector(selectRefreshLoading);
  const reloadCartLoading = useAppSelector(selectReloadCartLoading);
  const cartCustomizedItems = useAppSelector(selectCartCustomizedItems);
  const hasCustomizedItem = Array.isArray(cartCustomizedItems) && cartCustomizedItems?.length > 0;

  const giftPools = useAppSelector(selectGiftPools);
  const cartGiftItems = useAppSelector(selectCartGiftItems);
  // Has an eligible campaign gift promotion (controlType=1) but user hasn't selected any gift yet
  const hasUnselectedCampaignGift =
    Array.isArray(giftPools) &&
    giftPools.some((pool) => pool.isEligible && pool.controlType === 1) &&
    (!Array.isArray(cartGiftItems) || cartGiftItems.length === 0);

  const showLoading = checkoutLoading || refreshLoading || reloadCartLoading;

  const handleCustomizedItemConfirm = async () => {
    setOpenCustomizedPopup(false);
    await handleCheckout();
  };

  const onClickCheckout = async () => {
    dispatch(cartCheckoutClickedEvent({ position: miniCartMode ? 'miniCart' : 'fullCart' }));
    // 优先级： 登录态 > 未选 gift > 有定制化商品
    if (!hasLogin) {
      router.push(checkoutAccountUrl);
      return;
    }
    if (hasUnselectedCampaignGift) {
      setOpenGiftReminderPopup(true);
      return;
    }
    if (hasCustomizedItem) {
      setOpenCustomizedPopup(true);
      return;
    }
    await handleCheckout();
  };

  const handleCheckout = async () => {
    dispatch(webInitiatedCheckoutEvent());
    try {
      const res = await dispatch(initCheckoutCommand());
      if ('error' in res) {
        throw new Error((res.payload as any).message || res.error?.message);
      }
      router.push(checkoutUrl);
    } catch (error) {
      logger.error('handleCheckout error', { error });
      return;
    }
  };

  return (
    <>
      <Button
        disabled={checkoutDisabled}
        data-selenium={DATA_SELENIUM_ID_MAP.CHECK_OUT}
        loading={showLoading}
        onClick={onClickCheckout}
        fullWidth={fullFillWidth}
      >
        {t('checkout')}
      </Button>
      <SelectGiftReminderPopup
        open={openGiftReminderPopup}
        onClose={() => setOpenGiftReminderPopup(false)}
        onChooseGift={() => {
          setOpenGiftReminderPopup(false);
          setOpenCampaignGiftModal(true);
        }}
        onSkip={async () => {
          setOpenGiftReminderPopup(false);
          await handleCheckout();
        }}
      />
      <ChooseCampaignGiftModal open={openCampaignGiftModal} onClose={() => setOpenCampaignGiftModal(false)} />
      <CustomizedItemPopup
        openModal={openCustomizedPopup}
        setOpenModal={setOpenCustomizedPopup}
        onConfirm={handleCustomizedItemConfirm}
      />
    </>
  );
}
export default WebCheckoutButton;
