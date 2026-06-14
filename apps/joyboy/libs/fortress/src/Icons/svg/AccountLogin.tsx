import Icons, { IconsProps } from '../Icons';
import Badge, { badgeClasses } from '@mui/joy/Badge';

import Account from './Account';
// https://www.zhangxinxu.com/sp/svgo/

const Vector = (props: IconsProps) => (
  <Icons viewBox="0 0 16 16" {...props}>
    <rect x="4.66669" y="5.33334" width="6.66667" height="5.33333" fill="white" />
    <path
      d="M7.03333 10.6L11.3 6.33333L10.8333 5.86667L7.03333 9.66667L5.13333 7.76667L4.66667 8.23333L7.03333 10.6ZM8 14C7.16667 14 6.38622 13.8418 5.65867 13.5253C4.93067 13.2084 4.29733 12.7804 3.75867 12.2413C3.21956 11.7027 2.79156 11.0693 2.47467 10.3413C2.15822 9.61378 2 8.83333 2 8C2 7.16667 2.15822 6.386 2.47467 5.658C2.79156 4.93044 3.21956 4.29711 3.75867 3.758C4.29733 3.21933 4.93067 2.79156 5.65867 2.47467C6.38622 2.15822 7.16667 2 8 2C8.83333 2 9.614 2.15822 10.342 2.47467C11.0696 2.79156 11.7029 3.21933 12.242 3.758C12.7807 4.29711 13.2084 4.93044 13.5253 5.658C13.8418 6.386 14 7.16667 14 8C14 8.83333 13.8418 9.61378 13.5253 10.3413C13.2084 11.0693 12.7807 11.7027 12.242 12.2413C11.7029 12.7804 11.0696 13.2084 10.342 13.5253C9.614 13.8418 8.83333 14 8 14Z"
      fill={props?.fill || '#844025'}
    />
  </Icons>
);
export default function (props: IconsProps) {
  return (
    <Badge
      badgeInset="14%"
      variant="plain"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={<Vector sx={{ width: '16px !important', height: '16px !important' }} />}
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
          width: theme.spacing(6),
          height: theme.spacing(6),
          // fill: theme.palette.brand.mono[900],
          fill: 'var(--fortress-palette-brand-mono-900)',
        })}
      />
    </Badge>
  );
}
