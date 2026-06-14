'use client';
import { Toast, IconButton, Typography, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled, ErrorFilled, Close } from '@castlery/fortress/Icons';

export function AtcActionToast({
  open,
  onClose,
  status,
  successText = 'Added to cart!',
  errorText = 'Action failed!',
}: {
  open: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  successText?: string;
  errorText?: string;
}) {
  const { mobile } = useBreakpoints();
  return (
    <Toast
      id="atc-action-toast"
      theme="dark"
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: mobile ? 'center' : 'right',
      }}
      startDecorator={status === 'success' ? <CheckCircleFilled /> : <ErrorFilled />}
      endDecorator={
        <IconButton onClick={onClose} sx={{ color: 'inherit', width: '24px', height: '24px', minHeight: 24 }}>
          <Close sx={{ color: 'inherit' }} />
        </IconButton>
      }
    >
      <Typography level="body1">{status === 'success' ? successText : errorText}</Typography>
    </Toast>
  );
}

export default AtcActionToast;
