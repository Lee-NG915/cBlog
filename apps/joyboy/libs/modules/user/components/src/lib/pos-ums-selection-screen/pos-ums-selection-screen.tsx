'use client';
import { Box, Button, Link, Modal, ModalClose, ModalDialog, Stack, Typography } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';

export const POS_UMS_REGION_BANNER_IMAGE =
  'https://res.cloudinary.com/castlery/image/upload/q_auto/f_auto/v1776051917/test/full-width_banner.png';
export const POS_UMS_BRANCH_BANNER_IMAGE =
  'https://res.cloudinary.com/castlery/image/upload/q_auto/f_auto/v1776051917/test/full-width_banner.png';

type PosUmsSelectionOption = {
  value: string;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
};

type PosUmsSelectionScreenProps = {
  bannerImage: string;
  heroTitle: string;
  title: string;
  options: PosUmsSelectionOption[];
  footerActionLabel?: string;
  onFooterAction?: () => void | Promise<void>;
};

type PosUmsAccessDeniedModalProps = {
  deniedText: string;
  open: boolean;
  onClose: () => void;
};

type PosUmsLoginRecoveryModalProps = {
  open: boolean;
  title: string;
  description: string;
  onRetryLogin: () => void | Promise<void>;
  onSelectRegion: () => void | Promise<void>;
};

export function PosUmsAccessDeniedModal({ deniedText, open, onClose }: PosUmsAccessDeniedModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      // sx={{
      //   '& .MuiModal-backdrop': {
      //     backgroundColor: 'rgba(27, 44, 35, 0.3)',
      //   },
      // }}
    >
      <ModalDialog
        sx={{
          width: { xs: 'calc(100vw - 32px)', md: 640 },
          maxWidth: 640,
        }}
      >
        <ModalClose
          sx={{
            top: 16,
            right: 16,
          }}
        />
        <Stack gap={3} alignItems="center">
          <Typography level="h3">Access Denied</Typography>
          <Typography level="body2">
            {deniedText}
            <br />
            Please select a different country or contact your admin.
          </Typography>
          <Button variant="primary" fullWidth onClick={onClose}>
            OK
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export function PosUmsLoginRecoveryModal({
  open,
  title,
  description,
  onRetryLogin,
  onSelectRegion,
}: PosUmsLoginRecoveryModalProps) {
  return (
    <Modal
      open={open}
      sx={{
        '& .MuiModal-backdrop': {
          backgroundColor: 'rgba(27, 44, 35, 0.3)',
        },
      }}
    >
      <ModalDialog
        sx={{
          width: { xs: 'calc(100vw - 32px)', md: 640 },
          maxWidth: 640,
        }}
      >
        <Stack gap={3} alignItems="center">
          <Typography level="h3">{title}</Typography>
          <Typography level="body2">{description}</Typography>
          <Stack gap={3} sx={{ width: '100%' }}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onRetryLogin();
              }}
            >
              Retry Login
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                onSelectRegion();
              }}
            >
              Select Country
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export function PosUmsSelectionScreen({
  bannerImage,
  heroTitle,
  title,
  options,
  footerActionLabel,
  onFooterAction,
}: PosUmsSelectionScreenProps) {
  const bannerHeight = { xs: 200, md: 240 };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: bannerHeight,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <FortressImage
            src={bannerImage}
            alt=""
            objectFit="cover"
            lazy={false}
            sizes="100vw"
            sx={{
              // FortressImage wraps next/image with AspectRatio. For a hero banner we want the
              // same behavior as `background-size: cover`, so the aspect-ratio padding must be disabled
              // and the image should follow the fixed parent height directly.
              '--AspectRatio-paddingBottom': '0px',
              width: '100%',
              height: '100%',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: bannerHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Typography
            level="h1"
            sx={{
              color: 'var(--fortress-palette-brand-warmLinen-500)',
            }}
          >
            {heroTitle}
          </Typography>
        </Box>
      </Box>

      <Stack
        alignItems="center"
        sx={{
          pt: { xs: 10, md: 17 },
          pb: 15,
          px: 2,
        }}
      >
        <Stack
          gap={7}
          alignItems="center"
          sx={{
            width: '100%',
            maxWidth: 300,
          }}
        >
          <Typography level="h4">{title}</Typography>

          <Stack gap={6} sx={{ width: '100%' }}>
            {options.map((option) => (
              <Button
                key={option.value}
                variant="secondary"
                loading={option.loading}
                disabled={option.disabled}
                onClick={() => {
                  option.onClick();
                }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>

          {footerActionLabel && onFooterAction ? (
            <Link
              onClick={() => {
                onFooterAction();
              }}
            >
              {footerActionLabel}
            </Link>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
