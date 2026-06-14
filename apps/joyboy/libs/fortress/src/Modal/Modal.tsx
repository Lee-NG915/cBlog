import * as React from 'react';
import MModal, { ModalProps as MModalProps } from '@mui/joy/Modal';
import JoyModalClose, { ModalCloseProps } from '@mui/joy/ModalClose';
import MModalOverflow, { ModalOverflowProps as MModalOverflowProps } from '@mui/joy/ModalOverflow';
import { Close } from '../Icons';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export * from '@mui/joy/Modal';
export * from '@mui/joy/ModalOverflow';

export type ModalProps = Omit<MModalProps, 'sx'> & {
  sx?: FortressSx;
};

export type ModalOverflowProps = Omit<MModalOverflowProps, 'sx'> & {
  sx?: FortressSx;
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MModal ref={ref} {...props} sx={normalizedSx} />;
});

Modal.displayName = 'FortressModal';

export const ModalOverflow = React.forwardRef<HTMLDivElement, ModalOverflowProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MModalOverflow ref={ref} {...props} sx={normalizedSx} />;
});

ModalOverflow.displayName = 'FortressModalOverflow';

// 扩展 ModalClose 组件，使用 Fortress Close 图标
export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(({ children, slots, ...props }, ref) => (
  <JoyModalClose
    ref={ref}
    sx={{
      cursor: 'pointer',
    }}
    slots={{
      root: Close,
      ...slots,
    }}
    {...props}
  >
    {children || <Close />}
  </JoyModalClose>
));

ModalClose.displayName = 'ModalClose';

// 保持向后兼容
export const MModalClose = ModalClose;
