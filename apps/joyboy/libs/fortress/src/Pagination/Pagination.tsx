/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Box, Stack, Button, IconButton } from '..';
// import { SxProps, Theme } from '@mui/material/styles';
// import { LeftArrow, RightArrow } from '../Icons';
// import * as React from 'react';
// /* eslint-disable-next-line */
// export interface PaginationProps {
//   sx?: SxProps<Theme>;
//   count: number;
//   page: number;
//   onChange: (pageNumber: number) => void;
// }

// export function Pagination(props: PaginationProps) {
//   const { sx, count = 0, page = 1, onChange } = props;
//   const [currentPage, setCurrentPage] = React.useState<number>(page);
//   let defaultSx = {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   };
//   if (sx) {
//     defaultSx = Object.assign(defaultSx, sx);
//   }
//   const handlePageChange = React.useCallback(
//     (pageNumber: number) => {
//       if (pageNumber !== currentPage) {
//         onChange(pageNumber);
//         setCurrentPage(pageNumber);
//       }
//     },
//     [currentPage, onChange]
//   );
//   const renderPageNumbers = React.useCallback(() => {
//     const pageRangeDisplayed = 5;
//     const halfPageRangeDisplayed = Math.floor(pageRangeDisplayed / 2);
//     let startPage = Math.max(1, currentPage - halfPageRangeDisplayed);
//     let endPage = Math.min(count, currentPage + halfPageRangeDisplayed);
//     if (count <= pageRangeDisplayed) {
//       startPage = 1;
//       endPage = count;
//     } else {
//       if (currentPage <= halfPageRangeDisplayed) {
//         endPage = pageRangeDisplayed;
//       } else if (currentPage >= count - halfPageRangeDisplayed) {
//         startPage = count - pageRangeDisplayed + 1;
//       }
//     }
//     const pageNumbers = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(
//         <IconButton
//           key={i}
//           size="sm"
//           variant="outlined"
//           sx={(theme): any => ({
//             bgcolor: currentPage === i ? theme.palette.brand.terracotta[500] : theme.palette.brand.charcoal[0],
//             color: currentPage === i ? theme.palette.brand.charcoal[0] : theme.palette.brand.terracotta[500],
//             border: `1px solid ${theme.palette.brand.terracotta[500]}`,
//           })}
//           onClick={() => handlePageChange(i)}
//         >
//           {i}
//         </IconButton>
//       );
//     }
//     if (startPage > 1) {
//       if (startPage > 2) {
//         pageNumbers.unshift(<div key="ellipsisStartGap">...</div>);
//       }
//       pageNumbers.unshift(
//         <IconButton
//           key="ellipsisStart"
//           size="sm"
//           variant="outlined"
//           sx={(theme): any => ({
//             bgcolor: currentPage === 1 ? theme.palette.brand.terracotta[500] : theme.palette.brand.charcoal[0],
//             color: currentPage === 1 ? theme.palette.brand.charcoal[0] : theme.palette.brand.terracotta[500],
//             border: `1px solid ${theme.palette.brand.terracotta[500]}`,
//           })}
//           onClick={() => handlePageChange(1)}
//         >
//           {1}
//         </IconButton>
//       );
//     }

//     if (endPage < count) {
//       if (endPage < count - 1) {
//         pageNumbers.push(<div key="ellipsisEndGap">...</div>);
//       }
//       pageNumbers.push(
//         <IconButton
//           key="ellipsisEnd"
//           size="sm"
//           variant="outlined"
//           sx={(theme): any => ({
//             bgcolor: currentPage === count ? theme.palette.brand.terracotta[500] : theme.palette.brand.charcoal[0],
//             color: currentPage === count ? theme.palette.brand.charcoal[0] : theme.palette.brand.terracotta[500],
//             border: `1px solid ${theme.palette.brand.terracotta[500]}`,
//           })}
//           onClick={() => handlePageChange(count)}
//         >
//           {count}
//         </IconButton>
//       );
//     }
//     return pageNumbers;
//   }, [currentPage, count, handlePageChange]);
//   return (
//     <Box className="PosPagination" sx={defaultSx}>
//       <Button
//         size="sm"
//         variant="tertiary"
//         startDecorator={''}
//         disabled={currentPage === 1}
//         onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
//       >
//         <LeftArrow />
//       </Button>
//       <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
//         {renderPageNumbers()}
//       </Stack>
//       <Button
//         size="sm"
//         variant="tertiary"
//         color="neutral"
//         endDecorator={''}
//         disabled={currentPage === count}
//         onClick={() => handlePageChange(currentPage < count ? currentPage + 1 : count)}
//       >
//         <RightArrow />
//       </Button>
//     </Box>
//   );
// }

// export default Pagination;

'use client';
import * as React from 'react';
import { unstable_composeClasses as composeClasses, unstable_capitalize as capitalize } from '@mui/utils';
import { styled, useThemeProps } from '@mui/joy/styles';
import type { ColorPaletteProp } from '@mui/joy';
import { getPaginationUtilityClass } from './PaginationClasses';
import PaginationItem, { PaginationItemProps } from './components/PaginationItem';
import useSlot from '../../utils/useSlot';
import { OverridableStringUnion } from '@mui/types';
import {
  PaginationPropsShapeOverrides,
  PaginationPropsSizeOverrides,
  PaginationPropsVariantOverrides,
} from './PaginationProps';
import { SxProps } from '@mui/joy/styles/types';
import usePagination from '@mui/material/usePagination';

export type SizeProp = OverridableStringUnion<'sm' | 'md' | 'lg', PaginationPropsSizeOverrides>;

export type VariantProp = OverridableStringUnion<'text' | 'outlined', PaginationPropsVariantOverrides>;

export type ShapeProp = OverridableStringUnion<'circular' | 'rounded', PaginationPropsShapeOverrides>;

interface PaginationOwnerState extends PaginationProps {
  variant: VariantProp;
  color: ColorPaletteProp;
  size: SizeProp;
}

const useUtilityClasses = (ownerState: PaginationOwnerState) => {
  const { variant, color, size, shape } = ownerState;
  const slots = {
    root: [
      'root',
      variant && `variant${capitalize(variant)}`,
      color && `color${capitalize(color)}`,
      size && `size${capitalize(size)}`,
      shape && `shape${capitalize(shape)}`,
    ],
    ul: ['ul'],
  };
  return composeClasses(slots, getPaginationUtilityClass, {});
};

const PaginationRoot = styled('nav', {
  name: 'JoyPagination',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme, ownerState }: { theme: any; ownerState: PaginationOwnerState }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const PaginationUl = styled('ul', {
  name: 'JoyPagination',
  slot: 'Ul',
  overridesResolver: (props, styles) => styles.ul,
})(({ theme, ownerState }: { theme: any; ownerState: PaginationOwnerState }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  listStyle: 'none',
}));

export interface PaginationProps {
  boundaryCount?: number;
  siblingCount?: number;
  hidePrevButton?: boolean;
  hideNextButton?: boolean;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  count?: number;
  page?: number;
  defaultPage?: number;
  onChange?: (event: React.ChangeEvent<unknown> | null, page: number) => void;
  shape?: ShapeProp;
  size?: SizeProp;
  variant?: VariantProp;
  color?: ColorPaletteProp;
  renderItem?: (item: PaginationItemProps) => React.ReactNode;
  sx?: SxProps;
  slots?: {
    root?: React.ElementType;
    ul?: React.ElementType;
  };
  slotProps?: {
    root?: any;
    ul?: any;
  };
  [key: string]: any;
}

function defaultGetAriaLabel(type: string, page: number, selected: boolean) {
  if (type === 'page') {
    return `${selected ? '' : 'Go to '}page ${page}`;
  }
  return `Go to ${type} page`;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(function JoyPagination(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'JoyPagination' });
  const {
    // boundaryCount = 1,
    // siblingCount = 1,
    // hidePrevButton = false,
    // hideNextButton = false,
    // showFirstButton = false,
    // showLastButton = false,
    // count = 1,
    // defaultPage = 1,
    getItemAriaLabel = defaultGetAriaLabel,
    page,
    onChange,
    shape: shapeProp = 'circular',
    size: sizeProp = 'md',
    variant: variantProp = 'text',
    color: colorProp = 'neutral',
    renderItem,
    slots = {},
    slotProps = {},
    // Extract pagination-specific props to prevent them from being passed to DOM
    boundaryCount,
    siblingCount,
    hidePrevButton,
    hideNextButton,
    showFirstButton,
    showLastButton,
    count,
    defaultPage,
    ...other
  } = props;

  const { items } = usePagination({
    ...props,
    componentName: 'JoyPagination',
  });

  const variant = inProps.variant || variantProp;
  const size = inProps.size || sizeProp;
  const color = inProps.color || colorProp;
  const shape = inProps.shape || shapeProp;

  const ownerState: PaginationOwnerState = {
    ...props,
    variant,
    color,
    size,
    shape,
  };

  const classes = useUtilityClasses(ownerState);

  const [RootSlot, rootProps] = useSlot('root', {
    ref,
    className: classes.root,
    elementType: PaginationRoot,
    ownerState,
    externalForwardedProps: { ...other, slots, slotProps },
  });

  const [UlSlot, ulProps] = useSlot('ul', {
    className: classes.ul,
    elementType: PaginationUl,
    ownerState,
    externalForwardedProps: { slots, slotProps },
  });

  return (
    <RootSlot {...rootProps} aria-label="pagination navigation">
      <UlSlot {...ulProps}>
        {items.map((item, idx) => {
          const finalItemProps: PaginationItemProps = {
            ...item,
            shape,
            size,
            variant,
            color,
            'aria-label': getItemAriaLabel(item.type, item.page, item.selected),
          };
          if (renderItem) {
            return <li key={idx}>{renderItem(finalItemProps)}</li>;
          }
          return (
            <li key={idx}>
              <PaginationItem {...finalItemProps} />
            </li>
          );
        })}
      </UlSlot>
    </RootSlot>
  );
});

export default Pagination;
