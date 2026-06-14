import * as React from 'react';
// TODO 后续这里要替换成 joyui 原生的
// https://www.radix-ui.com/docs/primitives/components/accordion
import * as RAccordion from '@radix-ui/react-accordion';
import { keyframes } from '@mui/system';
import Box, { BoxProps } from '@mui/joy/Box';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet, { sheetClasses } from '@mui/joy/Sheet';
import { List, ListProps } from 'fortress/List';
import { ListDivider, typographyClasses } from '@mui/joy';
import { SxProps } from 'fortress';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

let AccordionHeaderPalette = {
  color: 'var(--fortress-palette-brand-wheat-500)',
  bg: '',
  border: '',

  hoverColor: 'var(--fortress-palette-brand-terracotta-500)',
  hoverBg: '',
  hoverBorder: '',

  activeColor: 'var(--fortress-palette-brand-terracotta-500)',
  activeBg: '',
  activeBorder: '',
};

// TODO 需要暴露一个 classes.root 这种东西出去 方面业务定制业务
export const accordionHeaderClasses = {
  root: '',
  header: 'fortress-AccordionHeader-header',
  icon: 'fortress-AccordionHeader-icon',
};
// TODO 后续要封装成有颜色类型的
export const AccordionHeader = ({
  children,
  isFirst,
  isLast,
  sx,
  iconColor,
  iconHover,
  ...props
}: ListItemButtonProps & {
  /**
   * If `true`, the top border-radius is applied
   */
  isFirst?: boolean;
  /**
   * If `true`, the bottom border-radius is applied when closed
   */
  isLast?: boolean;
  // TODO 这种封装很傻逼
  iconColor?: 'text.primary';
  iconHover?: '';
}) => (
  <ListItemButton
    className={accordionHeaderClasses.header}
    component={RAccordion.Trigger}
    {...props}
    sx={[
      {
        width: '100%',
        color: (theme) => theme.palette.text.primary,
        fontWeight: 'md',
        '&:hover': {
          bgcolor: 'transparent',

          // icon bgColor
          [`& .${accordionHeaderClasses.icon}`]: {
            '&:before, &:after': {
              // TODO 这种情况感觉应该使用 变量来解决比较优雅
              bgcolor: AccordionHeaderPalette.hoverColor,
            },
          },
        },
        ...(isFirst && {
          borderTopLeftRadius: '3px',
          borderTopRightRadius: '3px',
        }),
        ...(isLast && {
          '&[data-state="closed"]': {
            borderBottomLeftRadius: '3px',
            borderBottomRightRadius: '3px',
          },
        }),
      },
      {
        '&[data-state="open"] > span:last-child': {
          '&::before': {
            transform: `translate(-50%, -50%) rotate(-90deg)`,
          },
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <ListItemContent>{children}</ListItemContent>
    <Sheet
      className={accordionHeaderClasses.icon}
      component={'span'}
      sx={(theme) => ({
        width: '15px',
        height: '15px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        flex: '0 0 auto',
        '&:before, &:after': {
          bgcolor: AccordionHeaderPalette.color,

          content: '""',
          position: 'absolute',

          left: '50%',
          top: '50%',

          transform: `translate(-50%, -50%)`,
          transition: 'transform 0.3s',
        },
        '&:before': {
          width: '1px',
          height: '100%',
        },
        '&:after': {
          height: '1px',
          width: '100%',
        },
      })}
    />
  </ListItemButton>
);

export const AccordionContent = ({
  children,
  isLast,
}: BoxProps & {
  /**
   * If `true`, the bottom border-radius is applied
   */
  isLast?: boolean;
}) => (
  <Box
    component={RAccordion.Content}
    sx={{
      overflow: 'hidden',
      // p: 1.5, ⚠️ Cannot use padding here, otherwise the animation is lagging. Not sure why.
      '&[data-state="open"]': {
        animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
        ...(isLast && {
          '& > div': {
            borderBottomLeftRadius: '3px',
            borderBottomRightRadius: '3px',
          },
        }),
      },
      '&[data-state="closed"]': {
        animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
      },
    }}
  >
    <Sheet
      // variant="soft"
      sx={{
        p: 1.5,
        bgcolor: 'transparent',
      }}
    >
      {children}
    </Sheet>
  </Box>
);

export const AccordionItem = RAccordion.Item;
// TODO  还要思考一下怎么暴露出别的类型

export interface AccordionRootProps extends RAccordion.AccordionImplMultipleProps {
  // TODO 这个还没思考好怎么到导出。。。
  type?: 'multiple' | 'single';
  sx?: SxProps;
  variant?: 'plain' | 'outlined';
  hasHeader?: boolean;
}

// TODO bgColor
export const AccordionRoot = ({ children, variant, sx, hasHeader, ...rest }: AccordionRootProps) => {
  let hasDivider = variant === 'outlined';
  return (
    <List
      variant="plain"
      component={RAccordion.Root}
      sx={[
        {
          '--ListDivider-gap': '0px',
          '--focus-outline-offset': '-2px',
          '--fortress-palette-divider': (theme) => theme.palette.neutral[500],
          [`& .${sheetClasses.root}`]: {
            bgcolor: 'transparent',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      color="primary"
      type="multiple"
      {...rest}
    >
      {!hasHeader && hasDivider && <ListDivider />}
      {React.Children.map(children, (child, index) => {
        if (child) {
          return (
            <>
              <Sheet
                sx={(theme) => ({
                  my: theme.spacing(1),
                })}
              >
                {child}
              </Sheet>
              {hasHeader && index === 0 ? null : hasDivider && <ListDivider />}
            </>
          );
        }
      })}
    </List>
  );
};

// TODO Currently the Footer is still being used, because there is no time to migrate it yet, so it is being kept for now. Ultimately this component will not be exposed.
export const Accordion = RAccordion;
