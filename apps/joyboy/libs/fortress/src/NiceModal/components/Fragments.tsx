import React from 'react';
import { Block, CheckCircle, Error, ErrorTips, Info } from '../../Icons';
import { Box, Stack, Typography } from '../../index';
import { type EventAction } from './BaseModal';

interface TitleProps {
  success?: boolean;
  warning?: boolean;
  info?: boolean;
  danger?: boolean;
  title?: string | React.ReactElement;
  confirmation?: boolean;
  mobile?: boolean;
}
export const Title: React.FC<TitleProps> = ({
  title,
  success = false,
  warning = false,
  danger = false,
  info = false,
  confirmation = false,
  mobile = false,
}) => {
  if (!title) return null;

  const hasIcon = success || warning || info || danger || confirmation;

  return (
    <Typography
      id="modal-modal-title"
      level="h3"
      sx={{
        alignItems: 'anchor-center',
        textAlign: 'center',
        '& .MuiTypography-startDecorator': {
          marginInlineEnd: 2,
          marginBottom: 'auto',
        },
      }}
      startDecorator={
        hasIcon ? (
          <Stack>
            {success && (
              <CheckCircle
                width={mobile ? '24px' : '36px'}
                height={mobile ? '24px' : '36px'}
                sx={{ color: 'var(--fortress-palette-success-500)' }}
              />
            )}
            {warning && (
              <Error
                width={mobile ? '24px' : '36px'}
                height={mobile ? '24px' : '36px'}
                sx={{ color: 'var(--fortress-palette-warning-500)' }}
              />
            )}
            {info && (
              <Info
                width={mobile ? '24px' : '36px'}
                height={mobile ? '24px' : '36px'}
                sx={{ color: 'var(--fortress-palette-brand-blueNCS-300)' }}
              />
            )}
            {danger && (
              <Error
                width={mobile ? '24px' : '36px'}
                height={mobile ? '24px' : '36px'}
                sx={{ color: 'var(--fortress-palette-danger-500)' }}
              />
            )}
            {confirmation && (
              <ErrorTips
                width={mobile ? '24px' : '36px'}
                height={mobile ? '24px' : '36px'}
                sx={{ color: 'var(--fortress-palette-brand-mono-900)' }}
              />
            )}
          </Stack>
        ) : null
      }
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
  if (!desc && !subDesc) return null;
  return (
    <Box id="modal-modal-description">
      {!!desc && (
        <Typography level="body2" sx={{ textAlign: 'center' }}>
          {desc}
        </Typography>
      )}
      {!!subDesc && <Typography sx={{ fontSize: 12 }}>{subDesc}</Typography>}
    </Box>
  );
};

interface ActionOwnProps {
  onClose: () => void;
  sx?: Record<string, any>;
  beforeClose?: EventAction;
  onCancel?: () => void;
  onConfirm?: () => Promise<any> | any;
  isSilent?: boolean;
  disabledCloseByClickBackdrop: boolean;
  children?: React.ReactNode;
}

export interface ActionHolderRef {
  handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleConfirm: (event: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
}
export const ModalActions = React.forwardRef<ActionHolderRef, ActionOwnProps>(
  (
    { beforeClose, onClose, onCancel, onConfirm, isSilent = true, sx = {}, children, disabledCloseByClickBackdrop },
    ref
  ) => {
    React.useImperativeHandle(
      ref,
      () => {
        const mergeClose = (
          event: React.MouseEvent<HTMLButtonElement>,
          reason: 'escapeKeyDown' | 'backdropClick' | 'closeClick' | 'cancelClick' | 'confirmClick'
        ) => {
          if (disabledCloseByClickBackdrop && reason === 'backdropClick') return;
          if (typeof beforeClose === 'function') {
            beforeClose(event, reason);
          }
          onClose();
        };

        return {
          handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => {
            if (typeof onCancel === 'function') {
              onCancel();
              mergeClose(event, 'cancelClick');
              return;
            }
            mergeClose(event, 'cancelClick');
          },
          handleConfirm: async (event: React.MouseEvent<HTMLButtonElement>) => {
            let res;
            if (typeof onConfirm === 'function') {
              res = await onConfirm();
            }
            if (isSilent) {
              mergeClose(event, 'confirmClick');
            }
            return res;
          },
        };
      },
      [isSilent, onConfirm, onCancel, beforeClose, onClose, disabledCloseByClickBackdrop]
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
ModalActions.displayName = 'ModalActions';
