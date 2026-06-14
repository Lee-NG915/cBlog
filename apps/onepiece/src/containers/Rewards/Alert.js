import React, { useState, useEffect } from 'react';
import { Box, Link, Typography, Stack, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { Alert } from 'fortress';

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

const AlertMsg = ({ type = 'success', open = false, close = () => {}, sx = {}, msg, router }) => {
  const props = map.get(type);
  const { desktop } = useBreakpoints();

  useEffect(() => {
    if (open) {
      const timerId = setTimeout(() => {
        close();
        timerId && clearTimeout(timerId);
      }, 5000);
    }
  }, [open]);
  if (!desktop) {
    return (
      <Alert
        {...props}
        {...sx}
        data-open={open}
        startDecorator={desktop ? <CheckCircleFilled sx={{ color: 'var(--fortress-palette-success-200)' }} /> : null}
        endDecorator={
          desktop ? (
            <Box onClick={close}>
              <Close sx={{ verticalAlign: 'middle' }} />
            </Box>
          ) : null
        }
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '90vw',
          maxWidth: 359,
          borderRadius: '8px',
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
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'nowrap',
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <CheckCircleFilled sx={{ color: 'var(--fortress-palette-success-200)' }} />
              <Typography
                sx={{
                  marginLeft: 1,
                  fontSize: '14px',
                  color: '#fff',
                }}
              >
                Birth date updated!
              </Typography>
            </Stack>
            <Box onClick={close}>
              <Close sx={{ verticalAlign: 'middle' }} />
            </Box>
          </Stack>
          <Typography
            sx={{
              fontSize: '16px',
              color: '#fff',
            }}
          >
            {msg || ''}
          </Typography>
          <Link
            onClick={() => {
              router.push('/account/profile');
            }}
            sx={{
              fontSize: '14px',
              color: '#fff',
              textDecoration: 'underline',
              '&:hover': {
                color: '#fff',
              },
            }}
          >
            Update Profile
          </Link>
        </Stack>
      </Alert>
    );
  }
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
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
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
      }}
    >
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            color: '#fff',
            marginRight: 2,
          }}
        >
          Birth date updated!
        </Typography>
        <Typography
          sx={{
            fontSize: '16px',
            color: '#fff',
            marginRight: 3,
          }}
        >
          {msg || ''}
        </Typography>
        <Link
          onClick={() => {
            router.push('/account/profile');
          }}
          sx={{
            fontSize: '14px',
            color: '#fff',
            textDecoration: 'underline',
            '&:hover': {
              color: '#fff',
            },
          }}
        >
          Update Profile
        </Link>
      </Stack>
    </Alert>
  );
};

export const useAlertMsg = () => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const close = () => {
    setOpen(false);
    setMsg('');
  };
  const show = (msg) => {
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
