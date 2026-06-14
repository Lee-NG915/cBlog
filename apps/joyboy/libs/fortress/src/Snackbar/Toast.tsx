'use client';
import React from 'react';
import MSnackbar from '@mui/joy/Snackbar';
import type { SnackbarProps as MSnackbarProps } from '@mui/joy/Snackbar';
import { Box } from '@mui/joy';
import { useBreakpoints } from '../hooks/useBreakpoints';

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

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ theme = 'light', actionSlot, startDecorator, endDecorator, children, ...props }, ref) => {
    const mappedVariant = theme === 'dark' ? 'soft' : 'solid';
    const { mobile } = useBreakpoints();
    const isTopPositioned = props.anchorOrigin?.vertical === 'top';

    // Safe area inset for mobile top positioning
    const safeAreaTopStyle =
      mobile && isTopPositioned
        ? {
            // 保留iPhone顶部安全区域 + 顶部可能存在的一些 sticky 元素
            top: `calc(60px + var(--Snackbar-inset, 0px) + env(safe-area-inset-top, 0px))`,
          }
        : {};

    // 如果没有actionSlot，使用原始的MUI Snackbar布局
    if (!actionSlot) {
      return (
        <MSnackbar
          ref={ref}
          {...props}
          variant={props?.variant || mappedVariant}
          startDecorator={startDecorator}
          endDecorator={endDecorator}
          sx={{
            ...safeAreaTopStyle,
            ...props.sx,
          }}
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
      } else {
        // 不存在endDecorator
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
    }

    // 有actionSlot时，mobile布局
    return (
      <MSnackbar
        ref={ref}
        {...props}
        variant={props?.variant || mappedVariant}
        startDecorator={null}
        endDecorator={null}
        sx={{
          ...safeAreaTopStyle,
          ...props.sx,
        }}
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
