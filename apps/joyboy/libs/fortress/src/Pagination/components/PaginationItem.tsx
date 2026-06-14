/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import * as React from 'react';
import { styled, useThemeProps } from '@mui/joy/styles';
import { IconButton } from '@mui/joy';
import { unstable_composeClasses as composeClasses, unstable_capitalize as capitalize } from '@mui/utils';
import { getPaginationItemUtilityClass } from './PaginationItemClasses';
import type { ColorPaletteProp } from '@mui/joy';
import useSlot from '../../../utils/useSlot';
import LeftArrowIcon from '../../Icons/svg/LeftArrow';
import RightArrowIcon from '../../Icons/svg/RightArrow';
import { SizeProp, VariantProp } from '../Pagination';
import { useRtl } from '@mui/system/RtlProvider';
import { UsePaginationItem } from '@mui/material/usePagination';
/**
 * interface
 */
export interface PaginationItemProps extends UsePaginationItem {
  /**
   * Only 'text' | 'outlined'
   * @default 'text'
   */
  variant?: VariantProp;
  /**
   * Joy UI color
   * @default 'neutral'
   */
  color?: ColorPaletteProp;
  /**
   * Joy UI size
   * @default 'md'
   */
  size?: SizeProp;
  /**
   * shape of the item
   * @default 'circular'
   */
  shape?: 'circular' | 'rounded';
  /**
   * 如果外部想换成 <Button>，可指定 component
   */
  component?: React.ElementType;
  /**
   *
   */
  components?: {
    first: React.ElementType;
    last: React.ElementType;
    next: React.ElementType;
    previous: React.ElementType;
  };
  /**
   * 自定义图标（previous/next/first/last 等），可用 slots
   */
  slots?: {
    root?: React.ElementType;
    previous?: React.ElementType;
    next?: React.ElementType;
    first?: React.ElementType;
    last?: React.ElementType;
    ellipsis?: React.ElementType;
  };
  /**
   * 给各个 slot 传额外的属性
   */
  slotProps?: {
    root?: any;
    previous?: any;
    next?: any;
    first?: any;
    last?: any;
    ellipsis?: any;
  };
  /**
   * 其余 DOM props
   */
  [key: string]: any;
}

const useUtilityClasses = (ownerState: PaginationItemProps) => {
  const { variant, color, size, shape, selected, disabled, type } = ownerState;
  const slots = {
    root: [
      'root',
      variant && `variant${capitalize(variant)}`,
      color && `color${capitalize(color)}`,
      size && `size${capitalize(size)}`,
      shape && `shape${capitalize(shape)}`,
      disabled && 'disabled',
      selected && 'selected',
      {
        page: 'page',
        first: 'firstLast',
        last: 'firstLast',
        'start-ellipsis': 'ellipsis',
        'end-ellipsis': 'ellipsis',
        previous: 'previousNext',
        next: 'previousNext',
      }[type],
    ],
    icon: ['icon'],
  };
  return composeClasses(slots, getPaginationItemUtilityClass, {});
};

const PaginationItemRoot = styled(IconButton, {
  name: 'JoyPaginationItem',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme, ownerState }: { theme: any; ownerState: PaginationItemProps }) => ({
  ...(ownerState.shape === 'circular' && {
    borderRadius: '50%',
  }),
  ...(ownerState.shape === 'rounded' && {
    aspectRatio: '1 / 1',
  }),
}));

const PaginationItemEllipsis = styled('span', {
  name: 'JoyPaginationItem',
  slot: 'Ellipsis',
  overridesResolver: (props, styles) => [styles.root, styles.ellipsis],
})(({ theme, ownerState }: { theme: any; ownerState: PaginationItemProps }) => ({
  ...(ownerState.shape === 'circular' && {
    borderRadius: '50%',
  }),
  ...(ownerState.shape === 'rounded' && {
    aspectRatio: '1 / 1',
  }),
}));

const PaginationItemIcon = styled(IconButton, {
  name: 'JoyPaginationItem',
  slot: 'Icon',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme, ownerState }: { theme: any; ownerState: PaginationItemProps }) => ({}));

/** 主组件 */
const PaginationItem = React.forwardRef<HTMLButtonElement, PaginationItemProps>(function JoyPaginationItem(
  inProps,
  ref
) {
  const props = useThemeProps({ props: inProps, name: 'JoyPaginationItem' });
  const {
    type,
    page,
    selected = false,
    disabled = false,
    variant = 'text',
    color = 'neutral',
    size = 'md',
    shape = 'circular',
    component,
    components,
    slots = {},
    slotProps = {},
    ...other
  } = props;

  const ownerState: PaginationItemProps = {
    ...props,
    type,
    selected,
    disabled,
    variant,
    color,
    size,
    shape,
  };

  const isRtl = useRtl();
  const classes = useUtilityClasses(ownerState);

  const externalForwardedProps = {
    slots: {
      previous: slots.previous ?? components?.previous,
      next: slots.next ?? components?.next,
      first: slots.first ?? components?.first,
      last: slots.last ?? components?.last,
    },
    slotProps,
  };

  const [RootSlot, rootSlotProps] = useSlot('root', {
    ref,
    className: classes.root,
    elementType: PaginationItemRoot,
    ownerState,
    externalForwardedProps: {
      ...other,
      component,
      slots,
      slotProps,
      disabled,
    },
  });
  const [EllipsisSlot, ellipsisProps] = useSlot('ellipsis', {
    className: classes.root,
    elementType: PaginationItemEllipsis,
    ownerState,
    externalForwardedProps: { slots, slotProps },
  });

  const [PreviousSlot, previousSlotProps] = useSlot('previous', {
    className: classes.root,
    elementType: LeftArrowIcon,
    ownerState,
    externalForwardedProps,
  });
  const [NextSlot, nextSlotProps] = useSlot('next', {
    className: classes.root,
    elementType: RightArrowIcon,
    ownerState,
    externalForwardedProps,
  });

  const [FirstSlot, firstSlotProps] = useSlot('first', {
    className: classes.root,
    elementType: LeftArrowIcon,
    externalForwardedProps,
    ownerState,
  });

  const [LastSlot, lastSlotProps] = useSlot('last', {
    className: classes.root,
    elementType: RightArrowIcon,
    externalForwardedProps,
    ownerState,
  });

  if (type === 'start-ellipsis' || type === 'end-ellipsis') {
    return <EllipsisSlot {...ellipsisProps}>…</EllipsisSlot>;
  }

  const rtlAwareType = isRtl
    ? {
        previous: 'next',
        next: 'previous',
        first: 'last',
        last: 'first',
        page: 'page',
      }[type]
    : type;

  const IconSlot = {
    previous: PreviousSlot,
    next: NextSlot,
    first: FirstSlot,
    last: LastSlot,
  }[rtlAwareType];

  const iconSlotProps = {
    previous: previousSlotProps,
    next: nextSlotProps,
    first: firstSlotProps,
    last: lastSlotProps,
  }[rtlAwareType];

  return (
    <RootSlot {...rootSlotProps}>
      {type === 'page' && page}
      {IconSlot ? <PaginationItemIcon {...iconSlotProps} className={classes.icon} as={IconSlot} /> : null}
    </RootSlot>
  );
});

export default PaginationItem;
