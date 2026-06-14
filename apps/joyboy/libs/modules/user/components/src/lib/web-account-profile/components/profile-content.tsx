'use client';

import { useNiceModal, Toast } from '@castlery/fortress';
import { AccountDetails } from './view-details';
import { useBreakpoints } from '@castlery/fortress';
import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import {
  selectedActiveUser,
  useUpdateUserProfileMutation,
  selectedUserSubscriptions,
  getUserSubscriptions,
  updateMsgGroupsSubscription,
} from '@castlery/modules-user-domain';
import { EditDetail } from './edit-account-detail';
import { UpdatePasswordForm } from './update-password';
import { EditProfileDetails, SubmitProfileFormData } from './edit-profile-details';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { logger } from '@castlery/observability/client';

export function UserPagContent() {
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<'view' | 'editAccount' | 'updatePassword' | 'editProfile'>('view');
  const customerInfo = useAppSelector(selectedActiveUser);
  const subscription = useAppSelector(selectedUserSubscriptions);
  // const { refetch: getUserSubscriptions } = useGetUserSubscriptionsQuery(undefined, {
  //   refetchOnMountOrArgChange: false,
  // });

  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [modal, modalContextHolder] = useNiceModal();
  const [toastInfo, setToastInfo] = useState({ open: false, message: '' });

  const msgSubscription = useMemo(() => {
    const { email, sms } = subscription?.message_groups?.find((g: Record<string, any>) => g.name === 'promotions' && g)
      ?.deliver_types || { email: false, sms: false };
    return { email, sms };
  }, [subscription]);

  const handleEditAccount = () => setCurrentView('editAccount');
  const handleUpdatePassword = () => setCurrentView('updatePassword');
  const handleEditProfile = () => setCurrentView('editProfile');
  const handleCancel = () => setCurrentView('view');

  const handleSaveAccountDetails = async ({
    userData,
    subscriptionData,
    msg,
    profile_attributes,
  }: {
    userData?: any;
    subscriptionData?: any;
    msg: string;
    profile_attributes?: SubmitProfileFormData;
  }) => {
    try {
      // 更新用户基本信息
      await updateUserProfile({ ...userData, profile_attributes }).unwrap();

      // 如果有订阅数据变化，则更新订阅设置
      if (subscriptionData) {
        await dispatch(
          updateMsgGroupsSubscription({
            subscriptionData,
            unsubscribeReason: '',
          })
        );
        dispatch(getUserSubscriptions.initiate(undefined, { forceRefetch: true }));
      }

      setCurrentView('view');
      setToastInfo({ open: true, message: msg });
    } catch (error) {
      logger.error('Failed to save account details', {
        error,
        userId: userData.id,
      });
      return error;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'editAccount':
        return (
          <EditDetail
            onCancel={handleCancel}
            customerInfo={customerInfo}
            msgSubscription={msgSubscription}
            modal={modal}
            onSave={handleSaveAccountDetails}
          />
        );
      case 'updatePassword':
        return (
          <UpdatePasswordForm
            onCancel={handleCancel}
            onSave={handleSaveAccountDetails}
            customerInfo={customerInfo}
            modal={modal}
          />
        );
      case 'editProfile':
        return (
          <EditProfileDetails
            onCancel={handleCancel}
            data={customerInfo}
            modal={modal}
            onSave={handleSaveAccountDetails}
          />
        );
      default:
        return (
          <AccountDetails
            customerSubscription={msgSubscription}
            onEditAccount={handleEditAccount}
            onUpdatePassword={handleUpdatePassword}
            onEditProfile={handleEditProfile}
            userInfo={customerInfo}
          />
        );
    }
  };

  return (
    <>
      {modalContextHolder}
      <Toast
        theme="dark"
        open={toastInfo.open}
        autoHideDuration={3000}
        anchorOrigin={{
          horizontal: desktop ? 'right' : 'center',
          vertical: 'bottom',
        }}
        sx={{
          width: {
            xs: '87%',
            sm: '90%',
            md: '75%',
          },
        }}
        startDecorator={<CheckCircleFilled />}
        endDecorator={
          <Close
            onClick={() => setToastInfo({ open: false, message: '' })}
            sx={{
              cursor: 'pointer',
            }}
          />
        }
        onClose={() => setToastInfo({ open: false, message: '' })}
      >
        {toastInfo.message}
      </Toast>
      {renderContent()}
    </>
  );
}
