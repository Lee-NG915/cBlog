'use client';
import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Checkbox, Stack, Skeleton } from '@castlery/fortress';
import { useGetUserAddressListV2Query } from '@castlery/modules-user-domain';
import { useValidateAddressForShippingAndUpdateMutation } from '@castlery/modules-checkout-domain';
import { useUpdateTransactionOrderAddressMutation } from '@castlery/modules-order-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { WebAddNewAddress } from '@castlery/modules-user-components';
import { AddressDisplayCard, AddressForm, AddressFormActionType } from '@castlery/shared-components';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { accessInPos } from '@castlery/config';

export interface WebPaymentBillingAddressSelectorProps {
  /**
   * Current billing address ID. Used to compare with shippingAddressId when syncing billing address.
   */
  selectedAddressId?: number;
  /**
   * Callback when address selection changes
   */
  onAddressSelect?: (address: CustomerAddressEntity_V2 | null) => void;
  /**
   * Whether to use shipping address as default
   */
  defaultUseShippingAddress?: boolean;
  /**
   * Callback when "use shipping address" checkbox changes
   */
  onUseShippingAddressChange?: (useShipping: boolean) => void;
  /**
   * Order ID. Present after order is created; absent during checkout flow.
   */
  orderId?: string;
  /**
   * Current shipping address ID. Used to sync billing address when "use shipping address" is checked.
   */
  shippingAddressId: number;
}

interface BillingAddressContentProps {
  orderId?: string;
  defaultSelectedAddressId?: number | undefined;
  onAddressSelect?: (address: CustomerAddressEntity_V2 | null) => void;
}

function BillingAddressContent({
  orderId,
  defaultSelectedAddressId = undefined,
  onAddressSelect,
}: BillingAddressContentProps) {
  const { data: addressList = [], isLoading, refetch } = useGetUserAddressListV2Query();

  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(defaultSelectedAddressId);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressEntity_V2 | null>(null);

  useEffect(() => {
    if (defaultSelectedAddressId && !selectedAddressId) {
      setSelectedAddressId(defaultSelectedAddressId);
    }
  }, [defaultSelectedAddressId, selectedAddressId]);

  const [validateAndUpdateCheckoutAddress] = useValidateAddressForShippingAndUpdateMutation();
  const [updateOrderAddress] = useUpdateTransactionOrderAddressMutation();

  const updateBillingAddress = useCallback(
    async (addressId: number) => {
      if (orderId) {
        await updateOrderAddress({ id: orderId, addressId, type: 'billing' });
      } else {
        await validateAndUpdateCheckoutAddress({ addressId, type: 'billAddress' });
      }
    },
    [orderId, updateOrderAddress, validateAndUpdateCheckoutAddress]
  );

  const handleSelect = useCallback(
    async (address: CustomerAddressEntity_V2) => {
      setSelectedAddressId(address.id);
      onAddressSelect?.(address);
      await updateBillingAddress(address.id);
    },
    [onAddressSelect, updateBillingAddress]
  );

  const handleEdit = useCallback((address: CustomerAddressEntity_V2) => {
    setEditingAddress(address);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingAddress(null);
  }, []);

  // Shared post-save logic: refetch list, auto-select, update checkout/order
  const handleAfterSaved = useCallback(
    async (addressId?: number) => {
      if (!addressId) return;
      const { data: refreshedList = [] } = await refetch();
      setSelectedAddressId(addressId);
      const saved = refreshedList.find((a) => a.id === addressId);
      if (saved) {
        onAddressSelect?.(saved);
      }
      await updateBillingAddress(addressId);
    },
    [refetch, onAddressSelect, updateBillingAddress]
  );

  const handleEditSaved = useCallback(
    async (addressId: number) => {
      setEditingAddress(null);
      await handleAfterSaved(addressId);
    },
    [handleAfterSaved]
  );

  if (isLoading) {
    return (
      <Stack spacing={4}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
      </Stack>
    );
  }

  if (editingAddress) {
    return (
      <AddressForm
        useNewVersion={true}
        defaultAddress={editingAddress}
        onCancel={handleCancelEdit}
        onSaved={handleEditSaved}
        actionType={AddressFormActionType.UPDATE}
      />
    );
  }

  return (
    <Stack spacing={4}>
      {addressList.length > 0 ? (
        <>
          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: accessInPos ? '1fr' : { xs: '1fr', md: 'repeat(2,1fr)' },
              rowGap: 6,
              columnGap: 6,
              position: 'relative',
            }}
          >
            {addressList.map((address) => (
              <AddressDisplayCard
                key={address.id}
                address={address}
                selected={selectedAddressId === address.id}
                onSelect={() => handleSelect(address)}
                onEdit={() => handleEdit(address)}
                enableEdit={true}
              />
            ))}
          </Stack>
          <WebAddNewAddress onSaved={handleAfterSaved} />
        </>
      ) : (
        <Box>
          <Typography level="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            No addresses available. Please add a new address.
          </Typography>
          <WebAddNewAddress onSaved={handleAfterSaved} />
        </Box>
      )}
    </Stack>
  );
}

export function WebPaymentBillingAddressSelector({
  onAddressSelect,
  defaultUseShippingAddress = true,
  selectedAddressId,
  onUseShippingAddressChange,
  orderId,
  shippingAddressId,
}: WebPaymentBillingAddressSelectorProps) {
  const [useShippingAddress, setUseShippingAddress] = useState(defaultUseShippingAddress);
  const [validateAndUpdateCheckoutAddress] = useValidateAddressForShippingAndUpdateMutation();
  const [updateOrderAddress] = useUpdateTransactionOrderAddressMutation();

  const handleCheckboxChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setUseShippingAddress(checked);
      onUseShippingAddressChange?.(checked);

      if (checked) {
        onAddressSelect?.(null);
        if (shippingAddressId && shippingAddressId !== selectedAddressId) {
          if (orderId) {
            await updateOrderAddress({ id: orderId, addressId: shippingAddressId, type: 'billing' });
          } else {
            await validateAndUpdateCheckoutAddress({ addressId: shippingAddressId, type: 'billAddress' });
          }
        }
      }
    },
    [
      onAddressSelect,
      onUseShippingAddressChange,
      orderId,
      shippingAddressId,
      selectedAddressId,
      updateOrderAddress,
      validateAndUpdateCheckoutAddress,
    ]
  );

  return (
    <Box sx={{ py: 2 }}>
      <Typography level="h2" mb={3}>
        Billing address
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          mb: useShippingAddress ? 0 : 4,
        }}
      >
        <Checkbox label="Use my shipping address" checked={useShippingAddress} onChange={handleCheckboxChange} />
      </Box>

      {!useShippingAddress && (
        <Box sx={{ mt: 4 }}>
          <BillingAddressContent
            defaultSelectedAddressId={selectedAddressId}
            orderId={orderId}
            onAddressSelect={onAddressSelect}
          />
        </Box>
      )}
    </Box>
  );
}

export default WebPaymentBillingAddressSelector;
