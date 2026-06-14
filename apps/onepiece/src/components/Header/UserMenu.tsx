import React, { useContext } from 'react';
import { getUrl } from 'pages';
import {
  IconButton,
  Menu,
  MenuItem,
  Sheet,
  linkClasses,
  menuItemClasses,
  useTheme,
  SvgIcon as Icons,
  SvgIconProps as IconsProps,
} from '@castlery/fortress';
import { Account, AccountLogin } from '@castlery/fortress/Icons';
import { logout } from 'redux/modules/auth';
import { useSelector } from 'react-redux';
import { FrameContext } from 'containers/Frame/FrameContext';
import { MenuProps } from '@mui/joy/Menu';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import Badge, { badgeClasses } from '@mui/joy/Badge';
import { TrackableLink } from './GlobalNav';
// import { MenuButton } from './MenuButton';

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

// const modifiers = [
//   {
//     name: 'offset',
//     options: {
//       offset: ({ placement }: any) => {
//         if (placement.includes('end')) {
//           return [8, 20];
//         }
//         return [-8, 20];
//       },
//     },
//   },
// ];

export function MenuButton({ children, menu, open, onOpen, onLeaveMenu, label, ...props }: MenuButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
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
    <Sheet
      ref={buttonRef}
      sx={{
        '& svg path': {
          stroke: 'transparent',
        },
        backgroundColor: '#F6F3E7',
      }}
    >
      <IconButton
        {...props}
        size="md"
        variant="primary"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        aria-controls={open ? `user-menu-${label}` : undefined}
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
        sx={{
          bgcolor: open ? theme.palette.neutral.plainHoverBg : undefined,
          '&.Joy-focusVisible': {
            bgcolor: theme.palette.neutral.plainHoverBg,
          },
        }}
        component={TrackableLink}
        path={getUrl('profile')}
        menuType="user_menu"
        text="Account"
        data-selenium="header-account"
        aria-label="account"
        aria-haspopup="true"
        aria-expanded="false"
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
          boxSizing: 'border-box',
          '--ListDivider-gap': 0,
          '--ListItem-paddingX': '1rem',
          '--ListItem-paddingY': '0.5rem',
          borderColor: 'rgb(219, 207, 181)',
          borderRadius: '2px 2px 0px 0px',
          boxShadow: 'none',
          backgroundColor: '#fbf9f4',

          [`& .${menuItemClasses.root}`]: {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0,
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '0.875rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '0.875rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1rem',
            },
            color: '#000000',
            ':not(.Mui-selected, [aria-selected="true"]):hover': {
              // bgcolor: theme.palette.primary[500],
              // color: theme.palette.common.white,
              color: '#844025',
              backgroundColor: 'transparent',
            },
          },
          [`& .${linkClasses.root}`]: {
            color: '#3c101e',
            justifyContent: 'flex-start',
          },
        },
      } as MenuProps)}
    </Sheet>
  );
}

// TODO 以后跳转链接要进行收拢  如果内部的就使用 to  非内部的就使用 href
// TODO getUrl 放着里 有可能拿不到 具体原因后续调查 可能是 这里只能在server side 那里才能拿到
// const accountDropdown: Array<{ path: string; name: string }> = [
//   {
//     path: getUrl('profile'),
//     name: 'Account',
//   },
//   {
//     path: getUrl('orders'),
//     name: 'Orders',
//   },
//   {
//     path: getUrl('vouchers'),
//     name: 'Vouchers',
//   },
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   __YOTPO_ENABLED__ && {
//     path: getUrl('account-rewards'),
//     name: 'Rewards',
//   },
//   {
//     path: getUrl('address'),
//     name: 'Address Book',
//   },
//   {
//     path: getUrl('my-reviews'),
//     name: 'Reviews',
//   },
// ];
const Vector = (props: IconsProps) => (
  <Icons viewBox="0 0 16 16" {...props}>
    <rect x="4.66669" y="5.33334" width="6.66667" height="5.33333" fill="#f6f3e7" />
    <path
      d="M7.03333 10.6L11.3 6.33333L10.8333 5.86667L7.03333 9.66667L5.13333 7.76667L4.66667 8.23333L7.03333 10.6ZM8 14C7.16667 14 6.38622 13.8418 5.65867 13.5253C4.93067 13.2084 4.29733 12.7804 3.75867 12.2413C3.21956 11.7027 2.79156 11.0693 2.47467 10.3413C2.15822 9.61378 2 8.83333 2 8C2 7.16667 2.15822 6.386 2.47467 5.658C2.79156 4.93044 3.21956 4.29711 3.75867 3.758C4.29733 3.21933 4.93067 2.79156 5.65867 2.47467C6.38622 2.15822 7.16667 2 8 2C8.83333 2 9.614 2.15822 10.342 2.47467C11.0696 2.79156 11.7029 3.21933 12.242 3.758C12.7807 4.29711 13.2084 4.93044 13.5253 5.658C13.8418 6.386 14 7.16667 14 8C14 8.83333 13.8418 9.61378 13.5253 10.3413C13.2084 11.0693 12.7807 11.7027 12.242 12.2413C11.7029 12.7804 11.0696 13.2084 10.342 13.5253C9.614 13.8418 8.83333 14 8 14Z"
      fill={props?.fill || '#844025'}
    />
  </Icons>
);

export const UserMenu = () => {
  const user = useSelector((state) => state.auth.user);
  const frame = useContext(FrameContext);
  const { desktop } = useBreakpoints();
  const [menuIndex, setMenuIndex] = React.useState<null | number>(null);

  if (!user)
    return (
      <IconButton
        size="md"
        onClick={(e) => {
          e.preventDefault();
          // frame?.openModal('login');
          window.location.href = `${__BASE_URL__}/login?redirectUrl=${encodeURIComponent(window.location.href)}`;
        }}
        component={TrackableLink}
        menuType="user_menu"
        text="Account"
        data-selenium="header-account"
        aria-label="account"
        aria-haspopup="dialog"
        aria-expanded="false"
      >
        <Account />
      </IconButton>
    );

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
    <MenuButton
      label="User"
      open={menuIndex === 0}
      onOpen={() => desktop && setMenuIndex(0)}
      onLeaveMenu={createHandleLeaveMenu(0)}
      menu={
        <Menu
          sx={{
            '& .MuiMenuItem-root:hover': {
              color: '#844025',
            },
            backgroundColor: 'red',
          }}
          onClose={() => {
            setMenuIndex(null);
          }}
          placement="bottom-end"
        >
          {[
            {
              path: getUrl('profile'),
              name: 'Account',
            },
            {
              path: getUrl('orders'),
              name: 'Orders',
            },
            {
              path: getUrl('vouchers'),
              name: 'Vouchers',
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            __YOTPO_ENABLED__ && {
              path: getUrl('account-rewards'),
              name: 'Rewards',
            },
            {
              path: getUrl('address'),
              name: 'Address Book',
            },
            {
              path: getUrl('my-reviews'),
              name: 'Reviews',
            },
          ].map((item, i) => (
            <MenuItem
              {...itemProps}
              key={i}
              sx={{
                justifyContent: 'flex-start',
                ':hover': {
                  [`& .${linkClasses.root}`]: {
                    color: '#844025',
                  },
                },
              }}
            >
              {/* TODO 回车后 不会触发跳转 */}
              <TrackableLink
                path={item?.path}
                menuType="user_menu"
                sx={{
                  color: '#3c101e',
                }}
                style={{ all: 'unset' }}
              >
                {item?.name}
              </TrackableLink>
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              logout();
            }}
            sx={{
              justifyContent: 'flex-start',
            }}
          >
            Log Out
          </MenuItem>
        </Menu>
      }
    >
      {/* <AccountLogin /> */}
      <Badge
        badgeInset="14%"
        variant="plain"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        badgeContent={<Vector sx={{ width: '18px !important', height: '18px !important' }} />}
        sx={(theme) => ({
          padding: '0',
          [`& .${badgeClasses.badge}`]: {
            bgcolor: 'transparent',
            borderColor: 'transparent',
            padding: '0',
            minHeight: '',
            minWidth: '',
            boxShadow: 'none',
          },
        })}
      >
        <Account
          sx={(theme) => ({
            width: theme.spacing(3),
            height: theme.spacing(3),
            // fill: theme.palette.brand.mono[900],
            fill: 'var(--fortress-palette-brand-mono-900)',
          })}
        />
      </Badge>
    </MenuButton>
  );
};
