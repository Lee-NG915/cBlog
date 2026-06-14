import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import { Box, Typography, useBreakpoints } from '@castlery/fortress';
import { connect } from 'react-redux';
import { update as updateUser } from 'redux/modules/auth';
import {
  loadIfNeeded as loadSubscription,
  updateMsgGroupsSubscription as updateSubscription,
} from 'redux/modules/subscription';
import { FrameContext, FrameContextType } from 'containers/Frame/FrameContext';
import InfoView from './InfoView';
import EditAccountDetail from './EditAccountDetail';
import EditProfile from './EditProfile';
import EditPassword from './EditPassword';
import { useAlertMsg } from './Alert';

export type PageMode = 'view' | 'edit-account-details' | 'edit-password' | 'edit-profile';
const mapStateToProps = (state: any) => ({
  auth: state.auth,
  subscription: state.subscription,
});
const mapDispatchToProps = {
  updateUser,
  loadSubscription,
  updateSubscription,
};
interface OwnProps {}
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;
const ProfilePage: React.FC<Props> = ({
  auth,
  subscription,
  updateUser,
  updateSubscription,
  loadSubscription,
  onChangeMode,
}) => {
  const frame: FrameContextType | null = useContext(FrameContext);
  const { desktop } = useBreakpoints();
  const [pageMode, setPageMode] = useState<PageMode>('view');
  const { show, AlertMsg, alertProps } = useAlertMsg();
  const { account, profile } = useMemo(() => {
    const { user, loaded } = auth;
    const data = loaded ? user : { profile: {} };
    const profile = data?.profile || {};

    return {
      account: {
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        email: data.email || '',
        phone: data.phone || '',
      },
      profile: {
        birthday: profile.birthday ? new Date(profile.birthday) : '',
        occupation: profile.occupation || '',
        housing_type: profile.housing_type || '',
        home_size: profile.home_size || '',
        most_time_spent_location: profile.most_time_spent_location || '',
        annual_household_income: profile.annual_household_income || '',
      },
    };
  }, [auth]);
  const msgSubscription = useMemo(() => {
    const { email, sms } = subscription?.data?.message_groups?.find(
      (g: Record<string, any>) => g.name === 'promotions' && g
    )?.deliver_types || { email: false, sms: false };
    return { email, sms };
  }, [subscription?.data]);

  const changeMode = useCallback((mode: PageMode) => {
    setPageMode(mode);
    window?.scrollTo({ top: 0, behavior: 'smooth' });
    alertProps?.close();
  }, []);

  useEffect(() => {
    if (onChangeMode !== undefined) {
      onChangeMode(pageMode);
    }
  }, [pageMode, changeMode]);

  const cancel = useCallback((needTip = true) => {
    if (!needTip) {
      changeMode('view');
      return;
    }
    const description = (
      <Typography textAlign="center" level="body1">
        Are you sure you want to leave without saving?
      </Typography>
    );
    frame?.openModal('confirmation', {
      title: 'You have unsaved changes',
      titleClassStr: 'account-modal--title',
      description,
      confirmText: 'Cancel',
      cancelText: 'Leave',
      onCancel: () => changeMode('view'),
    });
  }, []);

  const submit = useCallback(({ values, subscribe, msg, refresh = () => {} }, e: Event) => {
    e?.preventDefault();
    const arr = subscribe ? [updateUser(values), updateSubscription(subscribe)] : [updateUser(values)];
    Promise.all(arr)
      .then((res: Record<string, any>[]) => {
        refresh();
        changeMode('view');
        const msgStr = typeof msg === 'function' ? msg(res[0]?.profile?.is_initial_record) : msg;
        show(msgStr);
      })
      .catch((error) => {
        frame?.openModal('response', { body: error });
        refresh();
      });
  }, []);

  useEffect(() => {
    // @ts-ignore
    loadSubscription().catch((error: any) => {
      frame?.openModal('response', { body: error });
    });
  }, []);

  return (
    <Box
      sx={{
        paddingLeft: desktop ? '50px' : 0,
      }}
    >
      <AlertMsg type="success" {...alertProps} />
      {pageMode === 'view' && <InfoView auth={auth} subscription={msgSubscription} changeMode={changeMode} />}
      {pageMode === 'edit-account-details' && (
        <EditAccountDetail subscription={msgSubscription} defaultValue={account} cancel={cancel} submit={submit} />
      )}
      {pageMode === 'edit-profile' && <EditProfile defaultValue={profile} cancel={cancel} submit={submit} />}
      {pageMode === 'edit-password' && <EditPassword email={account.email} cancel={cancel} submit={submit} />}
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
