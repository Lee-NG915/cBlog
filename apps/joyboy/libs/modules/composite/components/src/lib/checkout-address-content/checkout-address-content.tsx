'use client';
import { Box, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { WebAddNewAddress } from '@castlery/modules-user-components';
import { noticeCityInfoUpdated, selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  LocationSearch,
  LocationSearchType,
  AddressForm,
  AddressFormActionType,
  useHasOrderCreated,
} from '@castlery/shared-components';
import {
  selectCheckoutAddressList,
  useValidateAddressForShippingAndUpdateMutation,
  getCheckoutAddressList,
  selectCheckoutAddress,
  selectCheckoutZipcode,
  checkoutShippingAddressSavedEvent,
} from '@castlery/modules-checkout-domain';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useDebounce } from 'react-use';
import {
  WebCheckoutContinueButton,
  CheckoutAddressList,
  CheckoutAddressListSkeleton,
} from '@castlery/modules-checkout-components';
import { logger } from '@castlery/observability';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

const VALIDATION_DEBOUNCE_MS = 100;

export const shippingMethodUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
  basePageConfig['checkout-shipping-method']
}`;

const formTitleSx = { py: 4 } as const;

export const CheckoutAddressContent = () => {
  const { desktop, mobile, tablet } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, { keyPrefix: 'checkoutAddress' });
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const hasOrderCreated = useHasOrderCreated();

  // Redux selectors
  const addressList = useAppSelector(selectCheckoutAddressList);
  const listLoading = useAppSelector(getCheckoutAddressList.select()).isLoading;
  const customer = useAppSelector(selectedActiveUser);
  // Source of truth for which address is currently bound to checkout
  const shippingAddressInCheckout = useAppSelector(selectCheckoutAddress);
  const checkoutZipcode = useAppSelector(selectCheckoutZipcode);

  // Local state
  const [editingAddress, setEditingAddress] = useState<CustomerAddressEntity_V2 | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  /**
   * selectedAddressId: the pending selection that drives debounce validation.
   * Only updated by:
   *   1. auto-select effect (when shippingAddressInCheckout or addressList changes)
   *   2. user manually clicking an address
   * NOT updated inside afterAddressSaved — let the auto-select effect handle it
   * after shippingAddressInCheckout reflects the validate result, preventing races.
   */
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();
  /**
   * validSelectedAddressId: the confirmed-valid selection shown in the UI.
   * Set either by a successful validate API call, or by the debounce shortcut
   * when selectedAddressId already matches shippingAddressInCheckout.id.
   */
  const [validSelectedAddressId, setValidSelectedAddressId] = useState<number | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [validateAddressForShippingAndUpdate, { isLoading: validateLoading }] =
    useValidateAddressForShippingAndUpdateMutation();

  const addressListNotEmpty = Array.isArray(addressList) && addressList.length > 0;
  const isLoading = listLoading || validateLoading || isSaving;

  const titleStyles = useMemo(
    () => ({
      ...(desktop && { mt: 7, mb: 6 }),
      ...(mobile && { py: 4 }),
      ...(tablet && { py: 5 }),
    }),
    [desktop, mobile, tablet]
  );

  const containerStyles = useMemo(
    () => ({
      position: 'relative' as const,
      ...{ px: { xs: 6, md: 0 } },
    }),
    [desktop]
  );

  const validateAddress = useCallback(
    async (addressId: number) => {
      try {
        const res = await validateAddressForShippingAndUpdate({ addressId, type: 'shipAddress' });
        if ('error' in res) {
          throw new Error(JSON.stringify(res.error));
        }
        setValidSelectedAddressId(addressId);
        return true;
      } catch (error) {
        logger.error('Validate and update address error:', { error });
        return false;
      }
    },
    [validateAddressForShippingAndUpdate]
  );

  /**
   * Debounced validation triggered when selectedAddressId changes.
   *
   * Loop-safety: validate succeeds → shippingAddressInCheckout.id updates to selectedAddressId
   * → auto-select re-runs → sets selectedAddressId to the same value → React bails out (no
   * re-render) → debounce does NOT re-fire → chain terminates.
   */
  useDebounce(
    () => {
      if (!selectedAddressId) return;
      if (selectedAddressId !== shippingAddressInCheckout?.id) {
        validateAddress(selectedAddressId);
      } else {
        // Already in sync with checkout — mark as valid without an API round-trip
        setValidSelectedAddressId(selectedAddressId);
      }
    },
    VALIDATION_DEBOUNCE_MS,
    [selectedAddressId, validateAddress]
  );

  // Sync city info whenever the validated address changes
  useEffect(() => {
    if (!validSelectedAddressId || !addressList?.length) return;
    const matchingAddress = addressList.find((address) => address.id === validSelectedAddressId);
    if (matchingAddress) {
      const payload = {
        zipcode: matchingAddress.zipcode,
        city: matchingAddress.city,
        state: matchingAddress.stateName ?? '',
      };
      dispatch(noticeCityInfoUpdated(payload));
      makePersistenceHandles().webCity.setItem(JSON.stringify(payload));
    }
  }, [validSelectedAddressId, addressList, dispatch]);

  /**
   * Auto-select: drives selectedAddressId from server state only.
   *
   * Rules (in priority order):
   * 1. If checkoutZipcode is set and NO address in the list matches it → clear selection.
   *    This handles the case where the user changes zipcode in Order Summary to a value
   *    that doesn't correspond to any saved address.
   * 2. Find the address whose ID matches shippingAddressInCheckout.id → select it.
   *    No match → clear selection (no zipcode fallback).
   *
   * Zipcode-based re-selection (Scenario 4) is handled entirely outside this component.
   * When an external process calls validate & update with a zipcode-matched address,
   * shippingAddressInCheckout updates here, this effect re-runs, and the address is selected.
   *
   * Loop-safety: selectedAddressId is intentionally excluded from deps. setSelectedAddressId
   * with the same value causes React to bail out, so the debounce does not re-fire.
   */
  useEffect(() => {
    if (!addressList?.length) return;

    // Rule 1: new zipcode has no matching address in list → clear selection
    if (checkoutZipcode?.zipcode) {
      const hasZipcodeMatch = addressList.some((addr) => addr.zipcode === checkoutZipcode.zipcode);
      if (!hasZipcodeMatch) {
        setSelectedAddressId(undefined);
        setValidSelectedAddressId(undefined);
        return;
      }
    }

    // Rule 2: ID match
    const matched = shippingAddressInCheckout?.id
      ? addressList.find((addr) => addr.id === shippingAddressInCheckout.id)
      : undefined;

    setSelectedAddressId(matched?.id);
    if (!matched) {
      setValidSelectedAddressId(undefined);
    }
  }, [addressList, shippingAddressInCheckout, checkoutZipcode]);

  // Handlers
  const handleEditAddress = useCallback(
    (address: CustomerAddressEntity_V2) => {
      if (hasOrderCreated) return;
      setEditingAddress(address);
      setIsEditing(true);
    },
    [hasOrderCreated]
  );

  const handleAddAddress = useCallback(
    (address: CustomerAddressEntity_V2) => {
      if (hasOrderCreated) return;
      const info = {
        // @ts-ignore
        firstname: customer?.firstname?.trim() ?? undefined,
        // @ts-ignore
        lastname: customer?.lastname?.trim() ?? undefined,
        // @ts-ignore
        phone: customer?.phone?.trim() ?? undefined,
        ...address,
      };
      setEditingAddress(info);
      setIsEditing(true);
    },
    [customer]
  );

  const handleExitEdit = useCallback(() => {
    setEditingAddress(null);
    setIsEditing(false);
  }, []);

  const handleSelectAddress = useCallback((address: CustomerAddressEntity_V2) => {
    if (hasOrderCreated) return;
    setSelectedAddressId(address.id);
  }, []);

  /**
   * After ADD or UPDATE: dispatch save event (triggers address list refresh via listener),
   * then call validate & update to bind the address to checkout info.
   *
   * Intentionally does NOT call setSelectedAddressId here. After validateAddress succeeds,
   * shippingAddressInCheckout updates → auto-select effect fires → selectedAddressId is set.
   * This avoids a race between manual setSelectedAddressId and the auto-select effect.
   */
  const afterAddressSaved = useCallback(
    async (addressId: CustomerAddressEntity_V2['id']) => {
      if (!addressId) return;
      setIsSaving(true);
      try {
        dispatch(checkoutShippingAddressSavedEvent({ addressId }));
        await validateAddress(addressId);
      } finally {
        setIsSaving(false);
      }
    },
    [validateAddress, dispatch]
  );

  // Scroll to form when editing
  useEffect(() => {
    if (formRef.current && isEditing) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  const renderAddressForm = (title: string, actionType: AddressFormActionType) => (
    <Stack>
      <Typography level="h4" sx={formTitleSx}>
        {title}
      </Typography>
      <AddressForm
        useNewVersion={true}
        formRef={formRef}
        defaultAddress={editingAddress}
        onCancel={handleExitEdit}
        onSaved={afterAddressSaved}
        actionType={actionType}
      />
    </Stack>
  );

  if (listLoading && !addressListNotEmpty) {
    return (
      <Box sx={containerStyles}>
        <Typography level="h3" sx={titleStyles}>
          {t('title')}
        </Typography>
        <CheckoutAddressListSkeleton />
      </Box>
    );
  }

  const continueButton = (
    <Box sx={{ mt: { xs: 4, sm: 5, md: 6 } }}>
      <WebCheckoutContinueButton
        loading={validateLoading}
        disabled={!validSelectedAddressId}
        isOrderCreated={hasOrderCreated}
      />
    </Box>
  );

  const actionSection = hasOrderCreated ? (
    continueButton
  ) : addressListNotEmpty ? (
    isEditing && editingAddress ? (
      renderAddressForm(t('editAddress'), AddressFormActionType.UPDATE)
    ) : (
      <>
        <WebAddNewAddress onSaved={afterAddressSaved} onFormOpenChange={setIsAddFormOpen} />
        {!isAddFormOpen && !isSaving && !validateLoading && continueButton}
      </>
    )
  ) : (
    <>
      <LocationSearch
        type={LocationSearchType.ADDRESS}
        autoFocus={false}
        onSubmit={async (address: CustomerAddressEntity_V2) => handleAddAddress(address)}
      />
      {isEditing && renderAddressForm(t('addAddress'), AddressFormActionType.ADD)}
    </>
  );

  return (
    <Box sx={containerStyles}>
      <Typography level="h3" sx={titleStyles}>
        {t('title')}
      </Typography>
      {addressListNotEmpty && (
        <CheckoutAddressList
          selectedAddressId={validSelectedAddressId}
          onEdit={handleEditAddress}
          onSelect={handleSelectAddress}
          loading={isLoading}
          readOnly={hasOrderCreated}
        />
      )}
      {actionSection}
    </Box>
  );
};

export default CheckoutAddressContent;
