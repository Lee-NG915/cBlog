import React from 'react';
import MSnackbar from '@mui/joy/Snackbar';
import type { SnackbarProps as MSnackbarProps } from '@mui/joy/Snackbar';
import { Box } from '@mui/joy';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

export interface ToastProps extends Omit<MSnackbarProps, 'type' | 'children'> {
  /**
   * 主题类型
   * @default 'light'
   * @description 可选值：'light' | 'dark'
   */
  theme?: 'light' | 'dark';

  /**
   * 操作按钮插槽
   * @description 显示在内容下方的操作按钮
   */
  actionSlot?: React.ReactNode;

  /**
   * 内容
   */
  children?: React.ReactNode;
}

const ToastSx: any = {
  position: 'fixed',
  padding: '16px',
  gap: '8px',
  border: 'none',
  boxShadow: 'none',
  alignItems: 'flex-start',
  borderRadius: '0',
  flexWrap: 'nowrap',
  color: '#F6F3E7',
  // Solid变体token light
  '--variant-solidColor': '#3C101E',
  '--variant-solidBg': '#F6F3E7',
  // Soft变体token. dark
  '--variant-softColor': '#F6F3E7',
  '--variant-softBg': '#212121',

  '&.toast-desktop': {
    alignItems: 'center',
  },

  // Toast组件的两行布局样式
  '& .toast-content-desktop': {
    display: 'flex',
    gap: '8px',
    width: '100%',
    alignItems: 'center',
  },
  '& .toast-content-mobile': {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },

  '& .toast-top-row': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
  },

  // Toast内容区域样式
  '& .toast-content-wrapper': {
    flex: 1,
  },

  // endDecorator 靠右对齐样式
  '& .toast-end-decorator': {
    marginLeft: 'auto',
  },

  '& .toast-action-row': {
    marginLeft: 'auto',
  },
};
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ theme = 'light', actionSlot, startDecorator, endDecorator, children, ...props }, ref) => {
    const mappedVariant = theme === 'dark' ? 'soft' : 'solid';
    const { mobile } = useBreakpoints();

    // 如果没有actionSlot，使用原始的MUI Snackbar布局
    if (!actionSlot) {
      return (
        <MSnackbar
          ref={ref}
          {...props}
          sx={ToastSx}
          variant={props?.variant || mappedVariant}
          startDecorator={startDecorator}
          endDecorator={endDecorator}
        >
          {children}
        </MSnackbar>
      );
    }

    // desktop布局
    if (!mobile) {
      if (endDecorator) {
        // 存在endDecorator
        return (
          <MSnackbar
            ref={ref}
            {...props}
            className="toast-desktop"
            sx={ToastSx}
            variant={props?.variant || mappedVariant}
            startDecorator={startDecorator}
            endDecorator={endDecorator}
          >
            <Box className="toast-content-desktop">
              {children}
              {actionSlot}
            </Box>
          </MSnackbar>
        );
      }
      return (
        <MSnackbar
          ref={ref}
          {...props}
          className="toast-desktop"
          variant={props?.variant || mappedVariant}
          startDecorator={startDecorator}
          endDecorator={actionSlot}
        >
          {children}
        </MSnackbar>
      );
    }

    // 有actionSlot时，mobile布局
    return (
      <MSnackbar
        ref={ref}
        {...props}
        sx={ToastSx}
        variant={props?.variant || mappedVariant}
        startDecorator={null}
        endDecorator={null}
      >
        <Box className="toast-content-mobile">
          <Box className="toast-top-row">
            {startDecorator}
            <Box className="toast-content-wrapper">{children}</Box>
            {endDecorator && <Box className="toast-end-decorator">{endDecorator}</Box>}
          </Box>

          {/* 第二行：操作按钮 */}
          <Box className="toast-action-row">{actionSlot}</Box>
        </Box>
      </MSnackbar>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
