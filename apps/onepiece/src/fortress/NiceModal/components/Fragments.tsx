import React from 'react';
import { Error, CheckCircle, Info, Block } from 'fortress/Icons';
import { Box, Typography, Stack } from 'fortress';
import { type EventAction } from './BaseModal';

interface TitleProps {
  success?: boolean;
  warning?: boolean;
  information?: boolean;
  danger?: boolean;
  title?: string | React.ReactElement;
}
export const Title: React.FC<TitleProps> = ({
  title,
  success = false,
  warning = false,
  danger = false,
  information = false,
}) => {
  if (!title) return null;
  const hasIcon = success || warning || information || danger;

  return (
    <Typography
      id="modal-modal-title"
      level="h2"
      startDecorator={
        hasIcon ? (
          <Stack sx={{ mt: (theme) => theme.spacing(3 / 8), mr: -0.5 }}>
            {success && <CheckCircle sx={{ color: 'var(--fortress-palette-success-200)', width: 42, height: 42 }} />}
            {warning && (
              <Error sx={{ color: 'var(--fortress-palette-brand-harvestGold-400)', width: 42, height: 42 }} />
            )}
            {information && <Info sx={{ color: 'var(--fortress-palette-brand-blueNCS-300)', width: 42, height: 42 }} />}
            {danger && <Block sx={{ color: 'var(--fortress-palette-brand-upsdellRed-200)', width: 42, height: 42 }} />}
          </Stack>
        ) : null
      }
      sx={{
        mb: 2,
        alignItems: 'flex-start',
        paddingX: 2,
        textAlign: hasIcon ? 'left' : 'center',
      }}
    >
      {title}
    </Typography>
  );
};

interface DescProps {
  desc?: string | React.ReactElement;
  subDesc?: string | React.ReactElement;
}
export const Desc: React.FC<DescProps> = ({ desc, subDesc }) => {
  return (
    <Box id="modal-modal-description" sx={{ textAlign: 'center' }}>
      {!!desc && (
        <Typography sx={{ mt: 2 }} level="body2">
          {desc}
        </Typography>
      )}
      {!!subDesc && (
        <Typography sx={{ mt: 2, fontSize: 12, color: 'var(--fortress-palette-brand-charcoal-400)' }}>
          {subDesc}
        </Typography>
      )}
    </Box>
  );
};

interface ActionOwnProps {
  onClose: () => void;
  sx?: Object;
  beforeClose?: EventAction;
  onCancel?: () => void;
  onConfirm?: () => void;
  isSilent?: boolean;
  children?: React.ReactNode;
}

export interface ActionHolderRef {
  handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleConfirm: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export const ModalActions = React.forwardRef<ActionHolderRef, ActionOwnProps>(
  ({ beforeClose, onClose, onCancel, onConfirm, isSilent = true, sx = {}, children }, ref) => {
    const mergeClose = (
      event: React.MouseEvent<HTMLButtonElement>,
      reason: 'escapeKeyDown' | 'backdropClick' | 'closeClick' | 'cancelClick' | 'confirmClick'
    ) => {
      if (typeof beforeClose === 'function') {
        beforeClose(event, reason);
      }
      onClose();
    };
    React.useImperativeHandle(
      ref,
      () => ({
        handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (typeof onCancel === 'function') {
            onCancel();
            mergeClose(event, 'cancelClick');
            return;
          }
          mergeClose(event, 'cancelClick');
        },
        handleConfirm: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
          if (isSilent) {
            mergeClose(event, 'confirmClick');
          }
        },
      }),
      []
    );

    return (
      <Box
        id="modal-modal-footer"
        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '-1px', ...sx }}
      >
        {children}
      </Box>
    );
  }
);
