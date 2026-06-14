'use client';
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  useBreakpoints,
  Drawer,
  DialogTitle,
  ModalClose,
  DialogContent,
} from '@castlery/fortress';
import { DeviceError } from '@castlery/fortress/Icons';

// AR 错误模态框组件的 Props
interface ARErrorModalProps {
  open: boolean;
  onClose: () => void;
}

export const ARErrorModal: React.FC<ARErrorModalProps> = ({ open, onClose }) => {
  const { desktop } = useBreakpoints();

  return (
    <Drawer
      anchor={'bottom'}
      open={open}
      onClose={onClose}
      disableScrollLock={true}
      sx={{
        ...(!desktop && {
          '--Drawer-verticalSize': '85vh',
        }),
        zIndex: 20000,
      }}
    >
      <DialogTitle component={Box}>
        <ModalClose />
      </DialogTitle>
      <DialogContent
        sx={{
          px: 6,
        }}
      >
        <Stack justifyContent={'center'} alignItems={'center'}>
          <DeviceError
            sx={{
              width: 50,
              height: 84,
              my: 5,
            }}
          />

          <Typography component="h2" textAlign="center">
            We are unable to load AR on your phone
          </Typography>

          <Stack gap={4} my={6}>
            <Typography level="body2">It is likely that your mobile device did not meet these requirements:</Typography>

            <Stack alignContent={'flex-start'}>
              <Typography level="body1">iOS</Typography>
              <Typography level="body2">iPhone 7 and newer, iPad 5 and newer, running iOS 12+</Typography>
            </Stack>

            <Stack alignContent={'flex-start'}>
              <Typography level="body1">Android</Typography>
              <Typography level="body2">Devices with ARCore 1.9 support on Android 8+</Typography>
            </Stack>

            <Typography level="body2">You may wish to update your software and try again.</Typography>
          </Stack>

          <Button
            variant="primary"
            onClick={onClose}
            sx={{
              width: '100%',
            }}
          >
            Back
          </Button>
        </Stack>
      </DialogContent>
    </Drawer>
  );
};
