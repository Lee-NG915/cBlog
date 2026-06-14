import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';
import { Badge, badgeClasses } from 'fortress/Badge';
import { Account } from 'fortress/Icons';
// https://www.zhangxinxu.com/sp/svgo/

const Vector = (props: IconsProps) => (
  <Icons width="14" height="12" viewBox="0 0 14 12" {...props}>
    <path
      d="M10.2306 2.20805C10.3675 2.07707 10.5489 2.00277 10.7384 2.00008C10.9278 1.99738 11.1113 2.0665 11.2519 2.19353C11.3924 2.32056 11.4797 2.49609 11.4962 2.68485C11.5127 2.87361 11.4571 3.0616 11.3406 3.21105L11.2656 3.29304L5.49259 8.80205L2.21459 5.48205C2.08236 5.34725 2.00584 5.16753 2.00032 4.97879C1.9948 4.79004 2.06067 4.60616 2.18479 4.46386C2.30891 4.32156 2.48214 4.23131 2.66988 4.21114C2.85763 4.19097 3.04607 4.24236 3.19759 4.35505L3.28159 4.42805L5.52259 6.69805L10.2306 2.20805Z"
      fill="#A45B37"
    />
    <path
      d="M12.0785 3.88596L12.1051 3.85687L12.1293 3.82577C12.4011 3.47706 12.5308 3.03841 12.4924 2.59798C12.454 2.15755 12.2503 1.74797 11.9223 1.45156C11.5943 1.15516 11.1662 0.993893 10.7242 1.00018C10.2825 1.00646 9.85949 1.17955 9.54011 1.48469C9.53985 1.48494 9.53959 1.48519 9.53933 1.48544L5.54371 5.29604L3.99322 3.7255L3.96638 3.69831L3.93754 3.67325L3.85354 3.60025L3.82486 3.57532L3.79437 3.55264C3.44084 3.28971 3.00114 3.1698 2.56306 3.21686C2.12498 3.26393 1.72079 3.47451 1.43118 3.80654C1.14157 4.13857 0.987862 4.56763 1.00075 5.00804C1.01364 5.44844 1.19217 5.86778 1.5007 6.18231L1.5007 6.18231L1.50299 6.18464L4.78099 9.50464L5.47172 10.2042L6.18296 9.5255L11.956 4.0165L11.9805 3.99304L12.0035 3.96796L12.0785 3.88596Z"
      stroke="white"
      strokeWidth="2"
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
      badgeContent={<Vector fontSize="sm" />}
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
      <Account fontSize="xl3" />
    </Badge>
  );
}
