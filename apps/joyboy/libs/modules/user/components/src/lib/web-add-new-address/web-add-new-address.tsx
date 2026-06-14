'use client';
import { useState, useMemo, useCallback } from 'react';
import { Stack, Link, linkClasses, NiceModal } from '@castlery/fortress';
import { Plus } from '@castlery/fortress/Icons';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { LocationSearch, LocationSearchType, AddressForm, AddressFormActionType } from '@castlery/shared-components';
import { CamelCaseParsedGoogleAddressEntity_V2 } from '@castlery/types';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

interface WebAddNewAddressProps {
  onSaved: (addressId?: number) => Promise<void>;
  onFormOpenChange?: (open: boolean) => void;
}

export const WebAddNewAddress = ({ onSaved, onFormOpenChange }: WebAddNewAddressProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_USER, { keyPrefix: 'webUserAddress' });

  // Redux selectors
  const customer = useAppSelector(selectedActiveUser);

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [address, setAddress] = useState<CamelCaseParsedGoogleAddressEntity_V2 | null>(null);

  // Memoized form default values
  const formDefaultValues = useMemo(() => {
    return {
      firstname: customer?.firstname?.trim() ?? undefined,
      lastname: customer?.lastname?.trim() ?? undefined,
      phone: customer?.phone?.trim() ?? undefined,
      ...address,
    };
  }, [customer, address]);

  // Memoized button styles
  const linkButtonStyles = useMemo(
    () => ({
      width: 160,
      py: 3,
      [`& .${linkClasses.startDecorator}`]: {
        marginInlineEnd: 1,
      },
    }),
    []
  );

  // Handlers
  const handleAddNewAddress = useCallback(() => {
    setShowSearch(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    onFormOpenChange?.(false);
  }, [onFormOpenChange]);

  const handleLocationSubmit = useCallback(
    async (selectedAddress: CamelCaseParsedGoogleAddressEntity_V2) => {
      setShowSearch(false);
      setShowForm(true);
      setAddress(selectedAddress);
      onFormOpenChange?.(true);
    },
    [onFormOpenChange]
  );

  const afterSaved = useCallback(
    async (addressId?: number) => {
      onFormOpenChange?.(false);
      await onSaved?.(addressId);
    },
    [onSaved, onFormOpenChange]
  );

  return (
    <Stack>
      {showForm ? (
        <AddressForm
          useNewVersion={true}
          defaultAddress={formDefaultValues as any}
          onCancel={handleCancelForm}
          onSaved={afterSaved}
          actionType={AddressFormActionType.ADD}
        />
      ) : (
        <Stack
          sx={{
            alignItems: { xs: 'center', sm: 'flex-start' },
            mt: { xs: 6, md: 0 },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <Link
            startDecorator={<Plus />}
            level="caption1"
            component="button"
            variant="primary"
            onClick={handleAddNewAddress}
            sx={linkButtonStyles}
          >
            {t('addNewAddressButton' as any)}
          </Link>
        </Stack>
      )}

      <NiceModal
        open={showSearch}
        disabledCloseByClickBackdrop
        onClose={handleCloseSearch}
        title={t('searchAddressTitle' as any)}
        showCancelBtn={false}
        showConfirmBtn={false}
      >
        <LocationSearch type={LocationSearchType.ADDRESS} onSubmit={handleLocationSubmit} autoFocus={true} />
      </NiceModal>
    </Stack>
  );
};
