import * as React from 'react';
import Menu, { menuClasses, MenuProps } from '@mui/joy/Menu';
import MenuItem, { menuItemClasses } from '@mui/joy/MenuItem';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Sheet from '@mui/joy/Sheet';
import { Account, AccountLogin } from 'fortress/Icons';
import { useTheme } from '@mui/joy';
// import Apps from '@mui/icons-material/Apps';
// import Settings from '@mui/icons-material/Settings';
// import Person from '@mui/icons-material/Person';

// The Menu is built on top of Popper v2, so it accepts `modifiers` prop that will be passed to the Popper.
// https://popper.js.org/docs/v2/modifiers/offset/
interface MenuButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  menu: React.ReactElement;
  open: boolean;
  onOpen: (event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
  onLeaveMenu: (callback: () => boolean) => void;
  label: string;
}

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: ({ placement }: any) => {
        if (placement.includes('end')) {
          return [8, 20];
        }
        return [-8, 20];
      },
    },
  },
];

function MenuButton({ children, menu, open, onOpen, onLeaveMenu, label, ...props }: MenuButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  console.log('==============>buttonRef');
  console.log(buttonRef);

  const isOnButton = React.useRef(false);
  const menuActions = React.useRef<any>(null);
  const internalOpen = React.useRef(open);
  const theme = useTheme();

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
    <>
      <IconButton
        {...props}
        ref={buttonRef}
        variant="plain"
        color="neutral"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        aria-controls={open ? `nav-menu-${label}` : undefined}
        onMouseDown={() => {
          internalOpen.current = open;
        }}
        onClick={() => {
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
        })}
      >
        {children}
      </IconButton>
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
        modifiers,
        slotProps: {
          listbox: {
            id: `nav-example-menu-${label}`,
            'aria-label': label,
          },
        },
        variant: menu.props?.variant || 'outlined',
        placement: menu.props?.placement || 'auto',
        sx: {
          '--ListDivider-gap': 0,
          // '--ListItem-paddingX': '1.25rem',

          borderColor: theme.palette.brand.charcoal[300],
          borderRadius: '2px 2px 0px 0px',

          boxShadow: 'none',

          [`& .${menuItemClasses.root}`]: {
            ':hover': {
              bgcolor: theme.palette.primary[500],
              color: theme.palette.common.white,
            },
          },
        },
      } as MenuProps)}
    </>
  );
}

export default () => {
  const [menuIndex, setMenuIndex] = React.useState<null | number>(null);

  const itemProps = {
    onClick: () => setMenuIndex(null),
  };
  const createHandleLeaveMenu = (index: number) => (getIsOnButton: () => boolean) => {
    setTimeout(() => {
      const isOnButton = getIsOnButton();
      if (!isOnButton) {
        setMenuIndex((latestIndex: null | number) => {
          if (index === latestIndex) {
            return null;
          }
          return latestIndex;
        });
      }
    }, 200);
  };

  return (
    <>
      <MenuButton
        label="Apps"
        open={menuIndex === 0}
        onOpen={() => setMenuIndex(0)}
        onLeaveMenu={createHandleLeaveMenu(0)}
        menu={
          <Menu
            onClose={() => {
              console.log("==============>'外部 onClose'");
              console.log('外部 onClose');

              setMenuIndex(null);
            }}
            placement="bottom-end"
            onMouseLeave={() => {
              console.log('==============>222');
              console.log(222);
            }}
          >
            <MenuItem {...itemProps}>Application 1</MenuItem>
            <MenuItem {...itemProps}>Application 2</MenuItem>
            <MenuItem {...itemProps}>Application 3</MenuItem>
          </Menu>
        }
      >
        <AccountLogin />
      </MenuButton>
    </>
  );
};
