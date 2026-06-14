import { keyframes } from '@emotion/react';
import { extendTheme } from './helpers/extendTheme';

import { dangerColros, neutralColors, palette, primaryColors, successColros, warningColros } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';
import breakpoints from './breakpoints';
import { buttonClasses } from '@mui/joy/Button';
import { svgIconClasses } from '@mui/joy/SvgIcon';

const spinnerRotate = keyframes({
  '100%': {
    transform: 'rotate(360deg)',
  },
});
const spinnerDash = keyframes({
  '0%': {
    strokeDasharray: '1, 200',
    strokeDashoffset: '0',
  },
  '50%': {
    strokeDasharray: '89, 200',
    strokeDashoffset: '-35px',
  },
  '1000%': {
    strokeDasharray: '89, 200',
    strokeDashoffset: '-124px',
  },
});

export const defaultTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        /**
         * 正常来说 ，这里不应该直接使用 charcoal 这种颜色特定名字的
         * 比如，在设计稿中 他的就需要第五位 MONO , 但是我发现在设计稿中他们会使用
         * brand/charcoal/10 来表示一个颜色 所以为了更好的开发体验，就和设计稿保持一致了
         */
        brand: {
          terracotta: {
            ...palette.terracotta,
          },
          wheat: {
            ...palette.wheat,
          },
          sage: {
            ...palette.sage,
          },
          chai: {
            ...palette.chai,
          },
          flour: {
            ...palette.flour,
          },
          charcoal: {
            ...palette.charcoal,
          },
          upsdellRed: {
            ...palette.upsdellRed,
          },
          harvestGold: {
            ...palette.harvestGold,
          },
          blueNCS: {
            ...palette.blueNCS,
          },
        },
        primary: {
          ...primaryColors,
          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                    solid                                   */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          // solidColor: "",
          // solidBg: 'var(--fortress-palette-primary-500)',
          // solidBorder: 'var(--fortress-palette-primary-500)',
          /* ---------------------------------- Hover --------------------------------- */
          // solidHoverColor: "",
          solidHoverBg: 'var(--fortress-palette-primary-400)',
          // solidHoverBorder: "",

          /* ---------------------------------- Active --------------------------------- */
          // solidActiveColor: "",
          solidActiveBg: 'var(--fortress-palette-primary-600)',
          // solidActiveBorder: "",

          /* ---------------------------------- Disabled --------------------------------- */
          // solidDisabledColor: '',
          // solidDisabledBorder: '',
          // solidDisabledBg: '',

          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                  outlined                                  */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          // outlinedColor: '',
          outlinedBorder: 'var(--fortress-palette-brand-terracotta-500)',
          // outlinedBg: "",

          /* ---------------------------------- Hover --------------------------------- */
          // 下面这里是默认的
          // outlinedHoverColor: 'var(--fortress-palette-brand-terracotta-500)',
          // outlinedHoverBorder: 'var(--fortress-palette-brand-terracotta-500)',
          // outlinedHoverBg: 'var(--fortress-palette-brand-terracotta-100)',

          // outlinedHoverColor: 'var(--fortress-palette-brand-terracotta-600)',
          // outlinedHoverBorder: 'var(--fortress-palette-brand-terracotta-600)',
          // outlinedHoverBg: 'var(--fortress-palette-brand-terracotta-10)',
          /* ---------------------------------- Active --------------------------------- */
          // outlinedActiveColor: '',
          // outlinedActiveBorder: '',
          // outlinedActiveBg: 'var(--fortress-palette-brand-terracotta-200)',
          // outlinedActiveColor: 'var(--fortress-palette-brand-terracotta-600)',
          // outlinedActiveBorder: 'var(--fortress-palette-brand-terracotta-600)',
          // outlinedActiveBg: 'var(--fortress-palette-brand-terracotta-200)',

          /* ---------------------------------- Disabled --------------------------------- */
          // outlinedDisabledColor: 'var(--fortress-palette-brand-terracotta-100)',
          // outlinedDisabledBorder: 'var(--fortress-palette-brand-terracotta-100)',
          // outlinedDisabledBg: '',
          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                    plain                                   */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          // plainColor: '',
          // plainBg: ,
          // plainBorder: "",

          /* ---------------------------------- Hover --------------------------------- */
          // plainHoverColor: "",
          // plainHoverBorder: '',
          // 这个会影响到 selected 里选中的样式
          // plainHoverBg: 'var(--fortress-palette-primary-100)',
          plainHoverBg: '--fortress-palette-brand-terracotta-10',

          /* ---------------------------------- Active --------------------------------- */
          // plainActiveColor: 'var(--fortress-palette-primary-600)',
          // plainActiveBorder: '',
          // plainActiveBg: 'var(--fortress-palette-primary-300)',
          /* ---------------------------------- Disabled --------------------------------- */
          plainDisabledColor: 'var(--fortress-palette-text-secondary)',
          plainDisabledBorder: 'var(--fortress-palette-text-secondary)',
          plainDisabledBg: '',
        },
        // 这里其实对应了 设计稿中的 outlined 的颜色
        neutral: {
          ...neutralColors,
          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                    solid                                   */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          // solidColor: '',
          solidBg: 'var(--fortress-palette-brand-wheat-500)',
          solidBorder: 'var(--fortress-palette-brand-wheat-500)',
          /* ---------------------------------- Hover --------------------------------- */
          // solidHoverColor: "",
          // solidHoverBg: 'var(--fortress-palette-brand-wheat-400)',
          // solidHoverBorder: "",

          /* ---------------------------------- Active --------------------------------- */
          // solidActiveColor: "",
          // solidActiveBg: 'var(--fortress-palette-brand-wheat-600)',
          // solidActiveBorder: "",

          /* ---------------------------------- Disabled --------------------------------- */
          // solidDisabledColor: '',
          // solidDisabledBorder: '',
          // solidDisabledBg: '',

          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                  outlined                                  */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          outlinedColor: 'var(--fortress-palette-brand-wheat-500)',
          outlinedBorder: 'var(--fortress-palette-brand-wheat-500)',
          // outlinedBg: "",
          /* ---------------------------------- Hover --------------------------------- */
          outlinedHoverColor: 'var(--fortress-palette-brand-wheat-600)',
          outlinedHoverBorder: 'var(--fortress-palette-brand-wheat-600)',
          outlinedHoverBg: 'var(--fortress-palette-brand-wheat-10)',
          /* ---------------------------------- Active --------------------------------- */
          // outlinedActiveColor: 'var(--fortress-palette-brand-wheat-600)',
          // outlinedActiveBorder: 'var(--fortress-palette-brand-wheat-600)',
          // outlinedActiveBg: 'var(--fortress-palette-brand-wheat-200)',

          /* ---------------------------------- Disabled --------------------------------- */
          // outlinedDisabledColor: 'var(--fortress-palette-brand-wheat-100)',
          // outlinedDisabledBorder: 'var(--fortress-palette-brand-wheat-100)',
          // outlinedDisabledBg: '',
          /* -------------------------------------------------------------------------- */
          /*                                                                            */
          /*                                                                            */
          /*                                    plain                                   */
          /*                                                                            */
          /*                                                                            */
          /* -------------------------------------------------------------------------- */
          plainColor: 'var(--fortress-palette-neutral-500)',
          // plainBg: "",
          // plainBorder: "",
          /* ---------------------------------- Hover --------------------------------- */
          plainHoverColor: 'var(--fortress-palette-primary-400)',
          // plainHoverBorder: '',
          plainHoverBg: '',

          /* ---------------------------------- Active --------------------------------- */
          // plainActiveColor: '',
          plainActiveColor: 'var(--fortress-palette-brand-terracotta-700)',
          // plainActiveBorder: '',
          // plainActiveBg: 'var(--fortress-palette-brand-wheat-200)',
          plainActiveBg: '',
          /* ---------------------------------- Disabled --------------------------------- */
          plainDisabledColor: 'var(--fortress-palette-text-secondary)',
          plainDisabledBorder: 'var(--fortress-palette-text-secondary)',
          plainDisabledBg: '',
        },
        success: {
          ...successColros,
          plainColor: `var(--fortress-palette-success-300)`,
        },
        danger: {
          ...dangerColros,
          plainColor: `var(--fortress-palette-danger-300)`,
        },
        warning: {
          ...warningColros,
          plainColor: `var(--fortress-palette-warning-300)`,
        },
        common: {
          white: `var(--fortress-palette-brand-charcoal-0)`,
          // charcoal-800 #323433
          black: `var(--fortress-palette-brand-charcoal-800)`,
        },
        text: {
          // charcoal-800 #323433
          primary: `var(--fortress-palette-brand-charcoal-800)`,
          secondary: `var(--fortress-palette-brand-charcoal-400)`,
          // tertiary: '',
          // icon: '',
        },
        // divider: {},
        background: {
          body: 'var(--fortress-palette-common-white)',
          surface: 'var(--fortress-palette-common-white)',
          popup: 'var(--fortress-palette-common-white)',
          // backdrop: '',
          // level1: '',
          // level2: '',
          // level3: '',
          // tooltip: '',
        },
        // divider: `rgba(var(--fortress-palette-neutral-mainChannel, 115 115 140) / 0.28)`,
        divider: `rgba(${neutralColors.mainChannel} / 0.28)`,
        // focusVisible:''
      },
      //     --fortress-shadowChannel: 187 187 187;
      // shadowChannel: '50 52 51',
      // --fortress-shadowRing 0 0 #000
      // shadowRing: `0 0 ${palette.charcoal[800]}`,
    },
    // dark: {},
  },
  focus: {
    default: {
      outlineOffset: '2px',
      outlineColor: 'var(--fortress-palette-brand-blueNCS-200)',
      outlineBorder: '2px',
    },
  },
  fontFamily,
  fontSize,
  fontWeight,
  // TODO 确定一下怎么这里导致怎么封装才能更好的使用   ...theme.typography.caption2,
  typography,
  lineHeight,
  radius: {
    md: '0',
    lg: '0',
    sm: '0',
    xl: '0',
    xs: '0',
  },
  variants: {
    /* -------------------------------------------------------------------------- */
    /*                                    solid                                   */
    /* -------------------------------------------------------------------------- */
    solid: {
      // context: {},
      primary: {
        '&:focus': {},
      },
    },
    solidActive: {
      primary: {
        '&:hover': {
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.4)',
        },
      },
    },
    // solidDisabled: {},
    // solidHover: {},
    /* -------------------------------------------------------------------------- */
    /*                                  outlined                                  */
    /* -------------------------------------------------------------------------- */
    // outlined: {},
    // outlinedActive: {},
    // outlinedDisabled: {},
    // outlinedHover: {},
    /* -------------------------------------------------------------------------- */
    /*                                    plain                                   */
    /* -------------------------------------------------------------------------- */
    plain: {},
    // plainActive: {},
    // plainDisabled: {},
    // plainHover: {},
  },
  breakpoints,
  colorInversion: {},
  shadow: {
    /* offset-x | offset-y | blur-radius | spread-radius | color */
    xs: '0 1px 4px 0 rgba(34, 34 , 34, 0.15)',
    sm: '0 2px 12px -2px rgba(34, 34 , 34, 0.25)',
    md: '0 1px 12px -2px rgba(34, 34 , 34, 0.50)',
  },

  zIndex: {
    /**
      --fortress-zIndex-badge: 1;
      --fortress-zIndex-table: 10;
      --fortress-zIndex-popup: 1000;
      --fortress-zIndex-modal: 1300;
      --fortress-zIndex-tooltip: 1500;
     */
  },
  spacing: (num: any) => num * 8,
  cssVarPrefix: 'fortress',
  components: {
    // https://mui.com/joy-ui/customization/themed-components/
    // https://mui.com/joy-ui/customization/themed-components/

    MuiUseMediaQuery: {
      defaultProps: {},
    },

    JoyButton: {
      defaultProps: {
        variant: 'solid',
        size: 'md',
      },
      styleOverrides: {
        // TODO loading 的设计
        root: ({ ownerState, theme }) => ({
          fontWeight: theme.fontWeight.md,
          // 3rem --> 48px
          // var(--Button-minHeight, 2.5rem) 40px
          ...(ownerState.size === 'md' && {
            '--Button-minHeight': '3rem', //48px
            fontSize: theme.fontSize.md,
          }),
          ...(!ownerState.loading &&
            ownerState.disabled && {
              [`&.${buttonClasses.disabled}`]: {
                borderColor: theme.vars.palette.text.secondary,
                color: theme.vars.palette.text.secondary,
                ...(ownerState.variant !== 'plain' && {
                  background: theme.palette.brand.charcoal[200],
                }),

                [`.${svgIconClasses.root}`]: {
                  color: theme.vars.palette.text.secondary,
                },
              },
            }),
          // https://stackoverflow.com/questions/25654413/add-css-cursor-property-when-using-pointer-events-none
          // ...(ownerState.disabled && {
          //   cursor: 'not-allowed',
          // }),
          ...(ownerState.variant === 'primary' && {}),
          ...(ownerState.variant === 'outlined' && {
            backgroundColor: theme.palette.common.white,
          }),
          ...(ownerState.variant === 'tertiary' && {}),
        }),
      },
    },
    JoyTypography: {
      defaultProps: {
        level: 'body2',
      },
      styleOverrides: {
        /**
         * 移动端优先 ，现在设计手机端的再设计别的
         * @param param0
         * @returns
         */
        root: ({ ownerState, theme }) => ({
          /**
           * header
           */
          ...(ownerState.level === 'h1' && {
            // 28px
            '--Typography-fontSize': theme.fontSize.xl4,
            [theme.breakpoints.up('sm')]: {
              // 41px
              '--Typography-fontSize': theme.fontSize.xl6,
            },
          }),
          ...(ownerState.level === 'h2' && {
            // 24px
            '--Typography-fontSize': theme.fontSize.xl3,
            [theme.breakpoints.up('sm')]: {
              // 32px
              '--Typography-fontSize': theme.fontSize.xl5,
              // fontWeight: 'bold',
            },
          }),
          ...(ownerState.level === 'h3' && {
            '--Typography-fontSize': theme.fontSize.lg, //18px
            [theme.breakpoints.up('sm')]: {
              '--Typography-fontSize': theme.fontSize.xl4, //28px
            },
          }),
          ...(ownerState.level === 'h4' && {
            // 12px
            '--Typography-fontSize': theme.fontSize.xs,
            [theme.breakpoints.up('sm')]: {
              // 14px
              '--Typography-fontSize': theme.fontSize.sm,
            },
          }),
          /**
           * subHeader (subTitle)
           */
          ...(ownerState.level === 'subh1' && {
            // 18px
            '--Typography-fontSize': theme.fontSize.lg,
            fontWeight: '600',
            [theme.breakpoints.up('sm')]: {
              // 18px
              '--Typography-fontSize': theme.fontSize.lg,
            },
          }),
          ...(ownerState.level === 'subh2' && {
            // 16px
            '--Typography-fontSize': theme.fontSize.md,
            fontWeight: '600',
            [theme.breakpoints.up('sm')]: {
              // 16px
              '--Typography-fontSize': theme.fontSize.md,
            },
          }),
          ...(ownerState.level === 'subh3' && {
            // 14px
            '--Typography-fontSize': theme.fontSize.sm,
            fontWeight: '600',
            [theme.breakpoints.up('sm')]: {
              // 14px
              '--Typography-fontSize': theme.fontSize.sm,
            },
          }),
          /**
           * body
           */
          ...(ownerState.level === 'body1' && {
            // 16px
            '--Typography-fontSize': theme.fontSize.md,
            [theme.breakpoints.up('sm')]: {
              // 18px
              '--Typography-fontSize': theme.fontSize.lg,
            },
          }),
          ...(ownerState.level === 'body2' && {
            // 14px
            '--Typography-fontSize': theme.fontSize.sm,
            [theme.breakpoints.up('sm')]: {
              // 16px
              '--Typography-fontSize': theme.fontSize.md,
            },
          }),
          /**
           * caption
           */
          // TODO 这里后面要讨论一下 电脑和手机端的区别
          ...(ownerState.level === 'caption1' && {
            // 14px
            '--Typography-fontSize': theme.fontSize.sm,
            // // 12px
            // '--Typography-fontSize': theme.fontSize.xs2,
            // [theme.breakpoints.up('sm')]: {
            //   // 14px
            //   '--Typography-fontSize': theme.fontSize.xs,
            // },
          }),
        }),
      },
    },
    JoyIconButton: {
      defaultProps: {
        variant: 'primary',
        size: 'lg',
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.size === 'xs' && {
            // '--Icon-fontSize': theme.fontSize.sm,
            '--Icon-fontSize': theme.fontSize.md,
            'min-width': 'var(--IconButton-size, 2rem)',
            'min-height': 'var(--IconButton-size, 2rem)',
          }),
          ...(ownerState.variant === 'primary' && {
            '--Icon-color': theme.palette.common.black,
            // '&:hover': {
            // 'background-color': 'transparent',
            // color: theme.palette.primary[500],
            // },
          }),
          ...(ownerState.disabled && {
            ':disabled': {
              // '--Icon-color': theme.palette.brand.charcoal[400],
              color: theme.palette.brand.charcoal[400],
              borderColor: theme.palette.brand.charcoal[400],
              pointerEvents: 'auto',
              cursor: 'not-allowed',
            },
            ':hover': {},
          }),
        }),
      },
    },
    JoyBadge: {
      defaultProps: {
        size: 'sm',
      },
      styleOverrides: {
        badge: ({ theme, ownerState }) => {
          return {
            ...(ownerState.size === 'sm' && {
              maxHeight: '1rem',
            }),
          };
        },
        root: ({ ownerState, theme }) => ({
          ...(ownerState.size === 'sm' && {
            fontWeight: theme.fontWeight.sm,
          }),
        }),
      },
    },
    JoySwitch: {
      defaultProps: {
        variant: 'solid',
        color: 'primary',
        size: 'md',
      },

      styleOverrides: {
        action: {},
        input: {},
        thumb: ({ ownerState, theme }) => ({}),
        track: ({ ownerState, theme }) => ({}),
        root: ({ ownerState, theme }) => ({
          '--Switch-trackRadius': '15px',
          ...(ownerState.color === 'primary' && {
            ...(!ownerState.checked && {
              '--Switch-thumbShadow': theme.palette.common.white,
              '--Switch-trackBackground': theme.palette.primary[300],
            }),
          }),
          // '--Switch-trackBackground': theme.palette.brand.terracotta[300],
          '&.Joy-disabled': {
            // '--Switch-track-color': theme.palette.text.secondary,
            // 条条的颜色
            '--Switch-trackBackground': theme.palette.brand.charcoal[200],
            // 圆圈的颜色
            '--Switch-thumbBackground': theme.palette.brand.charcoal[300],
            // '--Switch-thumb-color': theme.palette.brand.charcoal[200],

            // TODO cursor
            // cursor: 'not-allowed',
          },
        }),
      },
    },
    JoySvgIcon: {
      defaultProps: {
        fontSize: 'lg',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'primary' && {
            color: theme.palette.primary.mainChannel,
          }),
          ...(ownerState.color === 'neutral' && {
            color: theme.palette.neutral.mainChannel,
          }),
        }),
      },
    },
    JoySheet: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === 'plain' && {
            ...(ownerState.color === 'primary' && {
              color: theme.palette.primary.mainChannel,
            }),
            ...(ownerState.color === 'neutral' && {
              color: theme.palette.neutral.mainChannel,
            }),
          }),
        }),
      },
    },
    JoyCircularProgress: {
      defaultProps: {
        variant: 'plain',
        size: 'sm',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === 'plain' &&
            {
              // ...(ownerState.color === 'primary' && {
              //   '--CircularProgress-progressColor':
              //     theme.palette.primary.mainChannel,
              // }),
              // ...(ownerState.color === 'neutral' && {
              //   '--CircularProgress-progressColor':
              //     theme.palette.neutral.mainChannel,
              // }),
            }),
        }),
        track: {},
        svg: {
          // TODO  到时再好好思考吧
          // animation: `${spinnerDash} 1.5s ease-in-out infinite`,
          // animation: `${spinnerRotate} 2s linear infinite`,
        },
        progress: {
          // animation: `${spinnerDash} 1.5s ease-in-out infinite`,
        },
      },
    },
    JoySelect: {
      defaultProps: {
        size: 'sm',
      },
      styleOverrides: {
        button: ({ theme, ownerState }) => ({
          //  选中框中的居中
          justifyContent: 'center',
          ...(ownerState.variant === 'borderplain' && {
            '-webkit-justify-content': 'flex-start',
            justifyContent: 'flex-start',
            color: theme.palette.brand.charcoal[800],
          }),
        }),
        endDecorator: {},
        // startDecorator: '',
        // indicator: ({ ownerState, theme }) => ({}),
        listbox: ({ theme, ownerState }) => ({
          '--List-padding': '0',
          justifyContent: 'center',
          boxShadow: 'none',
          ...(ownerState.variant === 'plain' && {
            border: `1px solid ${theme.palette.brand.charcoal[300]}`,
          }),
          ...(ownerState.variant === 'borderplain' && {
            maxHeight: 500,
            overflow: 'auto',
            boxShadow: theme.shadow.md,
            border: `1px solid ${theme.palette.brand.charcoal[300]}`,
            lineHeight: 2,
          }),
        }),
        root: ({ ownerState, theme }) => ({
          '--Select-focusedHighlight': theme.focus.default.outlineColor,
          ...(ownerState.variant === 'plain' && {}),
          ...(ownerState.variant === 'borderplain' && {
            border: 0,
            borderBottom: `1px solid ${theme.palette.brand.charcoal[300]}`,
            justifyContent: 'space-between',
          }),
        }),
      },
    },

    JoyOption: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          justifyContent: 'center',
          ...(ownerState.variant === 'plain' && {
            ':not(.Mui-selected, [aria-selected="true"]):hover': {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary[500],
            },
            '&.MuiOption-highlighted': {
              color: theme.palette.primary[500],
              backgroundColor: 'transparent',
              // ':hover': {
              //   color: theme.palette.common.white,
              //   backgroundColor: theme.palette.primary[600],
              //   borderColor: theme.palette.primary[500],
              // },
            },
            '&.Mui-disabled': {
              borderColor: 'transparent',
            },
          }),
          ...(ownerState.variant === 'borderplain' && {
            justifyContent: 'flex-start',
            color: theme.palette.brand.charcoal[800],
            '&:hover': {
              color: theme.palette.primary[700], //-fortress-palette-brand-terracotta-10
              backgroundColor: theme.palette.primary[50],
            },
            '&.MuiOption-highlighted': {
              color: theme.palette.primary[500],
            },
          }),
        }),
      },
    },
    JoyMenuList: {
      defaultProps: {},
    },
    JoyMenu: {
      defaultProps: {
        size: 'sm',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
        }),
      },
    },
    JoyMenuItem: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          justifyContent: 'center',
          ...(ownerState.variant === 'outlined' && {
            ':hover': {
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary[500],
              borderColor: theme.palette.primary[500],
            },
          }),
        }),
      },
    },

    JoyLink: {
      defaultProps: {
        level: 'body2',
      },
    },
    JoyCheckbox: {
      defaultProps: {
        variant: 'outlined',
        color: 'neutral',
      },
      styleOverrides: {
        checkbox: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'neutral' && {
            ...(ownerState.checked && {
              backgroundColor: theme.palette.primary[500],
              borderColor: theme.palette.primary[500],
              color: theme.palette.common.white,
              ':hover': {
                color: theme.palette.common.white,
                backgroundColor: theme.palette.primary[600],
                borderColor: theme.palette.primary[600],
              },
            }),
          }),
        }),
        root: ({ ownerState, theme }) => ({
          ...(ownerState.size === 'sm' && {
            'font-size': theme.fontSize.sm,
          }),
        }),
      },
    },
    JoyDivider: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--Divider-lineColor': theme.palette.brand.wheat[500],
        }),
      },
    },
    MuiSvgIcon: {
      defaultProps: {},
      styleOverrides: {
        // root: ({ ownerState, theme }) => ({}),
      },
    },
    JoyContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            [theme.breakpoints.up('xs')]: {
              '&.MuiContainer-maxWidthXs': {
                maxWidth: '390px',
              },
            },
            [theme.breakpoints.up('sm')]: {
              '&.MuiContainer-maxWidthSm': {
                maxWidth: '640px',
              },
            },
            [theme.breakpoints.up('md')]: {
              '&.MuiContainer-maxWidthMd': {
                maxWidth: '1200px',
              },
            },
            [theme.breakpoints.up('lg')]: {
              '&.MuiContainer-maxWidthLg': {
                maxWidth: '1440px',
              },
            },
            [theme.breakpoints.up('xl')]: {
              '&.MuiContainer-maxWidthXl': {
                maxWidth: '1728px',
              },
            },
            [theme.breakpoints.up(1776)]: {
              '&.MuiContainer-maxWidthXl': {
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
    JoyInput: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            ...(ownerState.variant === 'borderplain' && {
              '--Input-borderColor': 'var(--fortress-palette-brand-charcoal-300)',
              border: 0,
              borderBottom: '1px solid var(--Input-borderColor)',
              color: 'var(--fortress-palette-brand-charcoal-800)',
              '&::before': {
                boxShadow: 'none',
              },
            }),
            // '--Input-placeholderColor': 'var(--fortress-palette-brand-charcoal-500)',
            // '--Input-placeholderOpacity': 1,
          };
        },
      },
    },
    JoyFormLabel: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => ({}),
      },
    },
    JoyListSubheader: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            letterSpacing: 0,
          };
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          // ...(ownerState.variant === 'borderless' && {
          //   boxShadow: 'none',
          // }),
          boxShadow: 'none',
        }),
      },
    },
  },
});
