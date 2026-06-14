'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Button,
  Stack,
  Box,
  Tag,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  useBreakpoints,
} from '@castlery/fortress';
import { User } from '@castlery/types';
import { ChevronRight, Star, Close } from '@castlery/fortress/Icons';
import { formatDate } from '@castlery/utils';
import { CustomLink } from '@castlery/shared-components';

// 与北京时间 2026-04-16 17:00 为同一瞬间；API 常用 …Z 时可与之一致地按 UTC 书写
const PROFILE_CREDITS_MODAL_CUTOFF = new Date('2026-04-16T09:00:00.000Z');

/** 弹窗曾展示过后写入，后续访问不再弹出 */
const PROFILE_CREDITS_MODAL_STORAGE_KEY_PREFIX = 'account:profile-update-credits-modal-seen';

function shouldShowProfileCreditsModal(profile: User['profile'] | undefined): boolean {
  const ref = profile?.updated_at ?? profile?.created_at;
  if (ref == null || ref === '') {
    return false;
  }
  const t = new Date(ref).getTime();
  if (Number.isNaN(t)) {
    return false;
  }
  return t < PROFILE_CREDITS_MODAL_CUTOFF.getTime();
}

interface AccountDetailsProps {
  userInfo?: User | null;
  onEditAccount?: () => void;
  onUpdatePassword?: () => void;
  onEditProfile?: () => void;
  customerSubscription?: {
    email: boolean;
    sms: boolean;
  };
}

export function AccountDetails({
  userInfo,
  customerSubscription,
  onEditAccount,
  onUpdatePassword,
  onEditProfile,
}: AccountDetailsProps) {
  const shouldShowCreditsModal = useMemo(() => shouldShowProfileCreditsModal(userInfo?.profile), [userInfo?.profile]);
  const profileCreditsModalStorageKey = useMemo(() => {
    if (!userInfo?.id) {
      return null;
    }
    return `${PROFILE_CREDITS_MODAL_STORAGE_KEY_PREFIX}:${userInfo.id}`;
  }, [userInfo?.id]);
  const [creditsModalDismissed, setCreditsModalDismissed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [seenInStorage, setSeenInStorage] = useState(false);
  const { mobile } = useBreakpoints();

  useEffect(() => {
    setCreditsModalDismissed(false);
  }, [userInfo?.id]);

  useEffect(() => {
    setStorageReady(false);

    if (!profileCreditsModalStorageKey) {
      setSeenInStorage(false);
      setStorageReady(true);
      return;
    }

    try {
      setSeenInStorage(localStorage.getItem(profileCreditsModalStorageKey) === '1');
    } catch {
      setSeenInStorage(false);
    } finally {
      setStorageReady(true);
    }
  }, [profileCreditsModalStorageKey]);

  const creditsModalOpen = storageReady && shouldShowCreditsModal && !creditsModalDismissed && !seenInStorage;

  useEffect(() => {
    if (!creditsModalOpen || !profileCreditsModalStorageKey) return;
    try {
      localStorage.setItem(profileCreditsModalStorageKey, '1');
    } catch {
      // 无痕 / 配额等场景忽略
    }
  }, [creditsModalOpen, profileCreditsModalStorageKey]);

  if (!userInfo) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Stack spacing={8}>
      <Modal open={creditsModalOpen} onClose={() => setCreditsModalDismissed(true)}>
        <ModalDialog
          sx={{
            width: mobile ? 342 : 640,
          }}
        >
          <Stack
            sx={{
              position: 'relative',
              width: '100%',
              px: mobile ? 9 : 6,
            }}
          >
            <Close
              onClick={() => setCreditsModalDismissed(true)}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: mobile ? 20 : 24,
                height: mobile ? 20 : 24,
                cursor: 'pointer',
              }}
            />
            <Typography
              id="modal-title"
              level="h3"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: mobile ? 238 : '100%',
                textAlign: 'center',
              }}
            >
              Update your profile to earn extra credits!
            </Typography>
          </Stack>
          <Stack direction={mobile ? 'column' : 'row'} gap={mobile ? 4 : 3} sx={{ mt: mobile ? 5 : 6 }}>
            <Button variant="secondary" fullWidth onClick={() => setCreditsModalDismissed(true)}>
              Maybe later
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setCreditsModalDismissed(true);
                onEditProfile?.();
              }}
            >
              Update
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
      <Stack spacing={6}>
        <Typography level="h2">My Account</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              // xs: '1fr',
              xs: '1fr 1fr',
              sm: '1fr 1fr',
            },
            gap: {
              xs: 3,
              sm: 4,
            },
            rowGap: {
              xs: 4,
              sm: 4,
            },
            '& .account-field': {
              display: 'flex',
              flexDirection: 'column',
            },
            '& .account-buttons': {
              gridColumn: {
                xs: '1',
                sm: '1 / -1', // 跨所有列
              },
            },
          }}
        >
          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Name
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.firstname} {userInfo.lastname}
            </Typography>
          </Box>

          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Password
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              ••••••••
            </Typography>
          </Box>

          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Email
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.email}
            </Typography>
          </Box>

          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Phone number
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.phone || '-'}
            </Typography>
          </Box>

          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Email subscription
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {customerSubscription?.email ? 'Active' : 'Inactive'}
            </Typography>
          </Box>

          <Box className="account-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Mobile subscription
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.phone ? (customerSubscription?.sms ? 'Active' : 'Inactive') : '-'}
            </Typography>
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={6}>
          <Button variant="outlined" color="neutral" onClick={onEditAccount}>
            Edit account details
          </Button>
          <Button variant="outlined" color="neutral" onClick={onUpdatePassword}>
            Update password
          </Button>
        </Stack>
      </Stack>

      {/* Profile Details Section */}

      <Stack spacing={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Typography level="h2">My Profile</Typography>
          {userInfo.profile?.birthday === '' && (
            <Tag
              variant="solid"
              startDecorator={<Star />}
              endDecorator={<ChevronRight />}
              onClick={onEditProfile}
              sx={{
                cursor: 'pointer',
              }}
            >
              <Typography level="caption1">Receive a yearly reward on us!</Typography>
            </Tag>
          )}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              // xs: '1fr',
              xs: '1fr 1fr',
              sm: '1fr 1fr',
            },
            gap: {
              xs: 3,
              sm: 4,
            },
            rowGap: {
              xs: 4,
              sm: 6,
            },
            '& .profile-field': {
              display: 'flex',
              flexDirection: 'column',
            },
            '& .profile-button': {
              gridColumn: {
                xs: '1',
                sm: '1 / -1', // 跨所有列
              },
            },
          }}
        >
          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Date of birth
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.birthday ? formatDate(userInfo.profile?.birthday, 'MMM yyyy') : '-'}
            </Typography>
          </Box>

          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Housing type
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.housing_type || '-'}
            </Typography>
          </Box>

          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              House size
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.home_size || '-'}
            </Typography>
          </Box>

          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Annual household income
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.annual_household_income || '-'}
            </Typography>
          </Box>

          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Home ownership
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.home_ownership || '-'}
            </Typography>
          </Box>

          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Household size
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {userInfo.profile?.household_size || '-'}
            </Typography>
          </Box>
          <Box className="profile-field">
            <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              Household structure
            </Typography>
            <Typography level="body1" sx={{ py: 4 }}>
              {Array.isArray(userInfo.profile?.household_structure)
                ? userInfo.profile?.household_structure?.join(', ')
                : '-'}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="neutral"
          onClick={onEditProfile}
          sx={{
            width: {
              xs: '100%',
              sm: 'fit-content',
              md: 'fit-content',
            },
          }}
        >
          Edit profile details
        </Button>
      </Stack>

      <Box>
        <Divider sx={{ mb: 6 }} />
        <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
          The birthday reward is an annual reward and will only be awarded to The Castlery Club members who have made at
          least 1 purchase before and have given their birthday information at least 7 days prior to the start of the
          month. All standard <CustomLink linkKey="promo-terms">Terms and Conditions</CustomLink> apply.
        </Typography>
      </Box>
    </Stack>
  );
}
