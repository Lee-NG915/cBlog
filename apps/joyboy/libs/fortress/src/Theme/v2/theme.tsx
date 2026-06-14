'use client';
import { iconButtonClasses } from '@mui/joy';
import { circularProgressClasses } from '@mui/joy/CircularProgress';
import { modalCloseClasses } from '@mui/joy/ModalClose';
import { withBrandColor } from '../../hooks/useBrandColor';
import { ExpandMore } from '../../Icons/legacy/expand-more/expand-more';
import breakpoints from '../breakpoints';
import { extendTheme } from '../helpers/extendTheme';
import { generateColorVariants } from '../helpers/generateColorVariants';
import { palette } from '../v1/colors';
import { paletteV2 } from './colors';
import { fontFamilyV2, fontSizeV2, fontWeightV2, lineHeightV2, typographyV2 } from './typography';
import { ChevronRight } from '../../Icons';

/**
 * Joy 源码
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/extendTheme.ts
 */

export const fortressV2Theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        brand: {
          ...palette,
          ...paletteV2,
        },
        primary: {
          // ...primaryColorsV2,
          ...paletteV2.terracotta,
          ...generateColorVariants(paletteV2.terracotta, ['solid', 'outlined', 'plain', 'soft']),
        },
        neutral: {
          // ...neutralColorsV2,
          ...paletteV2.maroonVelvet,
          ...generateColorVariants(paletteV2.maroonVelvet, ['solid', 'outlined', 'plain', 'soft']),
        },
        success: {
          // ...successColorsV2,
          ...paletteV2.leafGreen,
          ...generateColorVariants(paletteV2.leafGreen, ['solid', 'outlined', 'plain', 'soft']),
        },
        danger: {
          // ...dangerColorsV2,
          ...paletteV2.rosewood,
          ...generateColorVariants(paletteV2.rosewood, ['solid', 'outlined', 'plain', 'soft']),
        },
        warning: {
          // ...warningColorsV2,
          ...paletteV2.burntOrange,
          ...generateColorVariants(paletteV2.burntOrange, ['solid', 'outlined', 'plain', 'soft']),
        },
        common: {
          white: `var(--fortress-palette-brand-white)`,
          black: `var(--fortress-palette-brand-black)`,
        },
        text: {
          /**
           * text.primary - 主要文本颜色
           * 应用场景：
           * - Typography默认颜色：标题、正文等主要内容
           * - Button的plain变体文本颜色
           * - Link组件的默认文本颜色
           * - FormLabel/FormHelperText表单标签的默认颜色
           * - ListItemContent列表项的主要内容
           * - Table表格中的文本内容
           * - 其他需要高对比度、高可读性的文本元素
           */
          primary: `var(--fortress-palette-neutral-500)`,
          /**
           * text.secondary - 次要文本颜色
           * 应用场景：
           * - Typography使用color="neutral"时
           * - Breadcrumbs面包屑导航中的非活动项
           * - Tab未选中的标签文本
           * - ListItemButton未选中状态的列表项
           * - MenuItem未选中的菜单项
           * - FormHelperText表单辅助文本
           * - Input占位符文本颜色
           * - 其他次要重要性的文本内容
           */
          secondary: `var(--fortress-palette-neutral-500)`,
          /**
           * text.tertiary - 辅助文本颜色
           * 应用场景：
           * - Typography使用level="body3"或设置为tertiary颜色时
           * - Tooltip提示文本
           * - Badge徽章中的文本
           * - TableFooter表格脚注
           * - 时间戳/元数据信息(如评论日期、文件大小等)
           * - 某些组件在半禁用状态下的文本
           * - 重要性较低的辅助说明文本
           */
          tertiary: `var(--fortress-palette-neutral-500)`,
          /**
           * text.icon - 图标颜色
           * 应用场景：
           * - Icon/SvgIcon组件的默认颜色
           * - IconButton的plain变体默认图标颜色
           * - Input/Select装饰器中的图标
           * - ListItemDecorator列表项的图标装饰
           * - Checkbox/Radio/Switch未选中状态的图标颜色
           * - Accordion展开/折叠图标
           * - 其他独立图标元素
           */
          // icon: `var(--fortress-palette-brand-mono-900)`,
        },
        background: {
          body: 'var(--fortress-palette-brand-warmLinen-200)', //页面主体背景 通过 CssBaseline 应用到 <body> 元素
          surface: 'var(--fortress-palette-brand-warmLinen-200)', //Sheet、Card 等组件的默认背景
          popup: 'var(--fortress-palette-brand-warmLinen-200)', //Menu、Select 的下拉面板等
          backdrop: 'transparent', //Dialog、Drawer 等组件的背景
          // 不同层级的背景，用于创建视觉层次 用于嵌套组件的背景，如卡片内的卡片
          level1: 'var(--fortress-palette-brand-warmLinen-200)',
          level2: 'var(--fortress-palette-brand-warmLinen-300)',
          level3: 'var(--fortress-palette-brand-warmLinen-400)',
          // tooltip: 'var(--fortress-palette-burntOrange-500)',
        },
        divider: 'var(--fortress-palette-brand-mono-300)',
        // focusVisible: 'var(--fortress-palette-neutral-500)', // 聚焦状态的背景颜色
      },
      // shadowRing: '0 0 #000', //阴影大小
      // shadowChannel: '21 21 21', //阴影颜色
      // shadowOpacity: '0.08', //阴影透明度
    },
    // dark: {},
  },
  focus: {
    thickness: '0px',
    default: {
      // outlineOffset: '2px',
      // outlineColor: 'var(--fortress-palette-brand-blueNCS-200)',
      // outlineBorder: '2px',
    },
  },
  fontFamily: fontFamilyV2,
  fontSize: fontSizeV2,
  fontWeight: fontWeightV2,
  typography: typographyV2,
  lineHeight: lineHeightV2,
  radius: {
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    xs: '0',
  },
  variants: {},
  breakpoints,
  shadow: {
    /* offset-x | offset-y | blur-radius | spread-radius | color */
    sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
    md: '0px 2px 6px 0px rgba(0, 0, 0, 0.25)',
    lg: '0px 4px 10px -1px rgba(0, 0, 0, 0.30)',
    raised: {
      sm: '0px 2px 4px 0px rgba(0, 0, 0, 0.15)',
      md: '0px 4px 8px 1px rgba(0, 0, 0, 0.15)',
      lg: '0px 6px 12px 2px rgba(0, 0, 0, 0.25)',
    },
    floating: {
      sm: '0px 6px 20px -1px rgba(34, 34, 34, 0.20)',
      md: '0px 8px 30px -2px rgba(34, 34, 34, 0.30)',
      lg: '0px 12px 40px -3px rgba(34, 34, 34, 0.40)',
    },
  },
  spacing: (num: number) => num * 4,
  // spacing: (num: number) => {
  //   // 根据设计系统的像素值映射
  //   const spacingMap: Record<number, number> = {
  //     1: 4,
  //     2: 8,
  //     3: 12,
  //     4: 16,
  //     5: 20,
  //     6: 24,
  //     7: 32,
  //     8: 40,
  //     9: 60,
  //     10: 96,
  //   };

  //   // 如果存在映射值，使用映射值；否则使用默认的 4px 倍数
  //   return spacingMap[num] || num * 4;
  // },
  cssVarPrefix: 'fortress',
  components: {
    MuiUseMediaQuery: {
      defaultProps: {},
    },

    /**
     * Joy UI 的 CSS 变量通常遵循以下命名规则：
     *  --ComponentName-property: 例如 --Radio-size。
     *  --variant-property: 例如 --variant-outlinedBorder。
     *  --palette-property: 例如 --palette-primary-main。
     *
     * 组件variant变量 color: var(--variant-outlinedColor, var(--fortress-palette-primary-outlinedColor, var(--fortress-palette-primary-500, #0B6BCB)));
     *
     * 实现方式：
     *    1：
     *      ...(ownerState.variant === 'outlined' && {
     *        border: '1px solid var(--fortress-palette-brand-mono-outlinedBorder)',
     *      },
     *    2：'--variant-outlinedColor': 'var(--fortress-palette-brand-mono-outlinedColor)',
     *    3：'--fortress-palette-primary-outlinedColor': 'var(--fortress-palette-brand-mono-outlinedColor)',
     *    4：'--fortress-palette-primary-500': 'var(--fortress-palette-brand-mono-outlinedColor)',
     *
     * 第二种方案最好，因为CSS变量回退机制的特性，性能更好，开发也方便
     */
    JoyContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            '&.MuiContainer-disableGutters': {
              paddingLeft: 0,
              paddingRight: 0,
            },
            [theme.breakpoints.down('sm')]: {
              '&:not(.MuiContainer-disableGutters)': {
                paddingLeft: theme.spacing(6),
                paddingRight: theme.spacing(6),
              },
            },
            [theme.breakpoints.up('sm')]: {
              '&:not(.MuiContainer-disableGutters)': {
                paddingLeft: theme.spacing(7),
                paddingRight: theme.spacing(7),
              },
            },
            [theme.breakpoints.down(1729)]: {
              '&.MuiContainer-maxWidthXl': {
                maxWidth: '100vw',
              },
            },
            [theme.breakpoints.up(1729)]: {
              '&.MuiContainer-maxWidthXl': {
                maxWidth: '1728px',
                paddingLeft: 0,
                paddingRight: 0,
              },
            },
            '&.MuiContainer-fixed': {
              [theme.breakpoints.up('xs')]: {
                maxWidth: '390px',
              },
              [theme.breakpoints.up('sm')]: {
                maxWidth: '640px',
              },
              [theme.breakpoints.up('md')]: {
                maxWidth: '960px',
              },
              [theme.breakpoints.up('lg')]: {
                maxWidth: '1440px',
              },
              [theme.breakpoints.up('xl')]: {
                maxWidth: '1728px',
              },
            },
          };
        },
      },
    },
    JoyBadge: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme }) => ({
          '--Badge-ring': 'none',
          '& .MuiBadge-badge': {
            // 使用 caption2 字体样式
            ...theme.typography.caption2,
            // height: '16px',
            maxHeight: '16px',
            lineHeight: '16px',
            border: 'none',
            borderRadius: '8px', // 高度的一半，确保圆形外观
            padding: '0 4px',
            minWidth: '16px',
            minHeight: '16px',
            // 内容居中
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 文本不换行，超出时自动撑大宽度
            whiteSpace: 'nowrap',
            '& svg': {
              width: '12px',
              height: '12px',
              fontSize: '12px',
            },
            '& > *': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
        }),
      },
    },
    JoySheet: {
      defaultProps: {
        variant: 'soft',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          border: 'none',
          ...(ownerState.variant === 'solid' && {
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
          }),
          ...(ownerState.variant === 'soft' && {
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          }),
        }),
      },
    },
    JoyButton: {
      defaultProps: {
        color: 'primary',
        variant: 'solid',
        size: 'md',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          // 基础样式
          ...theme.typography.subh2,
          transition: 'all 0.2s ease-out',
          textTransform: 'uppercase',
          '--variant-borderWidth': '1px',
          // 所有变体共有样式
          gap: theme.spacing(2),
          borderRadius: theme.spacing(2),
          ...(!ownerState['data-image-button-module'] && {
            [`& .${circularProgressClasses.root}`]: {
              '--CircularProgress-progressColor': `var(--fortress-palette-${ownerState.color}-500,--variant-${ownerState.variant}Bg)`,
            },
          }),
          // '--variant-plainHoverColor': `var(--fortress-palette-${ownerState.color || 'primary'}-600)`,
          ...(ownerState.size === 'sm' && {
            ...theme.typography.subh3,
            padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
            '--Button-minHeight': 38,
            height: 38,
          }),
          ...(ownerState.size === 'md' && {
            fontSize: `var(--fortress-fontSize-sm)`,
            padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
            '--Button-minHeight': 41,
            height: 41,
          }),
          ...(ownerState.size === 'lg' && {
            fontSize: `var(--fortress-fontSize-sm)`,
            padding: `14.5px ${theme.spacing(4)}`,
            '--Button-minHeight': 46,
            height: 46,
          }),

          ...(!ownerState['data-image-button-module'] &&
            ownerState.color === 'primary' &&
            ownerState.variant === 'solid' && {
              ...withBrandColor('burntOrange', { variant: 'solid' }),
              '--variant-solidColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-solidHoverColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-solidActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': 'var(--fortress-palette-brand-warmLinen-500)',
              },
            }),

          ...(!ownerState['data-image-button-module'] &&
            ownerState.variant === 'outlined' && {
              ...(ownerState.loading && {
                borderColor: `var(--fortress-palette-${ownerState.color}-500)`,
                '&.Mui-disabled': {
                  borderColor: `var(--fortress-palette-${ownerState.color}-500)`,
                },
              }),

              ...(ownerState.color === 'neutral' && {
                '--variant-outlinedHoverBg': 'var(--fortress-palette-neutral-400)',
                '--variant-outlinedActiveBg': 'var(--fortress-palette-neutral-500)',
                '--variant-outlinedHoverColor': 'var(--fortress-palette-brand-warmLinen-500)',
                '--variant-outlinedActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
              }),
              ...(ownerState.color === 'danger' && {
                '--variant-outlinedActiveBg': 'var(--fortress-palette-danger-400)',
                '--variant-outlinedActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
              }),
            }),

          ...(Boolean(ownerState['data-image-button-module']) && {
            ...(ownerState.variant === 'solid' && {
              '--variant-solidColor': 'var(--fortress-palette-neutral-500)',
              '--variant-solidBg': 'var(--fortress-palette-brand-warmLinen-200)',
              '--variant-solidBorder': 'var(--fortress-palette-brand-warmLinen-200)',
              '--variant-solidHoverColor': 'var(--fortress-palette-neutral-500)',
              '--variant-solidHoverBg': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-solidHoverBorder': 'transparent',
              '--variant-solidFocusBg': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-solidActiveBg': 'var(--fortress-palette-brand-warmLinen-800)',
              '--variant-solidActiveBorder': 'transparent',
              '--variant-solidActiveColor': 'var(--fortress-palette-neutral-500)',
              '--variant-solidDisabledColor': 'var(--fortress-palette-brand-mono-500)',
              '--variant-solidDisabledBg': 'var(--fortress-palette-brand-mono-200)',
              '--variant-solidDisabledBorder': 'transparent',

              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': 'var(--fortress-palette-neutral-500)',
              },
            }),

            ...(ownerState.variant === 'outlined' && {
              '--variant-outlinedColor': 'var(--fortress-palette-brand-warmLinen-200)',
              '--variant-outlinedBorder': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-outlinedHoverBg': 'rgba(246, 243, 231, 0.20)',
              '--variant-outlinedHoverColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-outlinedHoverBorder': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-outlinedActiveBg': 'rgba(246, 243, 231, 0.50)',
              '--variant-outlinedActiveBorder': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-outlinedActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
              '--variant-outlinedDisabledBorder': 'var(--fortress-palette-brand-mono-300)',
              '--variant-outlinedDisabledBg': 'transparent',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': 'var(--fortress-palette-brand-warmLinen-500)',
              },
            }),

            ...(ownerState.variant === 'plain' && {
              '--variant-plainColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-plainBorder': 'transparent',
              '--variant-plainHoverBg': 'rgba(246, 243, 231, 0.20)',
              '--variant-plainHoverColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-plainHoverBorder': 'transparent',
              '--variant-plainActiveBg': 'rgba(246, 243, 231, 0.50)',
              '--variant-plainActiveBorder': 'transparent',
              '--variant-plainActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
              '--variant-plainDisabledColor': 'var(--fortress-palette-brand-mono-500)',
              '--variant-plainDisabledBorder': 'var(--fortress-palette-brand-mono-300)',
              '--variant-plainDisabledBg': 'transparent',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': 'var(--fortress-palette-brand-warmLinen-500)',
              },
            }),
            ...(ownerState.loading && {
              '&.Mui-disabled': {
                backgroundColor: `var(--variant-${ownerState.variant}Bg)`,
                borderColor: `var(--variant-${ownerState.variant}Border)`,
              },
            }),
          }),
        }),
      },
    },
    JoyTooltip: {
      defaultProps: {
        color: 'primary',
        variant: 'soft',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          padding: 16,
          border: 0,
          boxShadow: theme.shadow.md,
          borderRadius: theme.spacing(1),
          ...theme.typography.caption1,

          // Soft变体token
          '--variant-softBg': 'var(--fortress-palette-brand-warmLinen-500)',
          '--variant-softColor': 'var(--fortress-palette-brand-mono-900)',

          // Solid变体token
          '--variant-solidBg': 'var(--fortress-palette-brand-mono-900)',
          '--variant-solidColor': 'var(--fortress-palette-brand-warmLinen-500)',

          // 特殊选择器
          '.MuiTooltip-arrow::before': {
            boxShadow: 'none',
            borderColor:
              ownerState.variant === 'soft'
                ? 'var(--fortress-palette-brand-warmLinen-500)'
                : 'var(--fortress-palette-brand-mono-900)',
          },

          // 全局图标颜色
          '--fortress-palette-text-icon':
            ownerState.variant === 'solid' ? 'var(--fortress-palette-brand-mono-color)' : undefined,
        }),
      },
    },
    JoySnackbar: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.body1,
          position: 'fixed',
          '--Snackbar-padding': theme.spacing(4),
          gap: theme.spacing(2),
          border: 'none',
          boxShadow: 'none',
          alignItems: 'flex-start',
          // Solid变体token light
          '--variant-solidColor': 'var(--fortress-palette-neutral-500)',
          '--variant-solidBg': 'var(--fortress-palette-brand-warmLinen-500)',

          // Soft变体token. dark
          '--variant-softColor': 'var(--fortress-palette-brand-warmLinen-500)',
          '--variant-softBg': 'var(--fortress-palette-brand-mono-900)',

          '&.toast-desktop': {
            alignItems: 'center',
          },

          // Toast组件的两行布局样式
          '& .toast-content-desktop': {
            display: 'flex',
            gap: theme.spacing(2),
            width: '100%',
            alignItems: 'center',
          },
          '& .toast-content-mobile': {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
            width: '100%',
          },

          '& .toast-top-row': {
            display: 'flex',
            alignItems: 'flex-start',
            gap: theme.spacing(2),
            width: '100%',
          },

          // Toast内容区域样式
          '& .toast-content-wrapper': {
            flex: 1,
          },

          // endDecorator 靠右对齐样式
          '& .toast-end-decorator': {
            marginLeft: 'auto',
          },

          '& .toast-action-row': {
            marginLeft: 'auto',
          },
        }),
      },
    },
    JoyChip: {
      defaultProps: {
        color: 'primary',
        variant: 'solid',
      },
      styleOverrides: {
        label: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          gap: theme.spacing(1),
        }),
        action: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          borderRadius: 'none',
        }),
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          // Tag 的样式抽离在导出的 Tag 组件中，这里为 Chip 的样式
          ...theme.typography.caption2,
          textAlign: 'center',
          '--_Chip-radius': 'none',
          '--Chip-action-radius': 'none',
          whiteSpace: 'wrap',
          // 固定桌面高度为 25px（含边框与内边距）
          boxSizing: 'border-box',
          // padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
          svg: {
            fill: 'currentColor',
          },
          ...(ownerState.variant === 'solid' && {
            border: 'none',
          }),
          [theme.breakpoints.down('sm')]: {
            // minHeight: 30, // 小屏幕
          },
          [theme.breakpoints.up('sm')]: {
            // minHeight: 32, // 大屏幕
            backgroundColor: '',
          },
          ...(ownerState.color === 'warning' && {
            '--variant-solidBg': 'var(--fortress-palette-warning-400)',
            '--variant-solidBorder': 'var(--fortress-palette-warning-400)',
          }),
        }),
      },
    },
    JoyTabList: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          // border: 'none',
        }),
      },
    },
    JoyTab: {
      defaultProps: {
        color: 'neutral',
        variant: 'plain',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.subh1,
          '--ListItem-gap': theme.spacing(2),
          padding: `${theme.spacing(3)} ${theme.spacing(6)}`,
          borderRadius: theme.spacing(2),

          ...(ownerState.variant === 'plain' && {
            '--variant-plainBg': 'transparent', // Default背景
            '--variant-plainColor': 'var(--fortress-palette-neutral-500)', // Default文字色
            '--variant-plainHoverBg': 'var(--fortress-palette-neutral-400)', // Hover背景
            '--variant-plainHoverColor': 'var(--fortress-palette-brand-warmLinen-500)', // Hover文字色
            '--variant-plainActiveBg': 'var(--fortress-palette-neutral-600)', // Selected背景
            '--variant-plainActiveColor': 'var(--fortress-palette-brand-warmLinen-500)', // Selected文字色
            '&:hover': {
              svg: {
                color: 'var(--fortress-palette-brand-warmLinen-500)',
              },
            },
          }),

          ...(ownerState.variant === 'underline' && {
            padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
            ...theme.typography.subh3,
            border: 'none',
            '--variant-underlineBg': 'transparent', // Default背景
            '--variant-underlineActiveBg': 'transparent', // Selected背景
            '--variant-underlineActiveBorder': 'none', // Selected背景
            '--unstable_TabList-underlineBottom': '-1px',
            color: 'var(--fortress-palette-neutral-500)',

            '&:hover': {
              color: 'var(--fortress-palette-neutral-500)',
            },
            '&.Mui-selected': {
              color: 'var(--fortress-palette-neutral-500)',
            },
          }),
        }),
      },
    },
    JoyTabPanel: {
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.body1,
        }),
      },
    },
    JoySwitch: {
      defaultProps: {
        color: 'primary',
        variant: 'outlined',
      },
      styleOverrides: {
        thumb: ({ ownerState, theme }) => ({
          transition: 'left 0.3s ease, background-color 0.3s',
        }),
        track: ({ ownerState, theme }) => ({}),
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.body2,
          color: 'var(--fortress-palette-brand-mono-900)',
          '--Switch-trackRadius': '10px',
          '--variant-outlinedColor': 'var(--fortress-palette-brand-mono-700)',
          '--variant-outlinedHoverColor': 'var(--fortress-palette-brand-mono-700)',

          ...(!ownerState.checked && {
            '--variant-outlinedBorder': 'var(--fortress-palette-brand-mono-700)',
            '--variant-outlinedBg': 'transparent',
            '--variant-outlinedHoverBg': 'var(--fortress-palette-brand-mono-100)',
            '--variant-outlinedHoverBorder': 'var(--fortress-palette-brand-mono-700)',
          }),
          ...(ownerState.checked &&
            !ownerState.disabled && {
              '--variant-outlinedBorder': 'var(--fortress-palette-primary-500)',
              '--variant-outlinedBg': 'transparent',
              '--variant-outlinedHoverBg': 'var(--fortress-palette-primary-100)',
              '--variant-outlinedHoverBorder': 'var(--fortress-palette-primary-600)',
              '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--fortress-palette-primary-600)',
              },
            }),

          '&.Mui-disabled': {
            color: 'var(--fortress-palette-brand-mono-500)',
            '--Switch-thumbBackground': 'var(--fortress-palette-brand-mono-100)',
            '--Switch-trackBackground': 'var(--fortress-palette-brand-mono-200)',
            '--Switch-trackBorderColor': 'var(--fortress-palette-brand-mono-300)',
          },
        }),
      },
    },
    JoyRadio: {
      defaultProps: {
        color: 'primary',
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.body2,
          '--Icon-fontSize': '24px',
          '.MuiRadio-radio': {
            '--variant-borderWidth': '2px',
          },
          alignItems: 'center',
        }),
      },
    },
    // @ts-ignore
    JoyRadioButton: {
      defaultProps: {
        color: 'neutral',
        variant: 'outlined',
        size: 'md',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          borderRadius: theme.spacing(2),
          ...theme.typography.body2,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          '& label': {
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // textTransform: 'capitalize',
            ...(ownerState.size === 'sm' && {
              padding: `${theme.spacing(2.3)} ${theme.spacing(4)}`,
              '@media (min-width: 0px)': {
                fontSize: `var(--fortress-fontSize-sm)`,
              },
            }),
            ...(ownerState.size === 'md' && {
              padding: `${theme.spacing(2.325)} ${theme.spacing(4)}`,
              '@media (min-width: 0px)': {
                fontSize: `var(--fortress-fontSize-md)`,
              },
            }),
            ...(ownerState.size === 'lg' && {
              padding: `${theme.spacing(2.6)} ${theme.spacing(4)}`,
              '@media (min-width: 0px)': {
                fontSize: `var(--fortress-fontSize-lg)`,
              },
            }),
          },

          ...(ownerState.variant === 'outlined' && {
            border: '1px solid var(--fortress-palette-brand-mono-300)',
            '&:hover': {
              backgroundColor: 'var(--fortress-palette-brand-maroonVelvet-300)',
              color: 'var(--fortress-palette-brand-warmLinen-500)',
              borderColor: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
            '&:active': {
              backgroundColor: 'var(--fortress-palette-brand-maroonVelvet-500)',
              color: 'var(--fortress-palette-brand-warmLinen-500)',
              borderColor: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
            '&.Mui-checked': {
              backgroundColor: 'var(--fortress-palette-brand-maroonVelvet-500)',
              color: 'var(--fortress-palette-brand-warmLinen-500)',
              borderColor: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
            ...(ownerState.disabled && {
              borderColor: 'var(--fortress-palette-brand-mono-500)',
              backgroundColor: 'transparent',
              color: 'var(--fortress-palette-brand-mono-500)',
            }),
          }),
        }),
      },
    },
    JoySlider: {
      defaultProps: {
        color: 'primary',
        variant: 'solid',
      },
      styleOverrides: {
        track: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          border: 'none',
        }),
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          '--Slider-thumbWidth': '12px',
          '--Slider-thumbSize': '12px',
          '--variant-borderWidth': '0px',
          '--Slider-trackSize': '2px',
          border: 'none',
          '--variant-solidDisabledBg': 'var(--fortress-palette-brand-mono-500)',
          '& .MuiSlider-thumb': {
            '&.Mui-focusVisible': {
              outline: 'none',
            },
            '&::before': {
              backgroundColor: 'var(--fortress-palette-primary-500)',
            },
          },

          '--Slider-railBackground': 'var(--fortress-palette-primary-200)',
          '&:hover': {
            '--Slider-railBackground': 'var(--fortress-palette-primary-200)',
            '& .MuiSlider-thumb': {
              '&::before': {
                backgroundColor: 'var(--fortress-palette-primary-600)',
              },
            },
          },

          '&:active': {
            '& .MuiSlider-thumb': {
              '&::before': {
                backgroundColor: 'var(--fortress-palette-primary-800)',
              },
            },
          },
          '&.Mui-disabled': {
            '--Slider-railBackground': 'var(--fortress-palette-brand-mono-200)',
            '& .MuiSlider-thumb': {
              '&::before': {
                backgroundColor: 'var(--fortress-palette-brand-mono-500)',
              },
            },
          },

          // 去掉mark point
          '& .MuiSlider-mark': {
            display: 'none',
          },
        }),
        valueLabel: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.caption1,
        }),
        markLabel: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.caption1,
        }),
      },
    },
    JoySvgIcon: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          color: 'currentColor',
          fill: 'currentColor',
        }),
      },
    },

    JoyAccordionGroup: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            border: 'none',
            '--ListItem-paddingLeft': 0,
            '--ListItem-paddingRight': 0,
            '--ListItem-paddingY': theme.spacing(3),
            '& .MuiAccordionDetails-content': {
              '&.Mui-expanded': {
                padding: 0,
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(5),
              },
            },
          };
        },
      },
    },
    JoyAccordion: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          border: 'none',
          '--variant-hoverColor': 'var(--fortress-palette-warning-700)',
          '--variant-plainHoverColor': 'var(--fortress-palette-warning-700)',
          '--variant-plainHoverBg': 'transparent',
          '--variant-activeColor': 'var(--fortress-palette-warning-800)',
          '--variant-plainActiveColor': 'var(--fortress-palette-warning-800)',
          '--variant-plainActiveBg': 'transparent',

          '& .MuiAccordionSummary-button': {
            '&:hover': {
              svg: {
                fill: 'var(--fortress-palette-warning-700)',
              },
            },
            '&:active': {
              svg: {
                fill: 'var(--fortress-palette-warning-800)',
              },
            },
          },

          [theme.breakpoints.down('sm')]: {
            '& svg': {
              '--fortress-icon-width': '18px',
              '--fortress-icon-height': '18px',
            },
          },
        }),
      },
    },
    JoyAccordionSummary: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          border: 'none',
          ...theme.typography.h5,
          button: {
            border: 'none',
          },
        }),
      },
    },
    JoyAccordionDetails: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...theme.typography.caption2,
        }),
      },
    },
    JoyCheckbox: {
      defaultProps: {
        color: 'primary',
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--Checkbox-gap': theme.spacing(3),
          '--variant-outlinedActiveBg': 'var(--fortress-palette-primary-200)',
          '.MuiCheckbox-checkbox': {
            '--variant-borderWidth': '2px',
          },
          minHeight: '36px',
          alignItems: 'center',
        }),
        label: ({ ownerState, theme }) => ({
          ...theme.typography.body2,
        }),
      },
    },
    JoyBreadcrumbs: {
      defaultProps: {
        separator: <ChevronRight width={16} height={16} />,
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...theme.typography.caption1,
          gap: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          color: 'var(--fortress-palette-brand-mono-700)',
          textWrap: 'wrap',
          [theme.breakpoints.down('sm')]: {
            padding: `${theme.spacing(2)} 0`,
          },
          [theme.breakpoints.up('sm')]: {
            padding: `${theme.spacing(3)} 0`,
          },
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--IconButton-size': 'auto',
          padding: theme.spacing(2),
          borderRadius: '50%',

          // 所有变体共有的token
          '--Icon-color':
            ownerState?.variant === 'solid'
              ? 'var(--fortress-palette-brand-warmLinen-500)'
              : ownerState?.variant === 'outlined'
              ? 'var(--fortress-palette-neutral-500)'
              : 'var(--fortress-palette-warning-500)',

          // Solid变体token
          ...(ownerState.variant === 'solid' && {
            '--variant-solidBg': 'var(--fortress-palette-warning-500)',
            '--variant-solidColor': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-solidBorder': 'transparent',
            '--variant-solidHoverBg': 'var(--fortress-palette-warning-600)',
            '--variant-solidHoverBorder': 'transparent',
            '--variant-solidFocusBg': 'var(--fortress-palette-warning-600)',
            '--variant-solidActiveBg': 'var(--fortress-palette-warning-800)',
            '--variant-solidActiveBorder': 'transparent',
            '--variant-solidFocusBorder': 'transparent',
            '--variant-solidDisabledBorder': 'transparent',
            '--variant-solidDisabledBg': 'var(--fortress-palette-brand-mono-200)',
            '--variant-solidDisabledColor': 'var(--fortress-palette-brand-mono-500)',
            ...(ownerState.loading && {
              '&.Mui-disabled': {
                color: 'var(--fortress-palette-brand-mono-500)',
                border: 'none',
              },
            }),
          }),

          // Outlined变体token
          ...(ownerState.variant === 'outlined' && {
            '--variant-outlinedBg': 'var(--fortress-palette-common-white)',
            '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
            '--variant-outlinedBorder': 'var(--fortress-palette-neutral-500)',
            '--variant-outlinedHoverColor': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-outlinedHoverBg': 'var(--fortress-palette-neutral-400)',
            '--variant-outlinedFocusColor': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-outlinedFocusBg': 'var(--fortress-palette-neutral-400)',
            '--variant-outlinedActiveColor': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-outlinedActiveBg': 'var(--fortress-palette-neutral-500)',
            '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
            '--variant-outlinedDisabledBg': 'var(--fortress-palette-brand-mono-50)',
          }),

          // // Plain变体token
          ...(ownerState.variant === 'plain' && {
            '--variant-plainBg': 'transparent',
            '--variant-plainColor': 'var(--fortress-palette-warning-500)',
            '--variant-plainBorder': 'transparent',
            '--variant-plainHoverColor': 'var(--fortress-palette-warning-600)',
            '--variant-plainHoverBg': 'transparent',
            '--variant-plainFocusColor': 'var(--fortress-palette-warning-600)',
            '--variant-plainFocusBg': 'transparent',
            '--variant-plainActiveColor': 'var(--fortress-palette-warning-500)',
            '--variant-plainActiveBg': 'transparent',
            '--variant-plainDisabledColor': 'var(--fortress-palette-brand-mono-500)',
            '--variant-plainDisabledBg': 'transparent',
          }),

          // // Soft 变体 token
          ...(ownerState.variant === 'soft' && {
            '--variant-softBg': 'var(--fortress-palette-brand-warmLinen-200)',
            '--variant-softColor': 'var(--fortress-palette-warning-500)',
            '--variant-softBorder': 'transparent',
            '--variant-softHoverColor': 'var(--fortress-palette-warning-600)',
            '--variant-softHoverBg': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-softFocusColor': 'var(--fortress-palette-warning-600)',
            '--variant-softFocusBg': 'var(--fortress-palette-brand-warmLinen-500)',
            '--variant-softActiveColor': 'var(--fortress-palette-warning-800)',
            '--variant-softActiveBg': 'var(--fortress-palette-brand-warmLinen-800)',
            '--variant-softDisabledColor': 'var(--fortress-palette-brand-mono-500)',
            '--variant-softDisabledBg': 'var(--fortress-palette-brand-mono-200)',
          }),

          // 保留loading状态
          ...(ownerState.loading &&
            ownerState?.variant === 'solid' && {
              '--variant-solidDisabledBg': 'var(--fortress-palette-warning-500)',
              '--variant-solidDisabledBorder': 'none',
              [`& .${iconButtonClasses.loadingIndicator}`]: {
                position: 'relative',
              },
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-trackColor': 'transparent',
                '--CircularProgress-progressColor': 'var(--fortress-palette-brand-warmLinen-500)',
                '--CircularProgress-percent': `${75} !important`,
              },
            }),

          ...(ownerState.loading &&
            ownerState?.variant === 'outlined' && {
              '--variant-outlinedDisabledBorder': 'var(--fortress-palette-neutral-500)',
              [`& .${iconButtonClasses.loadingIndicator}`]: {
                position: 'relative',
              },
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-trackColor': 'transparent',
                '--CircularProgress-progressColor': 'var(--fortress-palette-neutral-500)',
                '--CircularProgress-percent': `${75} !important`,
              },
            }),

          ...(ownerState.loading &&
            ownerState?.variant === 'plain' && {
              // '--variant-plainDisabledBg': 'var(--fortress-palette-warning-500)',
              [`& .${iconButtonClasses.loadingIndicator}`]: {
                position: 'relative',
              },
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-trackColor': 'transparent',
                '--CircularProgress-progressColor': 'var(--fortress-palette-warning-500)',
                '--CircularProgress-percent': `${75} !important`,
              },
            }),

          ...(ownerState.loading &&
            ownerState.variant === 'soft' && {
              '--variant-softDisabledBg': 'var(--fortress-palette-brand-warmLinen-200)',
              [`& .${iconButtonClasses.loadingIndicator}`]: {
                position: 'relative',
              },
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-trackColor': 'transparent',
                '--CircularProgress-progressColor': 'var(--fortress-palette-warning-500)',
                '--CircularProgress-percent': `${75} !important`,
              },
            }),
        }),
      },
    },
    JoyCircularProgress: {
      defaultProps: {
        // color: 'warning',
        variant: 'plain',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--CircularProgress-size': '24px',
          '--CircularProgress-trackColor': 'transparent',
          '--CircularProgress-thickness': '4px',
          '--fortress-palette-primary-plainColor': 'var(--fortress-palette-brand-warmLinen-500)',
        }),
      },
    },
    JoyLinearProgress: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--fortress-palette-neutral-softBg': 'var(--fortress-palette-primary-100)',
          '--LinearProgress-progressThickness': '8px',
          '--LinearProgress-thickness': '8px',
          overflow: 'hidden',
        }),
      },
    },
    JoyLink: {
      defaultProps: {
        variant: 'plain',
        color: 'primary',
        underline: 'always',
        level: 'body1',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          padding: 0,
          margin: 0,
          '--Link-gap': theme.spacing(1),
          '--variant-hoverBg': 'transparent',
          '--variant-plainActiveBg': 'transparent',
          ...(ownerState.color === 'warning' && {
            '--variant-plainColor': 'var(--fortress-palette-warning-500)',
            '--variant-plainHoverColor': 'var(--fortress-palette-warning-600)',
            '--variant-plainActiveColor': 'var(--fortress-palette-warning-800)',
            textDecorationColor: 'var(--fortress-palette-warning-500)',
            '--variant-plainHoverBg': 'transparent',

            ':hover': {
              textDecorationColor: 'var(--fortress-palette-warning-600)',
            },
            ':active': {
              textDecorationColor: 'var(--fortress-palette-warning-800)',
            },
            ':focus-visible': {
              '--variant-plainColor': 'var(--fortress-palette-warning-600)',
              textDecorationColor: 'var(--fortress-palette-warning-600)',
            },
          }),

          ...(ownerState.color === 'tertiary' && {
            color: 'var(--fortress-palette-brand-warmLinen-500)',
            textDecorationColor: 'var(--fortress-palette-brand-warmLinen-500)',
            ':hover': {
              color: 'var(--fortress-palette-brand-warmLinen-600)',
              textDecorationColor: 'var(--fortress-palette-brand-warmLinen-600)',
            },
            ':active': {
              color: 'var(--fortress-palette-brand-warmLinen-800)',
              textDecorationColor: 'var(--fortress-palette-brand-warmLinen-800)',
            },
            ':focus-visible': {
              '--variant-plainColor': 'var(--fortress-palette-warning-600)',
              textDecorationColor: 'var(--fortress-palette-warning-600)',
            },
            ...(ownerState.disabled && {
              textDecorationColor: 'var(--fortress-palette-brand-mono-500)',
            }),
          }),

          ...(ownerState.disabled && {
            color: 'var(--fortress-palette-brand-mono-500)',
            textDecorationColor: 'var(--fortress-palette-brand-mono-500)',
          }),

          ...(ownerState.size === 'xs' && {
            fontSize: '14px !important',
            fontWeight: 400,
            lineHeight: '120%',
          }),
          ...(ownerState.size === 'sm' && {
            fontSize: '16px !important',
            fontWeight: 400,
            lineHeight: '120%',
          }),
          ...(ownerState.size === 'md' && {
            fontSize: '18px !important',
            fontWeight: 400,
            lineHeight: '120%',
          }),
          ...(ownerState.size === 'lg' && {
            fontSize: '20px !important',
            fontWeight: 400,
            lineHeight: '120%',
          }),
        }),
      },
    },
    JoyPagination: {
      defaultProps: {
        color: 'primary',
        variant: 'text',
        size: 'md',
        shape: 'circular',
        siblingCount: 0,
        boundaryCount: 1,
      },
      styleOverrides: {
        ul: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          gap: theme.spacing(2),
        }),
      },
    },
    JoyPaginationItem: {
      defaultProps: {
        // variant: 'text',
        // shape: 'circular',
        // size: 'md',
      },
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...theme.typography.body2,
          '&&': {
            border: 'none',
          },

          '--variant-plainColor': theme.vars.palette.primary[500],
          '--variant-plainHoverBg': theme.vars.palette.primary[100],
          '--variant-plainHoverColor': theme.vars.palette.primary[600],
          '--variant-plainActiveColor': theme.vars.palette.primary[600],
          '--variant-plainActiveBg': theme.vars.palette.primary[100],
          backgroundColor: 'transparent',

          ...(ownerState.size === 'md' && {
            width: theme.spacing(10),
            height: theme.spacing(10),
            alignItems: 'center',
            justifyContent: 'center',
          }),

          ...(ownerState.selected && {
            backgroundColor: theme.vars.palette.primary[500],
            color: theme.vars.palette.brand.warmLinen[500],
            svg: {
              path: {
                fill: theme.vars.palette.brand.warmLinen[500],
              },
            },
          }),

          ':active': {
            svg: {
              path: {
                fill: theme.vars.palette.primary[600],
              },
            },
          },
          ':focus-visible': {
            backgroundColor: theme.vars.palette.primary[100],
            '--variant-plainColor': theme.vars.palette.primary[600],
            svg: {
              path: {
                fill: theme.vars.palette.primary[600],
              },
            },
          },
        }),

        icon: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          path: {
            fill: theme.vars.palette.primary[500],
          },
          ...(ownerState.disabled && {
            path: {
              fill: theme.vars.palette.brand.mono[500],
            },
          }),
        }),

        ellipsis: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ':hover': {
            cursor: 'pointer',
          },
          ...(ownerState.size === 'md' && {
            width: theme.spacing(10),
            height: theme.spacing(10),
          }),
        }),
      },
    },
    JoyFab: {
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          padding: 0,
          '--Button-minHeight': 0,
          ...(ownerState.size === 'sm' && {
            width: theme.spacing(10),
            height: theme.spacing(10),
            '--fortress-icon-width': theme.spacing(6),
            '--fortress-icon-height': theme.spacing(6),
          }),
          ...(ownerState.size === 'md' && {
            width: theme.spacing(14),
            height: theme.spacing(14),
            '--fortress-icon-width': theme.spacing(8),
            '--fortress-icon-height': theme.spacing(8),
          }),
          ...(ownerState.size === 'lg' && {
            width: theme.spacing(24),
            height: theme.spacing(24),
            '--fortress-icon-width': theme.spacing(15),
            '--fortress-icon-height': theme.spacing(15),
          }),
        }),
      },
    },
    JoyStepper: {
      defaultProps: {
        orientation: 'horizontal',
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }) => {
          return {
            ...theme.typography.h5,
            '--Step-connectorThickness': '2px !important',
            '--Step-connectorInset': '-1px !important',
            '--StepIndicator-size': '40px !important',
            color: 'var(--fortress-palette-primary-200)',
            [theme.breakpoints.down('sm')]: {
              '--StepIndicator-size': '24px !important',
              ...theme.typography.h5,
            },
            '.Mui-completed, .Mui-active': {
              color: 'var(--fortress-palette-primary-500)',
              '& .MuiStepIndicator-root': {
                color: `var(--Neutral-Warm-Linen-500, #F6F3E7)`,
                backgroundColor: 'var(--fortress-palette-primary-500)',
                border: 'none',
              },
            },
            '.Mui-disabled': {
              color: `var(--fortress-palette-brand-mono-500, #9E9E9E)`,
              '& .MuiStepIndicator-root': {
                backgroundColor: 'var(--fortress-palette-brand-mono-500, #9E9E9E)',
                color: `var(--Neutral-Warm-Linen-500, #F6F3E7)`,
                border: 'none',
              },
            },
          };
        },
      },
    },
    JoyStep: {
      defaultProps: {
        color: 'primary',
        orientation: 'vertical',
      },
      styleOverrides: {
        root: ({ theme }) => {
          return {
            ...theme.typography.h5,
            textAlign: 'center',
            [theme.breakpoints.down('sm')]: {
              ...theme.typography.h5,
            },
            '::after': {
              background: 'var(--fortress-palette-primary-200)',
            },
            '&.Mui-completed::after': {
              background: 'var(--fortress-palette-primary-500 )',
            },
            '&.Mui-disabled::after': {
              background: 'var(--fortress-palette-brand-mono-200, #D2D2D2)',
            },
            '&:last-child::after': {
              display: 'none',
            },
            '&:has(.MuiStep-indicator:empty)::after': {
              top: 'calc(var(--StepIndicator-size) / 2 - var(--Step-connectorThickness) / 2) !important',
              '--Step-connectorInset': '-1px !important',
              '--StepIndicator-size': '40px !important',
              [theme.breakpoints.down('sm')]: {
                '--StepIndicator-size': '24px !important',
              },
            },
          };
        },
      },
    },
    JoyStepIndicator: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }) => {
          return {
            '--StepIndicator-size': '40px !important',
            '--fortress-icon-width': '40px',
            '--fortress-icon-height': '40px',
            ...theme.typography.h3,
            [theme.breakpoints.down('sm')]: {
              ...theme.typography.h5,
            },
            [theme.breakpoints.down('sm')]: {
              '--StepIndicator-size': '24px !important',
              '--fortress-icon-width': '24px',
              '--fortress-icon-height': '24px',
            },
            backgroundColor: `var(--Neutral-Warm-Linen-200, #FBF9F4)`,
            color: `var(--fortress-palette-primary-200, #C6A79B)`,
            border: `2px solid var(--fortress-palette-primary-200, #C6A79B)`,
          };
        },
      },
    },
    JoyTextarea: {
      defaultProps: {
        color: 'neutral',
        // 通过提供一个不可见的默认 placeholder，启用 :placeholder-shown 逻辑
        // 这样在不改动组件的前提下，也能基于是否有值控制样式
        placeholder: ' ',
      },
      styleOverrides: {
        endDecorator: ({ ownerState, theme }) => ({
          margin: 0,
          ...(!ownerState.error &&
            !ownerState.disabled && {
              color: 'var(--fortress-palette-neutral-200)',
              ...(ownerState.focused && {
                color: 'var(--fortress-palette-neutral-500)',
              }),
            }),
          ...(ownerState.disabled && {
            color: 'var(--fortress-palette-brand-mono-500)',
          }),
          ...(ownerState.error && {
            color: 'var(--fortress-palette-danger-200)',
            ...(ownerState.focused && {
              color: 'var(--fortress-palette-danger-500)',
            }),
          }),
        }),
        root: ({ ownerState, theme }) => ({
          ...theme.typography.body2,
          border: 'none',
          background: 'transparent',
          boxShadow: 'none',
          boxSizing: 'border-box',
          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          ...(!ownerState.error &&
            !ownerState.disabled && {
              // Outlined变体token
              '--Textarea-placeholderColor': 'var(--fortress-palette-neutral-200)',
              '--variant-outlinedColor': 'var(--fortress-palette-neutral-200)',
              '--variant-outlinedActiveColor': 'var(--fortress-palette-neutral-500)',
              '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
              '--Icon-color': 'var(--fortress-palette-neutral-200)',
              borderBottom: '1px solid var(--fortress-palette-brand-mono-300)',
              ':hover': {
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              },

              // 保留状态特殊样式
              ...(ownerState.focused && {
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              }),

              '&:has(textarea[placeholder]:not(:placeholder-shown))': {
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              },
            }),

          ...(ownerState.disabled && {
            '--variant-outlinedColor': 'var(--fortress-palette-brand-mono-500)',
            borderBottom: '1px solid var(--fortress-palette-brand-mono-500)',
            '--Icon-color': 'var(--fortress-palette-brand-mono-500)',
          }),

          ...(ownerState.error && {
            '--variant-outlinedColor': 'var(--fortress-palette-danger-200)',
            borderBottom: '1px solid var(--fortress-palette-danger-200)',
            '--Icon-color': 'var(--fortress-palette-danger-200)',
            ':hover': {
              '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
              '--Icon-color': 'var(--fortress-palette-danger-500)',
              borderBottom: '1px solid var(--fortress-palette-danger-500)',
            },
            ...(ownerState.focused && {
              '--Icon-color': 'var(--fortress-palette-danger-500)',
              '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
              borderBottom: '1px solid var(--fortress-palette-danger-500)',
            }),
            '&:has(textarea[placeholder]:not(:placeholder-shown))': {
              '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
              '--Icon-color': 'var(--fortress-palette-danger-500)',
              borderBottom: '1px solid var(--fortress-palette-danger-500)',
            },
          }),
        }),
      },
    },
    JoyInput: {
      defaultProps: {
        color: 'neutral',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...theme.typography.body1,
          border: 'none',
          background: 'transparent',
          boxShadow: 'none',
          boxSizing: 'border-box',
          padding: `${theme.spacing(3)} ${theme.spacing(4)} ${theme.spacing(4)}`,

          ...(!ownerState.error &&
            !ownerState.disabled && {
              '--variant-outlinedColor': 'var(--fortress-palette-neutral-200)',
              '--variant-outlinedActiveColor': 'var(--fortress-palette-neutral-500)',
              '--variant-outlinedDisabledColor': 'var(--fortress-palette-brand-mono-500)',
              '--Icon-color': 'var(--fortress-palette-neutral-200)',
              borderBottom: '1px solid var(--fortress-palette-brand-mono-300)',
              ':hover': {
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              },
              // 已有值时（常驻 hover 态）: 仅保留稳定可用的 placeholder 方案
              '&:has(input[placeholder]:not(:placeholder-shown))': {
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              },

              ...(ownerState.focused && {
                '--variant-outlinedColor': 'var(--fortress-palette-neutral-500)',
                '--Icon-color': 'var(--fortress-palette-neutral-500)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500)',
              }),
            }),
          ...(ownerState.disabled && {
            color: 'var(--fortress-palette-brand-mono-500)',
            borderBottom: '1px solid var(--fortress-palette-brand-mono-500)',
            '--Icon-color': 'var(--fortress-palette-brand-mono-500)',
          }),

          ...(ownerState.error && {
            '--variant-outlinedColor': 'var(--fortress-palette-danger-200)',
            '--variant-outlinedActiveColor': 'var(--fortress-palette-danger-500)',
            borderBottom: '1px solid var(--fortress-palette-danger-200)',
            '--Icon-color': 'var(--fortress-palette-danger-200)',
            ':hover': {
              '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
              '--Icon-color': 'var(--fortress-palette-danger-500)',
              borderBottom: '1px solid var(--fortress-palette-danger-500)',
            },
            // 错误态下，已有值同样保持 hover 视觉
            '&:has(input[placeholder]:not(:placeholder-shown)), &:has(input:not([placeholder])[value]:not([value=""]))':
              {
                '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
                '--Icon-color': 'var(--fortress-palette-danger-500)',
                borderBottom: '1px solid var(--fortress-palette-danger-500)',
              },

            ...(ownerState.focused && {
              '--variant-outlinedColor': 'var(--fortress-palette-danger-500)',
              '--Icon-color': 'var(--fortress-palette-danger-500)',
              borderBottom: '1px solid var(--fortress-palette-danger-500)',
            }),
          }),

          [theme.breakpoints.down('sm')]: {
            padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          },
        }),
      },
    },

    JoyFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.caption1,
          '--FormHelperText-margin': 0,
        }),
      },
    },
    JoyFormControl: {
      styleOverrides: {
        root: ({ theme }) => ({
          '--variant-plainDisabledColor': 'var(--fortress-palette-neutral-500)',
        }),
      },
    },
    JoyFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.body2,
        }),
      },
    },
    JoyAspectRatio: {
      styleOverrides: {
        content: ({ theme, ownerState }) => ({
          borderColor: 'transparent',
        }),
      },
    },
    JoyDrawer: {
      styleOverrides: {
        root: ({ theme }) => ({
          '--fortress-palette-background-backdrop': 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(0px)',
          '--Drawer-verticalSize': 'clamp(500px, 45%, 100%)',
          '--Drawer-horizontalSize': 'clamp(500px, 45%, 100%)',
        }),
        content: ({ theme }) => ({
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',

          [`.${modalCloseClasses.root}`]: {
            position: 'absolute',
            top: theme.spacing(6),
            right: theme.spacing(6),
            [theme.breakpoints.down('sm')]: {
              top: theme.spacing(4),
              right: theme.spacing(6),
            },
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '& svg': {
              fontSize: { xs: 'xl3', sm: 'xl4', lg: 'xl5' },
            },
          },
        }),
      },
    },

    JoyDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            '--Drawer-titleMargin': `${theme.spacing(6)} ${theme.spacing(6)}`,
          },
          [theme.breakpoints.up('sm')]: {
            '--Drawer-titleMargin': `${theme.spacing(4)} ${theme.spacing(6)}`,
          },
        }),
      },
    },
    JoyDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingBottom: theme.spacing(8),
        }),
      },
    },
    JoyCard: {
      defaultProps: {
        variant: 'plain',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '--Card-padding': `${theme.spacing(4)} ${theme.spacing(4)} ${theme.spacing(6)} ${theme.spacing(4)}`,
          '--Card-radius': 0,
        }),
      },
    },
    JoyModal: {
      styleOverrides: {
        root: ({ theme }) => ({
          '--Modal-radius': 0,
          '--fortress-palette-background-backdrop': 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(0px)',
          boxShadow: theme.shadow.lg,
        }),
      },
    },
    JoyModalClose: {
      defaultProps: {
        variant: 'plain',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          color: 'var(--fortress-palette-brand-mono-900)',
          padding: 0,
          '--IconButton-size': '24px',
          backgroundColor: 'transparent',
          '& svg': {
            width: '24px',
            height: '24px',
          },
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'var(--fortress-palette-brand-mono-900)',
          },
        }),
      },
    },
    JoyModalDialog: {
      defaultProps: {
        variant: 'soft',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '--ModalDialog-radius': 0,
          '--variant-softBg': 'var(--fortress-palette-brand-warmLinen-200)',
          '--variant-softColor': 'var(--fortress-palette-neutral-500)',
          [theme.breakpoints.down('sm')]: {
            '--Card-padding': `${theme.spacing(6)} ${theme.spacing(4)}`,

            [`.${modalCloseClasses.root}`]: {
              position: 'absolute',
              '--ModalClose-inset': theme.spacing(4),
              top: theme.spacing(2),
              right: theme.spacing(2),
              zIndex: 1,
              '& svg': {
                fontSize: { xs: 'xl3', sm: 'xl4', lg: 'xl5' },
              },
            },
          },
          [theme.breakpoints.up('sm')]: {
            '--Card-padding': `${theme.spacing(7)} ${theme.spacing(6)}`,
            [`.${modalCloseClasses.root}`]: {
              position: 'absolute',
              top: theme.spacing(4),
              right: theme.spacing(4),
              zIndex: 1,
              '& svg': {
                fontSize: { xs: 'xl3', sm: 'xl4', lg: 'xl5' },
              },
            },
          },
        }),
      },
    },
    JoySelect: {
      defaultProps: {
        color: 'primary',
        indicator: <ExpandMore />,
      },
      styleOverrides: {
        listbox: ({ theme }) => ({
          boxShadow: theme.shadow.lg,
        }),
        button: ({ ownerState }) => {
          // JoyUI 在单选模式下会自动应用 --Select-placeholderOpacity，但多选模式下不会
          // 确保多选模式下 placeholder 也应用 opacity
          if (ownerState.multiple) {
            return {
              ...(ownerState.value == null || (Array.isArray(ownerState.value) && ownerState.value.length === 0)
                ? {
                    opacity: 'var(--Select-placeholderOpacity)',
                  }
                : {}),
            };
          }
          return {};
        },
        root: ({ ownerState, theme }) => ({
          transition: 'all 0.2s ease-out',
          minHeight: 52,
          border: 'none',
          boxShadow: 'none',
          ...theme.typography.body2,
          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          paddingBottom: theme.spacing(4),
          borderBottom: `1px solid var(--fortress-palette-brand-mono-300)`,
          backgroundColor: 'transparent',
          color: 'var(--fortress-palette-neutral-500)',
          '&:hover': {
            svg: {
              color: 'var(--fortress-palette-neutral-600)',
            },
            borderBottom: `1px solid var(--fortress-palette-neutral-600)`,
          },

          '&:focus-within': {
            svg: {
              color: 'var(--fortress-palette-neutral-600)',
            },
            borderColor: 'var(--fortress-palette-neutral-600)',
          },
          '&.Mui-disabled': {
            svg: {
              color: 'var(--fortress-palette-brand-mono-500)',
            },
            borderColor: 'var(--fortress-palette-brand-mono-300)',
            color: 'var(--fortress-palette-brand-mono-500)',
          },
          [theme.breakpoints.down('sm')]: {
            minHeight: 44, // 小屏幕
            '--Select-minHeight': '44px',
          },
        }),
        indicator: ({ ownerState, theme }) => ({
          transition: 'transform 0.2s ease-out',
          ...(ownerState.indicator && {
            '&.Mui-expanded': {
              transform: 'rotate(180deg)',
            },
          }),
          '&.Mui-disabled': {
            color: 'var(--fortress-palette-brand-mono-500)',
          },
        }),
      },
    },
    JoyOption: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...theme.typography.body2,
          border: 'none',
          '--variant-borderWidth': '0',
          '--ListItem-minHeight': '43px',
          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          minHeight: '46px',

          [theme.breakpoints.down('sm')]: {
            minHeight: '43px',
          },
          '&:hover': {
            color: 'var(--fortress-palette-neutral-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
            '&.Mui-disabled': {
              backgroundColor: 'null',
            },
          },

          '&:focus': {
            color: 'var(--fortress-palette-neutral-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
          },

          '&.Mui-selected': {
            color: 'var(--fortress-palette-primary-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-300)',
          },

          '&.Mui-disabled': {
            pointerEvents: 'none',
            color: 'var(--fortress-palette-brand-mono-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          },
        }),
      },
    },
    JoyAutocompleteOption: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...theme.typography.body2,
          border: 'none',
          '--variant-borderWidth': '0',
          '--ListItem-minHeight': '43px',
          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          minHeight: '46px',
          color: 'var(--fortress-palette-neutral-500)',
          cursor: 'pointer',

          [theme.breakpoints.down('sm')]: {
            minHeight: '43px',
            padding: `${theme.spacing(2.5)} ${theme.spacing(4)}`,
          },
          // Hover状态
          '&:not(.Mui-selected, [aria-selected="true"]):hover': {
            color: 'var(--fortress-palette-neutral-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
          },

          // 选中状态
          '&[aria-selected="true"], &.Mui-selected': {
            color: 'var(--fortress-palette-primary-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-300)',
            fontWeight: theme.fontWeight.md,
          },

          // 禁用状态
          '&.Mui-disabled': {
            pointerEvents: 'none',
            color: 'var(--fortress-palette-brand-mono-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          },

          // 高亮文本样式（搜索匹配部分）
          '& .MuiAutocomplete-option-highlight': {
            fontWeight: theme.fontWeight.lg,
            backgroundColor: 'transparent',
          },
        }),
      },
    },
    JoyAutocomplete: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ _ownerState, theme }) => ({
          // 基础样式 - 与Select保持一致
          transition: 'all 0.2s ease-out',
          height: 52,
          border: 'none',
          boxShadow: 'none',
          ...theme.typography.body2,

          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          paddingBottom: theme.spacing(4),
          borderBottom: `1px solid var(--fortress-palette-brand-mono-300)`,
          backgroundColor: 'transparent',
          color: 'var(--fortress-palette-neutral-500)',

          '&:hover': {
            // svg: {
            //   color: 'var(--fortress-palette-neutral-600)',
            // },
            borderBottom: `1px solid var(--fortress-palette-neutral-600)`,
          },

          '&:focus-within': {
            // svg: {
            //   color: 'var(--fortress-palette-neutral-600)',
            // },
            borderColor: 'var(--fortress-palette-neutral-600)',
          },
          '&.Mui-disabled': {
            // svg: {
            //   color: 'var(--fortress-palette-brand-mono-500)',
            // },
            borderColor: 'var(--fortress-palette-brand-mono-300)',
            color: 'var(--fortress-palette-brand-mono-500)',
          },
          [theme.breakpoints.down('sm')]: {
            height: 44, // 小屏幕
            '--Select-minHeight': '44px',
          },
        }),
        listbox: ({ theme }) => ({
          border: 'none',
          boxShadow: theme.shadow.lg,
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
        }),
        option: ({ theme }) => ({
          ...theme.typography.body2,
          border: 'none',
          '--variant-borderWidth': '0',
          '--ListItem-minHeight': '43px',
          padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          minHeight: '46px',
          color: 'var(--fortress-palette-neutral-500)',
          cursor: 'pointer',

          [theme.breakpoints.down('sm')]: {
            minHeight: '43px',
            padding: `${theme.spacing(2.5)} ${theme.spacing(4)}`,
          },
          // Hover状态
          '&:not(.Mui-selected, [aria-selected="true"]):hover': {
            color: 'var(--fortress-palette-neutral-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
          },

          // 选中状态
          '&[aria-selected="true"], &.Mui-selected': {
            color: 'var(--fortress-palette-primary-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-300)',
            fontWeight: theme.fontWeight.md,
          },

          // 禁用状态
          '&.Mui-disabled': {
            pointerEvents: 'none',
            color: 'var(--fortress-palette-brand-mono-500)',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          },

          // 高亮文本样式（搜索匹配部分）
          '& .MuiAutocomplete-option-highlight': {
            fontWeight: theme.fontWeight.lg,
            backgroundColor: 'transparent',
          },
        }),
      },
    },
    JoyButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '0',
          '& > [data-first-child]': {
            border: 'none',
          },
          '& > :not([data-first-child]):not([data-last-child]):not(:only-child)': {
            borderLeft: 'none',
            borderRight: 'none',
          },
        }),
      },
    },
  },
});
