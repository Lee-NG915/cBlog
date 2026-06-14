'use client';

import {
  Box,
  Typography,
  Loading,
  Stack,
  Link,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  useBreakpoints,
  useNiceModal,
  Toast,
} from '@castlery/fortress';
import { LocationSearch, LocationSearchType } from '@castlery/shared-components';
import { AddressFormActionType, addressFormClasses, AddressForm } from '@castlery/shared-components';
import {
  useGetCustomerAddressQuery,
  useDeleteCustomerAddressMutation,
  selectedCustomerAddress,
  selectedCustomerAddressLoading,
  selectedActiveUser,
} from '@castlery/modules-user-domain';
import { useEffect, useState, useCallback } from 'react';
import { AddressCard } from './address-card';
import { Add, CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { CustomerAddressEntity } from '@castlery/types';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

export function AddressContent() {
  const { t } = useTranslation(LocalesNamespace.MODULES_USER, { keyPrefix: 'accountAddress' });
  const [modal, contextHolder] = useNiceModal();
  const { mobile, desktop } = useBreakpoints();
  const [open, setOpen] = useState(false);
  const [addressesList, setAddressesList] = useState<CustomerAddressEntity[]>([]);
  const address = useAppSelector(selectedCustomerAddress);
  const addressLoading = useAppSelector(selectedCustomerAddressLoading);
  const [toast, setToast] = useState({ open: false, message: '' });

  // 每次进入页面都重新获取地址数据
  const { isLoading: queryLoading } = useGetCustomerAddressQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const customer = useAppSelector(selectedActiveUser);
  const [initAddress, setInitAddress] = useState<CustomerAddressEntity | undefined>(undefined);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [actionType] = useState<AddressFormActionType>(AddressFormActionType.ADD);
  const [deleteCustomerAddress, { isSuccess: isDeleteSuccess }] = useDeleteCustomerAddressMutation();

  useEffect(() => {
    if (address && Array.isArray(address)) {
      setAddressesList(address);
    }
  }, [address]);

  useEffect(() => {
    if (isDeleteSuccess) {
      setToast({ open: true, message: 'Address has been deleted!' });
    }
  }, [isDeleteSuccess]);

  const handleDeleteAddress = useCallback(
    (address: CustomerAddressEntity) => {
      modal.confirmation({
        title: t('deleteConfirmTitle'),
        confirmText: t('confirm'),
        onConfirm: async () => {
          deleteCustomerAddress(address.id);
        },
      });
    },
    [modal, deleteCustomerAddress]
  );

  const handleSubmit = async (result: any) => {
    const address: CustomerAddressEntity = {
      ...result,
    };
    setInitAddress({
      ...address,
      firstname: customer?.firstname || '',
      lastname: customer?.lastname || '',
      phone: customer?.phone || '',
    });
    setShowAddressForm(true);
    if (open) {
      setOpen(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Typography level="h2">{showAddressForm ? t('formTitle') : t('listTitle')}</Typography>
      <Toast
        theme="dark"
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{
          horizontal: desktop ? 'right' : 'center',
          vertical: 'bottom',
        }}
        sx={{
          width: desktop ? '72%' : '90%',
        }}
        startDecorator={<CheckCircleFilled />}
        endDecorator={
          <Close
            onClick={() => setToast({ open: false, message: '' })}
            sx={{
              cursor: 'pointer',
            }}
          />
        }
        onClose={() => setToast({ open: false, message: '' })}
      >
        {toast.message}
      </Toast>

      {(queryLoading || addressLoading) && (
        <Loading
          theme="dark"
          sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}

      {showAddressForm ? (
        <Box
          sx={{
            [`& .${addressFormClasses.footer}`]: {
              justifyContent: 'flex-start',
              gap: 6,
            },
          }}
        >
          <AddressForm
            defaultAddress={initAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setInitAddress(undefined);
            }}
            onSaved={async (newAddress) => {
              setShowAddressForm(false);
              setInitAddress(undefined);
              setToast({ open: true, message: 'Address has been saved!' });
            }}
            actionType={actionType}
            saveButtonText={t('saveButton')}
          />
        </Box>
      ) : (
        <>
          {addressesList?.length === 0 && !queryLoading && !addressLoading ? (
            <>
              <Typography
                level="body2"
                sx={{
                  mt: mobile ? 4 : 6,
                  mb: 1,
                }}
              >
                Enter location
              </Typography>
              <LocationSearch
                onSubmit={handleSubmit}
                placeholder="Search your location"
                type={LocationSearchType.ADDRESS}
              />
            </>
          ) : (
            <>
              <Stack display="flex" flexDirection="row" flexWrap="wrap" gap={2} sx={{ my: 4 }}>
                {addressesList?.map((address) => (
                  <AddressCard key={address.id} addressInfo={address} onDelete={handleDeleteAddress} />
                ))}
              </Stack>
              {!queryLoading && !addressLoading && (
                <Link
                  component={Button}
                  startDecorator={<Add />}
                  variant="primary"
                  sx={{ textTransform: 'none' }}
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  Add new address
                </Link>
              )}
            </>
          )}
          <Modal open={open} onClose={() => setOpen(false)} disableScrollLock>
            <ModalDialog sx={{ width: mobile ? '342px' : '640px', height: '168px' }}>
              <ModalClose />
              <DialogTitle level="h3" sx={{ width: '100%', textAlign: 'center', display: 'block' }}>
                Enter location
              </DialogTitle>
              <LocationSearch
                onSubmit={handleSubmit}
                placeholder="Search your location"
                type={LocationSearchType.ADDRESS}
              />
            </ModalDialog>
          </Modal>
        </>
      )}
    </>
  );
}
