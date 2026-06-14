import React, { useCallback, useMemo } from 'react';
import { Button } from '@castlery/fortress/Button';
import { withUseBreakpoints } from 'utils/page';
import dayjs from 'dayjs';
import { H1Title, SubH2Title } from './Titles';
import Info from './Info';
import { InfoLayout, ButtonLayout } from './Layout';
import TipBanner from './TipBanner';
import { Stack, Typography, Link } from '@castlery/fortress';
import { CircleStar } from 'fortress/Icons';

interface InfoViewProps {
  auth: any;
  subscription: Record<string, boolean>;
  changeMode(mode: string): void;
  breakpoints: { mobile: boolean; tablet: boolean };
}
const InfoView: React.FC<InfoViewProps> = ({ auth, subscription, changeMode, breakpoints }) => {
  const { mobile: isMobile, tablet } = breakpoints;
  const infos = useMemo(() => {
    const { user, loaded } = auth;
    const data = loaded ? user : { profile: {} };
    const profile = data?.profile || {};
    const firstProfile = !!profile.display_profile_reward_banner;
    return {
      base: [
        { fieldKey: 'name', label: 'Name', value: `${data.firstname || ''} ${data.lastname || ''}` },
        { fieldKey: 'password', label: 'Password', value: '●●●●●●●●' },
        { fieldKey: 'email', label: 'Email', value: data.email },
        { fieldKey: 'phone', label: 'Phone Number', value: data.phone },
        {
          fieldKey: 'emailSubscription',
          label: 'Email Subscription',
          value: subscription?.email ? 'Active' : 'Inactive',
        },
        {
          fieldKey: 'mobileSubscription',
          label: 'Mobile Subscription',
          value: data.phone ? (subscription?.sms ? 'Active' : 'Inactive') : '-',
        },
      ],
      profile: [
        {
          fieldKey: 'birthday',
          label: 'Date of Birth',
          value: profile.birthday ? dayjs(profile.birthday).format('MMM YYYY') : '',
        },
        { fieldKey: 'occupation', label: 'Occupation', value: profile.occupation },
        { fieldKey: 'housing_type', label: 'Housing Type', value: profile.housing_type },
        { fieldKey: 'home_size', label: 'Home Size', value: profile.home_size },
        { fieldKey: 'most_time_spent_location', label: 'Most time spent in', value: profile.most_time_spent_location },
        { fieldKey: 'annual_household_income', label: 'Budget and Finances', value: profile.annual_household_income },
      ],
      firstProfile,
    };
  }, [auth, subscription]);
  const buttonSx = useMemo(() => (isMobile ? { paddingX: 0 } : tablet ? { width: '30vw' } : {}), [isMobile, tablet]);

  const BirthdayBanner = useCallback(() => {
    const { user, loaded } = auth;
    if (!loaded) {
      return null;
    }
    const { profile } = user;
    if (profile?.birthday === '') {
      return (
        <Stack
          sx={{
            boxSizing: 'border-box',
            maxWidth: '471px',
            padding: '8px 12px',
            backgroundColor: (theme) => theme.palette.brand.wheat[50],
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <CircleStar />
          <Typography
            sx={{
              marginLeft: '8px',
              color: (theme) => theme.palette.brand.wheat[700],
              marginRight: '16px',
              textWrap: 'nowrap',
              fontSize: '14px',
            }}
          >
            Receive a yearly birthday reward on us!
          </Typography>
          <Link
            sx={{
              textWrap: 'nowrap',
              fontSize: '14px',
              textDecoration: 'underline',
              color: (theme) => theme.palette.brand.wheat[700],
            }}
            onClick={() => changeMode('edit-profile')}
          >
            Edit Profile Details
          </Link>
        </Stack>
      );
    }
    return null;
  }, [auth]);

  return (
    <>
      {infos.firstProfile && <TipBanner onGo={() => changeMode('edit-profile')} />}
      <H1Title>My Account</H1Title>
      <InfoLayout mobile={isMobile}>
        <Info key="base" list={infos.base} />
      </InfoLayout>
      <ButtonLayout mobile={isMobile || tablet}>
        <Button variant="secondary" sx={buttonSx} onClick={() => changeMode('edit-account-details')}>
          Edit Account Details
        </Button>
        <Button variant="secondary" sx={buttonSx} onClick={() => changeMode('edit-password')}>
          Update Password
        </Button>
      </ButtonLayout>
      <SubH2Title>My Profile</SubH2Title>
      <BirthdayBanner />
      <InfoLayout mobile={isMobile}>
        <Info key="profile" list={infos.profile} />
      </InfoLayout>
      <ButtonLayout mobile={isMobile}>
        <Button variant="secondary" sx={buttonSx} onClick={() => changeMode('edit-profile')}>
          Edit Profile Details
        </Button>
      </ButtonLayout>
    </>
  );
};
export default withUseBreakpoints(InfoView);
