'use client';

import React from 'react';
import { Box, IconButton, Modal, ModalClose, useBreakpoints } from '@castlery/fortress';
import { DynamicModalDialog } from '@castlery/shared-fortress-client';
import { Close } from '@castlery/fortress/Icons';

interface AfterpayModalProps {
  open: boolean;
  onClose: () => void;
}

export const AfterpayModal = ({ open, onClose }: AfterpayModalProps) => {
  const { mobile, desktop } = useBreakpoints();

  const handleBackdropClick = (event: React.MouseEvent) => {
    // Close modal when clicking backdrop
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={
        mobile
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          : {}
      }
    >
      <DynamicModalDialog
        layout="center"
        onClick={handleBackdropClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: desktop ? '774px' : '100%',
          maxHeight: desktop ? '628px' : mobile ? '90vh' : '100%',
          border: 'none',
          borderRadius: desktop ? '24px' : 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        {/* Afterpay iframe */}
        <Box
          component="iframe"
          src="https://static.afterpay.com/modal/en_AU.html"
          title="Afterpay"
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: desktop ? '24px' : 0,
          }}
        />

        {/* Close button */}
        <ModalClose
          onClick={handleBackdropClick}
          sx={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            zIndex: 2,
            padding: '10px',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& svg': {
              width: '22px',
              height: '22px',
              color: '#000',
            },
          }}
        />
      </DynamicModalDialog>
    </Modal>
  );
};
