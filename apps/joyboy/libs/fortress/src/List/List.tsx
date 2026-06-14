import * as React from 'react';
import MList, { ListProps as MListProps } from '@mui/joy/List';
import MListItem, { ListItemProps as MListItemProps } from '@mui/joy/ListItem';
import MListItemButton, { ListItemButtonProps as MListItemButtonProps } from '@mui/joy/ListItemButton';
import MListItemContent, { ListItemContentProps as MListItemContentProps } from '@mui/joy/ListItemContent';
import MListDivider, { ListDividerProps as MListDividerProps } from '@mui/joy/ListDivider';
import MListSubheader, { ListSubheaderProps as MListSubheaderProps } from '@mui/joy/ListSubheader';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type ListProps = Omit<MListProps, 'sx'> & {
  sx?: FortressSx;
};

export type ListItemProps = Omit<MListItemProps, 'sx'> & {
  sx?: FortressSx;
};

export type ListItemButtonProps = Omit<MListItemButtonProps, 'sx'> & {
  sx?: FortressSx;
};

export type ListItemContentProps = Omit<MListItemContentProps, 'sx'> & {
  sx?: FortressSx;
};

export type ListDividerProps = Omit<MListDividerProps, 'sx'> & {
  sx?: FortressSx;
};

export type ListSubheaderProps = Omit<MListSubheaderProps, 'sx'> & {
  sx?: FortressSx;
};

export const List = React.forwardRef<HTMLUListElement, ListProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MList ref={ref} {...props} sx={normalizedSx} />;
});

List.displayName = 'FortressList';

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MListItem ref={ref} {...props} sx={normalizedSx} />;
});

ListItem.displayName = 'FortressListItem';

export const ListItemButton = React.forwardRef<HTMLDivElement, ListItemButtonProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MListItemButton ref={ref} {...props} sx={normalizedSx} />;
});

ListItemButton.displayName = 'FortressListItemButton';

export const ListItemContent = React.forwardRef<HTMLDivElement, ListItemContentProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MListItemContent ref={ref} {...props} sx={normalizedSx} />;
});

ListItemContent.displayName = 'FortressListItemContent';

export const ListDivider = React.forwardRef<HTMLLIElement, ListDividerProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MListDivider ref={ref} {...props} sx={normalizedSx} />;
});

ListDivider.displayName = 'FortressListDivider';

export const ListSubheader = React.forwardRef<HTMLDivElement, ListSubheaderProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  return <MListSubheader ref={ref} {...props} sx={normalizedSx} />;
});

ListSubheader.displayName = 'FortressListSubheader';

// 重新导出 JoyUI 的所有类型和工具（如 listClasses, ListOwnerState 等）
// 注意：自定义的 Props 类型会在后面覆盖 JoyUI 的同名类型
export * from '@mui/joy/List';
export * from '@mui/joy/ListItem';
export * from '@mui/joy/ListItemButton';
export * from '@mui/joy/ListItemContent';
export * from '@mui/joy/ListDivider';
export * from '@mui/joy/ListSubheader';
