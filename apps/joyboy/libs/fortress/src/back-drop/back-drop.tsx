import * as React from 'react';
import { Box, BoxProps, CircularProgress } from '@mui/joy';

interface BackdropProps extends BoxProps {
  open: boolean;
  children?: React.ReactNode;
}
// TODO 到时要去和设计师对齐
const Backdrop: React.FC<BackdropProps> = ({ open, children, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // TODO 可以和 drawer 的 bgcolor 保持一致
        // --fortress-palette-background-backdrop
        bgcolor: (theme) => theme.palette.background.backdrop,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.modal + 1,
        pointerEvents: open ? 'auto' : 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms',
      }}
      {...props}
    >
      {children || <CircularProgress size="sm" color="neutral" variant="plain" thickness={2.5} />}
    </Box>
  );
};

export { Backdrop };
