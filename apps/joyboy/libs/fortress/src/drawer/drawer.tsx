import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@mui/joy/Drawer';
import { useBreakpoints } from '../hooks';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import { ModalClose } from '../Modal';
import React, { useMemo } from 'react';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

// 检查children中是否包含DialogContent组件
const hasDialogContent = (children: React.ReactNode): boolean => {
  let found = false;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === DialogContent || child.type === 'DialogTitle') {
        found = true;
      }
      const childType = child.type as any;
      if (
        childType &&
        typeof childType === 'function' &&
        (childType.displayName === 'DialogContent' ||
          childType.name === 'DialogContent' ||
          childType.displayName === 'DialogTitle' ||
          childType.name === 'DialogTitle')
      ) {
        found = true;
      }
      if ((childType && childType.muiName === 'DialogContent') || childType.muiName === 'DialogTitle') {
        found = true;
      }
    }
  });

  return found;
};

export type DrawerProps = {
  /**
   * Show close button in the drawer
   * v2 版本废弃 请使用 ModalClose 组件
   * @deprecated
   * @default false  when the device is mobile, the default is true.
   */
  showCloseButton?: boolean;
  /**
   * Data selenium id for the close button ， used for automation testing
   */
  closeButtonDataSeleniumId?: string;
  /**
   * Whether to show close button on mobile (xs breakpoint).
   * Set to false to disable the auto-show close button on mobile.
   * @default true
   */
  mobileCloseButton?: boolean;
  /**
   * Title of the drawer
   * v2 版本废弃 请使用 DialogTitle 组件
   * @default `h3` old -> h2
   * @deprecated 请使用 DialogTitle 组件
   */
  title?: string | React.ReactNode;
  ActionsChildren?: React.ReactNode;
} & Omit<MuiDrawerProps, 'sx'> & {
    sx?: FortressSx;
  };

export const Drawer = ({
  showCloseButton = false,
  mobileCloseButton = true,
  title,
  children,
  ActionsChildren,
  sx,
  closeButtonDataSeleniumId,
  ...rest
}: DrawerProps) => {
  const theme = useTheme();
  const normalizedSx = useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  const { xs, sm, md, lg } = useBreakpoints();
  const showClose = showCloseButton || (xs && mobileCloseButton);

  // 检查是否已经包含DialogContent
  const hasContentOrTitle = hasDialogContent(children);
  const closeBtnProps = useMemo(() => {
    return closeButtonDataSeleniumId
      ? {
          'data-selenium': closeButtonDataSeleniumId,
        }
      : {};
  }, [closeButtonDataSeleniumId]);

  return (
    <MuiDrawer
      anchor={xs ? 'bottom' : 'right'}
      size={xs || sm || md ? 'sm' : lg ? 'md' : 'lg'}
      sx={normalizedSx}
      {...rest}
    >
      {showClose && <ModalClose {...closeBtnProps} />}
      {title && <DialogTitle level="h2">{title}</DialogTitle>}
      {hasContentOrTitle ? children : <DialogContent>{children}</DialogContent>}
      {ActionsChildren ? ActionsChildren : null}
    </MuiDrawer>
  );
};

export default Drawer;
