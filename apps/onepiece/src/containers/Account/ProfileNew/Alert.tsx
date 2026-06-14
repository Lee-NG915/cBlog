import React, { useState, useEffect } from 'react';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { Alert } from '@mui/joy';
import { Box } from '@castlery/fortress';

const map = new Map([
  [
    'success',
    {
      size: 'lg',
      variant: 'solid',
      color: 'neutral',
      startDecorator: <CheckCircleFilled sx={{ color: 'var(--fortress-palette-success-200)' }} />,
      sx: {
        width: '80vw',
        maxWidth: 900,
        borderRadius: '16px',
        background: 'var(--fortress-palette-brand-charcoal-800)',
        position: 'fixed',
        left: 0,
        right: 0,
        margin: 'auto',
        zIndex: -1,
        transform: 'translateY(100vh)',
        opacity: 0,
        border: 0,
        '&[data-open="true"]': {
          zIndex: 9999,
          transform: 'translateY(60vh)',
          opacity: 1,
          transition: 'transform 500ms ease,opacity 800ms ease-in-out',
        },
      },
    },
  ],
]);
interface AlertMsgProps {
  type: 'info' | 'success' | 'warning' | 'error';
  msg?: React.ReactNode;
  open: boolean;
  close: () => void;
  sx?: {};
}
const AlertMsg: React.FC<AlertMsgProps> = ({ type = 'success', open = false, close = () => {}, sx = {}, msg }) => {
  const props = map.get(type) || {};
  useEffect(() => {
    if (open) {
      const timerId = setTimeout(() => {
        close();
        timerId && clearTimeout(timerId);
      }, 5000);
    }
  }, [open]);
  return (
    <Alert
      {...props}
      {...sx}
      data-open={open}
      endDecorator={
        <Box onClick={close}>
          <Close sx={{ verticalAlign: 'middle' }} />
        </Box>
      }
    >
      {msg || ''}
    </Alert>
  );
};

export const useAlertMsg = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');
  const close = () => {
    setOpen(false);
    setMsg('');
  };
  const show = (msg: string) => {
    setMsg(msg);
    setOpen(true);
  };
  return {
    show,
    close,
    alertProps: {
      open,
      close,
      msg,
    },
    AlertMsg,
  };
};

export default React.memo(AlertMsg);
