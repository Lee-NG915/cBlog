import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { Alert } from '@mui/joy';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInAU } from 'config';

interface AlertMsgProps {
  open: boolean;
  close: () => void;
  sx?: React.CSSProperties | {};
  getContainer?: () => HTMLElement | null;
}
const AlertMsg: React.FC<AlertMsgProps> = ({ open = false, close = () => {}, sx = {}, getContainer }) => {
  const { desktop, mobile } = useBreakpoints();
  const AlertRef = useRef(null);

  useEffect(() => {
    let timerId: any;
    if (open) {
      timerId = setTimeout(() => {
        close();
      }, 4000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [open]);

  useEffect(() => {
    if (AlertRef.current) {
      const container = typeof getContainer === 'function' ? getContainer() : document.getElementById('root');
      container && container.appendChild(AlertRef.current);
    }
  }, [getContainer, AlertRef]);

  return (
    <Alert
      ref={AlertRef}
      variant="solid"
      color="neutral"
      data-open={open}
      startDecorator={<CheckCircleFilled sx={{ color: (theme) => theme.palette.success[200] }} />}
      endDecorator={<Close onClick={close} sx={{ cursor: 'pointer' }} />}
      sx={{
        ...{
          width: !mobile ? '468px' : '95vw',
          maxWidth: 800,
          height: 50,
          lineHeight: 50,
          fontSize: desktop ? '16px' : '14px',
          borderRadius: '16px',
          background: (theme) => theme.palette.brand.charcoal[800],
          position: 'fixed',
          left: desktop ? 'auto' : 0,
          right: desktop ? '20px' : 0,
          bottom: 0,
          margin: 'auto',
          zIndex: -1,
          transform: 'translateY(100vh)',
          opacity: 0,
          border: 0,
          '&[data-open="true"]': {
            zIndex: 99999,
            transform: 'translateY(-10vh)',
            paddingX: 1.5,
            opacity: 1,
            transition: 'transform 500ms ease,opacity 800ms ease-in-out',
          },
        },
        ...sx,
      }}
    >
      {`${globalFeatureInAU ? 'Postcode' : 'Zip code'} has been updated!`}
    </Alert>
  );
};

export const useAlertMsg = () => {
  const [open, setOpen] = useState<boolean>(false);
  const close = () => {
    setOpen(false);
  };
  const show = () => {
    setOpen(true);
  };

  return {
    show,
    close,
    alertProps: {
      open,
      close,
    },
    AlertMsg,
  };
};

export default React.memo(AlertMsg);
