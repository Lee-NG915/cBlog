'use client';
import { EcEnv } from '@castlery/config';
import {
  Container,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Toast,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { CancelFilled, CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { selectedActiveUser, useUpdateUserProfileMutation } from '@castlery/modules-user-domain';
import { FortressImage } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useState } from 'react';
import { BirthdayForm } from './birthday-form';

interface BirthdayModalContentProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

function BirthdayModalContent({ open, onClose, onSubmit }: BirthdayModalContentProps) {
  const { desktop, mobile, tablet } = useBreakpoints();

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onClose();
        }
      }}
      sx={{
        padding: 0,
        '.MuiCard-root': {
          padding: 0,
        },
      }}
    >
      <ModalDialog
        sx={{
          display: 'flex',
          border: 'none',
          flexDirection: desktop ? 'row' : 'column',
          alignItems: 'center',
          gap: 0,
          width: {
            xs: '342px',
            sm: '640px',
            md: '880px',
          },
          justifyContent: 'space-between',
          padding: 0,
        }}
      >
        <ModalClose
          slots={
            !desktop
              ? {
                  root: CancelFilled,
                }
              : undefined
          }
        />
        <FortressImage
          imageWidth={desktop ? 400 : tablet ? 640 : 342}
          imageHeight={desktop ? 400 : tablet ? 420 : 255}
          // ratio={desktop ? 400 / 400 : tablet ? 640 / 420 : 342 / 255}
          objectFit="fill"
          src={'https://res.cloudinary.com/castlery/image/upload/v1730863578/Onepiece/x7ux9zigp0deikajli9w.png'}
          alt="cover image"
          sx={{
            '--AspectRatio-paddingBottom': 0,
          }}
        />

        <Stack
          sx={{
            height: '100%',
            alignItems: 'center',
            px: {
              xs: 4,
              sm: 6,
              md: 6,
            },
            py: {
              xs: 6,
              sm: 6,
              md: 6,
            },
            flex: 1,
          }}
        >
          <Typography level="h3">Get Your Birthday Treat!</Typography>
          <Typography
            level="body2"
            textAlign="center"
            sx={{
              mt: 2,
              mb: {
                xs: 5,
                sm: 5,
                md: 5,
              },
            }}
          >
            We want to celebrate your special day! Let us know your birthday and receive a birthday treat on your next
            birthday.*
          </Typography>
          <BirthdayForm onSubmit={onSubmit} isMobile={mobile} />
          <Typography level="caption2">
            T&Cs apply. Birthday rewards will be given out on the first day of every month. Birthday needs to be
            submitted at least 7 days before birthday month to receive the reward. Once saved, this date cannot be
            modified.
          </Typography>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export function BirthdayModal() {
  const user = useAppSelector(selectedActiveUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [updateUser] = useUpdateUserProfileMutation();
  useEffect(() => {
    if (user) {
      // setModalOpen(true);
      setModalOpen(user?.profile?.birthday ? false : true);
    }
  }, [user]);

  const handleSubmitWith = useCallback(
    async (value: any) => {
      if (!user?.id || !value?.birthday) return;
      try {
        await updateUser({ profile_attributes: { birthday: value?.birthday } }).unwrap();
        setToast({ open: true, message: 'Date of birth has been updated! Complete your profile to earn 20 credits.' });
      } catch (e: any) {
        setToast({ open: true, message: 'Failed to update birthday. Please refresh the page and try again.' });
      } finally {
        setModalOpen(false);
      }
    },
    [user, updateUser]
  );

  return (
    <Container disableGutters>
      <BirthdayModalContent
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onSubmit={handleSubmitWith}
      />
      <Toast
        theme="dark"
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        sx={{
          width: '95%',
        }}
        actionSlot={
          <Link href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/account/profile`} variant="tertiary">
            Update Profile
          </Link>
        }
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
    </Container>
  );
}
