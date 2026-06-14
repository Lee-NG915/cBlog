'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Stack, Button, Drawer, drawerClasses } from '@castlery/fortress';
import { ArrowBackIosNew } from '@castlery/fortress/Icons';

export interface JoyDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showMasker?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  sx?: Record<string, any>;
  /**
   * Extra attributes for the Drawer component from JoyUI
   */
  extraAttributes?: Record<string, any>;
}

export const JoyDrawer: React.FC<JoyDrawerProps> = ({
  open,
  onClose,
  children,
  showMasker = false,
  position = 'right',
  sx = {},
  extraAttributes = {},
}) => {
  return (
    <Drawer
      variant="plain"
      anchor={position}
      hideBackdrop={!showMasker}
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.content}`]: {
          width: '100vw',
          paddingX: 4,
          paddingY: 3,
          gap: 3,
        },
        ...sx,
      }}
      {...extraAttributes}
    >
      <Stack sx={{ alignItems: 'flex-start' }}>
        <Button variant="tertiary" sx={{ padding: 0, height: 28, minHeight: 28 }} onClick={onClose}>
          <ArrowBackIosNew sx={{ mr: 1, color: 'inherit' }} /> Back
        </Button>
      </Stack>
      {children}
    </Drawer>
  );
};

export default JoyDrawer;
