'use client';
import { NiceModal, Toast, ModalClose } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { LocationSearch, LocationSearchType, ZipcodeResult } from '@castlery/shared-components';
import {
  useUpdateZipcodeInCartMutation,
  selectMiniCartMode,
  cartShippingZipcodeSelectorClickedEvent,
  cartShippingZipcodeSelectorSubmittedEvent,
  type CartShippingZipcodeSelectorSource,
} from '@castlery/modules-cart-domain';
import {
  useUpdateCheckoutAddressZipcodeMutation,
  checkoutShippingZipcodeSelectorClickedEvent,
  checkoutShippingZipcodeSelectorSubmittedEvent,
} from '@castlery/modules-checkout-domain';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { noticeCityInfoUpdated } from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { logger } from '@castlery/observability';
import { accessInPos } from '@castlery/config';

interface CartCheckoutZipcodeSelectorProps {
  showToast?: boolean;
  inCheckout?: boolean;
  /**
   * Which UI surface hosts the selector — drives the cart-side GA label
   * (`Fullcart`/`Minicart` for the action button, `Fullcart_banner`/`Minicart_banner`
   * for the promotion-hint banner). Ignored when `inCheckout=true`.
   */
  surface?: 'button' | 'banner';
  actionComponent: ({ openModal }: { openModal: () => void }) => React.ReactNode;
}

export function CartCheckoutZipcodeSelector({
  showToast = false,
  inCheckout = false,
  surface = 'button',
  actionComponent,
}: CartCheckoutZipcodeSelectorProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'cartCheckoutZipcodeSelector' });
  const [open, setOpen] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [updateZipcodeInCartTrigger] = useUpdateZipcodeInCartMutation();
  const [updateZipcodeInCheckoutTrigger] = useUpdateCheckoutAddressZipcodeMutation();
  const isMiniCart = useAppSelector(selectMiniCartMode);

  const cartSource: CartShippingZipcodeSelectorSource = isMiniCart
    ? surface === 'banner'
      ? 'Minicart_banner'
      : 'Minicart'
    : surface === 'banner'
    ? 'Fullcart_banner'
    : 'Fullcart';

  const updateGlobalZipcode = async (zipcode: { zipcode: string; city: string; countryState: string }) => {
    try {
      const payload = {
        zipcode: zipcode.zipcode,
        city: zipcode.city,
        state: zipcode.countryState,
      };
      dispatch(noticeCityInfoUpdated(payload));
      makePersistenceHandles().webCity.setItem(JSON.stringify(payload));
    } catch (error) {
      logger.error('updateGlobalZipcode error:', { error });
    }
  };

  const handleChangeCartZipcode = async (result: { zipcode: string; city: string; state: string }) => {
    if (!result || !result.zipcode) return Promise.resolve();
    try {
      const payload = {
        zipcode: result.zipcode,
        city: result.city,
        countryState: result.state,
      };
      dispatch(cartShippingZipcodeSelectorSubmittedEvent({ source: cartSource }));

      // In POS mode, the listener will handle the cart update via noticeCityInfoUpdated
      // In Web mode, we need to call updateZipcodeInCartTrigger directly
      if (!accessInPos) {
        const res = await updateZipcodeInCartTrigger(payload);
        if (res?.error) {
          throw new Error(JSON.stringify(res.error));
        }
      }

      if (showToast) {
        setOpenToast(true);
      }

      await updateGlobalZipcode(payload);
      setOpen(false);
    } catch (error) {
      logger.error('handleChangeCartZipcode error:', { error });
      throw error;
    }
  };

  const handleChangeCheckoutZipcode = async (result: { zipcode: string; city: string; state: string }) => {
    if (!result || !result.zipcode) return Promise.resolve();
    try {
      const payload = {
        zipcode: result.zipcode,
        city: result.city,
        countryState: result.state,
      };
      dispatch(checkoutShippingZipcodeSelectorSubmittedEvent());
      const res = await updateZipcodeInCheckoutTrigger(payload);
      if (res?.error) {
        throw new Error(JSON.stringify(res.error));
      }
      await updateGlobalZipcode(payload);
      setOpen(false);
    } catch (error) {
      logger.error('handleChangeCheckoutZipcode error:', { error });
      throw error;
    }
  };

  const openModal = () => {
    setOpen(true);
    if (inCheckout) {
      dispatch(checkoutShippingZipcodeSelectorClickedEvent());
    } else {
      dispatch(cartShippingZipcodeSelectorClickedEvent({ source: cartSource }));
    }
  };

  return (
    <>
      {actionComponent({ openModal: openModal })}
      <NiceModal
        open={open}
        onClose={() => setOpen(false)}
        showDefaultFooter={false}
        title={t('title')}
        desc={t('description')}
        dialogSx={{
          '#modal-modal-description': {
            textAlign: 'center',
          },
        }}
      >
        <LocationSearch
          type={LocationSearchType.ZIPCODE}
          placeholder={t('placeholder')}
          onSubmit={async (result: ZipcodeResult) => {
            return inCheckout ? await handleChangeCheckoutZipcode(result) : await handleChangeCartZipcode(result);
          }}
        />
      </NiceModal>
      {showToast && (
        <Toast
          theme="dark"
          open={openToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          onClose={() => setOpenToast(false)}
          autoHideDuration={3000}
          endDecorator={<ModalClose onClick={() => setOpenToast(false)} />}
          sx={{ alignItems: 'center' }}
        >
          {t('updatedMessage')}
        </Toast>
      )}
    </>
  );
}
