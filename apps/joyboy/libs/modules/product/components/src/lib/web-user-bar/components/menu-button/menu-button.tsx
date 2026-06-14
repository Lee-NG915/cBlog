import React from 'react';
import {
  useTheme,
  Sheet,
  IconButton,
  Link,
  menuItemClasses,
  linkClasses,
  MenuProps,
  useBreakpoints,
} from '@castlery/fortress';
// import { MenuProps } from '@mui/joy/';
import { EcEnv } from '@castlery/config';

interface MenuButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  menu: React.ReactElement;
  open: boolean;
  onOpen: (event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  onLeaveMenu: (callback: () => boolean) => void;
  label: string;
}

export function MenuButton({ children, menu, open, onOpen, onLeaveMenu, label, ...props }: MenuButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isOnButton = React.useRef(false);
  const menuActions = React.useRef<any>(null);
  const internalOpen = React.useRef(open);
  const theme = useTheme();

  const { mobile } = useBreakpoints();

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    internalOpen.current = open;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      onOpen(event);
      if (event.key === 'ArrowUp') {
        menuActions.current?.highlightLastItem();
      }
    }
  };

  return (
    <Sheet
      sx={(theme) => ({
        paddingTop: mobile ? 0 : '4px',
        backgroundColor: theme.palette.brand.warmLinen[500],
      })}
    >
      <IconButton
        ref={buttonRef}
        {...props}
        size="md"
        variant="plain"
        // variant="primary"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        aria-controls={open ? `user-menu-${label}` : undefined}
        onMouseDown={() => {
          internalOpen.current = open;
        }}
        onClick={() => {
          window.location.href = `${
            EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
          }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/account/profile`;
          if (!internalOpen.current) {
            onOpen();
          }
        }}
        onMouseEnter={() => {
          onOpen();
          isOnButton.current = true;
        }}
        onMouseLeave={() => {
          isOnButton.current = false;
        }}
        onKeyDown={handleButtonKeyDown}
        sx={(theme) => ({
          bgcolor: open ? theme.palette.neutral.plainHoverBg : undefined,
          '&.Joy-focusVisible': {
            bgcolor: theme.palette.neutral.plainHoverBg,
          },
          minWidth: `${theme.spacing(6)} !important`,
          minHeight: `${theme.spacing(6)} !important`,
          padding: '0 !important',
          maxWidth: `${theme.spacing(6)} !important`,
          maxHeight: `${theme.spacing(6)} !important`,
          marginRight: mobile ? theme.spacing(3) : 0,
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
        component={Link}
        path={'/account/profile'}
        menu-type="user_menu"
        text="Account"
        data-selenium="header-account"
        aria-label="account"
      >
        {children}
      </IconButton>

      {/* TODO  https://react.dev/reference/react/cloneElement#alternatives */}
      {React.cloneElement(menu, {
        open,
        onClose: () => {
          menu.props.onClose?.();
          buttonRef.current?.focus();
        },
        onMouseLeave: () => {
          onLeaveMenu(() => isOnButton.current);
        },
        actions: menuActions,
        anchorEl: buttonRef.current,
        // modifiers,
        slotProps: {
          listbox: {
            id: `nav-example-menu-${label}`,
            'aria-label': label,
          },
        },
        variant: 'outlined',
        placement: 'bottom',
        sx: {
          '--ListDivider-gap': 0,
          '--ListItem-paddingX': '1rem',
          '--ListItem-paddingY': '0.5rem',

          borderColor: theme.palette.brand.wheat[300],
          borderRadius: '2px 2px 0px 0px',

          boxShadow: 'none',

          [`& .${menuItemClasses.root}`]: {
            color: theme.palette.common.black,
            ':not(.Mui-selected, [aria-selected="true"]):hover': {
              bgcolor: theme.palette.primary[500],
              color: theme.palette.common.white,
            },
          },
          [`& .${linkClasses.root}`]: {
            color: theme.palette.common.black,
          },
        },
      } as MenuProps)}
    </Sheet>
  );
}
