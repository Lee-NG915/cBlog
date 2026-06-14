/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { extendTheme } from '../helpers/extendTheme';
import { dangerColors, neutralColors, palette, primaryColors, successColors, warningColors } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';
import breakpoints from '../breakpoints';
import { buttonClasses } from '@mui/joy/Button';
import { svgIconClasses } from '@mui/joy/SvgIcon';
import { ExpandMore, Add } from '../../Icons';
import { accordionSummaryClasses, selectClasses } from '@mui/joy';
import { paletteV2 } from '../v2/colors';
import { circularProgressClasses } from '@mui/joy/CircularProgress';
import { drawerClasses } from '@mui/joy/Drawer';
import { modalCloseClasses } from '@mui/joy/ModalClose';

export const defaultTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        /**
         * 正常来说 ，这里不应该直接使用 charcoal 这种颜色特定名字的
         * 比如，在设计稿中 他的就需要第五位 MONO , 但是我发现在设计稿中他们会使用
         * brand/charcoal/10 来表示一个颜色 所以为了更好的开发体验，就和设计稿保持一致了
         */
        // wheat: {},
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
          maroonVelvet: {
            ...paletteV2.maroonVelvet,
          },
          leafGreen: {
            ...paletteV2.leafGreen,
          },
          burntOrange: {
            ...paletteV2.burntOrange,
          },
          freshWaterBlue: {
            ...paletteV2.freshWaterBlue,
          },
          warmLinen: {
            ...paletteV2.warmLinen,
          },
          mono: {
            ...paletteV2.mono,
            bgColor: paletteV2.mono[900],
            borderColor: paletteV2.mono[900],
            color: paletteV2.white,
            divider: paletteV2.mono[300],
            hoverBg: paletteV2.mono[100],
            disabledBg: paletteV2.mono[100],

            /* -------------------------------solid------------------------------------------- */
            solidColor: paletteV2.white,
            solidBg: paletteV2.mono[900],
            solidBorder: paletteV2.mono[900],
            solidHoverColor: paletteV2.white,
            solidHoverBg: paletteV2.mono[900],
            solidHoverBorder: paletteV2.mono[900],
            solidActiveColor: paletteV2.white,
            solidActiveBg: paletteV2.mono[800],
            solidActiveBorder: paletteV2.mono[800],
            solidDisabledColor: paletteV2.mono[500],
            solidDisabledBg: paletteV2.mono[200],
            solidDisabledBorder: paletteV2.mono[200],

            /* -------------------------------outlined------------------------------------------- */
            outlinedColor: paletteV2.mono[900],
            outlinedBorder: paletteV2.mono[900],
            outlinedBg: 'transparent',
            outlinedHoverColor: paletteV2.mono[200],
            outlinedHoverBorder: paletteV2.mono[300],
            outlinedHoverBg: paletteV2.mono[200],
            outlinedActiveColor: paletteV2.mono[800],
            outlinedActiveBorder: paletteV2.mono[800],
            outlinedActiveBg: paletteV2.mono[800],
            outlinedDisabledColor: paletteV2.mono[500],
            outlinedDisabledBorder: paletteV2.mono[500],
            outlinedDisabledBg: 'transparent',

            /* -------------------------------plain------------------------------------------- */
            plainColor: paletteV2.mono[900],
            plainBg: 'transparent',
            plainBorder: 'transparent',
            plainHoverColor: paletteV2.mono[900],
            plainHoverBorder: 'transparent',
            plainHoverBg: 'transparent',
            plainActiveColor: paletteV2.mono[800],
            plainActiveBorder: 'transparent',
            plainActiveBg: 'transparent',
            plainDisabledColor: paletteV2.mono[500],
            plainDisabledBorder: 'transparent',
            plainDisabledBg: 'transparent',
          },
          rosewood: {
            ...paletteV2.rosewood,
          },
          white: paletteV2.white,
          black: paletteV2.black,
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
          ...successColors,
          plainColor: `var(--fortress-palette-success-300)`,
        },
        danger: {
          ...dangerColors,
          plainColor: `var(--fortress-palette-danger-300)`,
        },
        warning: {
          ...warningColors,
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
          backdrop: 'rgba(50, 52, 51, 0.50)',
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
  spacing: (num: number) => num * 8,
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
          ...(!ownerState['data-image-button-module'] &&
            !ownerState.loading &&
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
          ...(!ownerState['data-image-button-module'] &&
            ownerState.variant === 'secondary' && {
              transition: 'background-color 0.2s',
              ':hover': {
                bgcolor: theme.palette.primary[500],
                color: theme.palette.common.white,
                [`.${svgIconClasses.root}`]: {
                  color: theme.vars.palette.common.white,
                },
              },
            }),
          // ...(!ownerState['data-image-button-module'] &&
          // ownerState.variant === 'outlined' &&
          // {
          // '--variant-outlinedBg': 'transparent',
          // '--variant-outlinedBorder': 'transparent',
          // '--variant-outlinedHoverBg': 'transparent',
          // '--variant-outlinedHoverBorder': 'transparent',
          // '--variant-outlinedActiveBg': 'transparent',
          // '--variant-outlinedActiveBorder': 'transparent',
          // '--variant-outlinedDisabledColor': 'var(--fortress-palette-text-secondary)',
          // '--variant-outlinedDisabledBorder': 'var(--fortress-palette-text-secondary)',
          // '--variant-outlinedDisabledBg': 'transparent',
          // }),
          ...(!ownerState['data-image-button-module'] &&
            ownerState.variant === 'tertiary' && {
              ':hover': {
                [`.${svgIconClasses.root}`]: {
                  color: theme.palette.primary[400],
                },
              },
              ':active': {
                [`.${svgIconClasses.root}`]: {
                  color: theme.palette.brand.terracotta[700],
                },
              },
            }),
          ...(!ownerState['data-image-button-module'] &&
            ownerState.variant === 'plain' && {
              '--variant-plainColor': 'var(--fortress-palette-neutral-500)',
              ':hover': {
                color: 'var(--fortress-palette-primary-400)',
                '--variant-plainHoverBg': 'transparent',
              },
              ':active': {
                color: 'var(--fortress-palette-brand-terracotta-700)',
                '--variant-plainActiveBg': 'transparent',
              },
              ...(!ownerState.loading &&
                ownerState.disabled && {
                  '--variant-plainDisabledColor': 'var(--fortress-palette-text-secondary)',
                  '--variant-plainDisabledBorder': 'var(--fortress-palette-text-secondary)',
                  '--variant-plainDisabledBg': 'transparent',
                }),
            }),

          ...(Boolean(ownerState['data-image-button-module']) && {
            borderRadius: '8px',
            ...(ownerState.variant === 'solid' && {
              border: 'none',
              '--variant-solidColor': '#323433',
              '--variant-solidBg': '#F9F7F3',
              '--variant-solidBorder': 'transparent',
              '--variant-solidHoverBg': '#E6DFCF',
              '--variant-solidFocusBg': '#E6DFCF',
              '--variant-solidActiveBg': '#CDBF9E',
              '--variant-solidDisabledColor': '#929292',
              '--variant-solidDisabledBg': '#E9E9E9',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': '#323433',
              },
            }),

            ...(ownerState.variant === 'outlined' && {
              '--variant-outlinedColor': '#F9F7F3',
              '--variant-outlinedBorder': '#C1AF86',
              '--variant-outlinedBg': 'transparent',
              '--variant-outlinedHoverBg': 'rgba(230, 223, 207, 0.20);',
              '--variant-outlinedHoverColor': '#C1AF86',
              '--variant-outlinedHoverBorder': '#E6DFCF',
              '--variant-outlinedActiveBg': 'rgba(230, 223, 207, 0.50)',
              '--variant-outlinedActiveBorder': '#E6DFCF',
              '--variant-outlinedActiveColor': '#C1AF86',
              '--variant-outlinedDisabledColor': '#929292',
              '--variant-outlinedDisabledBorder': '#E9E9E9',
              '--variant-outlinedDisabledBg': 'transparent',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': '#C1AF86',
              },
            }),

            ...(ownerState.variant === 'plain' && {
              '--variant-plainColor': '#C1AF86',
              '--variant-plainBorder': 'transparent',
              '--variant-plainHoverBg': 'rgba(230, 223, 207, 0.20)',
              '--variant-plainHoverColor': '#C1AF86',
              '--variant-plainHoverBorder': 'transparent',
              '--variant-plainActiveBg': 'rgba(230, 223, 207, 0.50)',
              '--variant-plainActiveBorder': 'transparent',
              '--variant-plainActiveColor': '#C1AF86',
              '--variant-plainDisabledColor': '#929292',
              '--variant-plainDisabledBorder': 'transparent',
              '--variant-plainDisabledBg': 'transparent',
              [`& .${circularProgressClasses.root}`]: {
                '--CircularProgress-progressColor': '#C1AF86',
              },
            }),

            ...(ownerState.loading && {
              '&.Mui-disabled': {
                backgroundColor: `var(--variant-${ownerState.variant}Bg)`,
                borderColor: `var(--variant-${ownerState.variant}Border)`,
              },
            }),
          }),
          ...(ownerState.variant === 'plain' && {
            '--variant-plainColor': 'var(--fortress-palette-neutral-500)',
            ':hover': {
              color: 'var(--fortress-palette-primary-400)',
              '--variant-plainHoverBg': 'transparent',
            },
            ':active': {
              color: 'var(--fortress-palette-brand-terracotta-700)',
              '--variant-plainActiveBg': 'transparent',
            },
            ...(!ownerState.loading &&
              ownerState.disabled && {
                '--variant-plainDisabledColor': 'var(--fortress-palette-text-secondary)',
                '--variant-plainDisabledBorder': 'var(--fortress-palette-text-secondary)',
                '--variant-plainDisabledBg': 'transparent',
              }),
          }),
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
            '--Typography-fontSize': theme.fontSize.lg,
            [theme.breakpoints.up('sm')]: {
              '--Typography-fontSize': theme.fontSize.xl4,
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
        thumb: ({ ownerState, theme }) => ({
          backgroundColor: theme.palette.brand.flour[10],
          border: 'none',
          borderRadius: '16px',
          boxShadow: 'none',
          transition: 'left 0.3s ease, background-color 0.3s',
        }),
        track: ({ ownerState, theme }) => ({
          borderRadius: '16px',
          border: 'none',
        }),
        root: ({ ownerState, theme }) => ({
          color: theme.palette.brand.charcoal[800],
          ...(ownerState.color === 'primary' && {
            '--Switch-trackBackground': !ownerState.checked ? theme.palette.primary[300] : theme.palette.primary[500],
            '&:hover': {
              '--Switch-trackBackground': !ownerState.checked ? theme.palette.primary[300] : theme.palette.primary[500],
              '--Switch-trackBorderColor': 'initial',
              '--Switch-thumbColor': theme.palette.brand.flour[10],
            },
          }),
          ...(ownerState.disabled && {
            '.MuiSwitch-track': {
              background: theme.palette.brand.charcoal[200],
            },
            '.MuiSwitch-thumb': {
              background: theme.palette.brand.charcoal[300],
              color: theme.palette.brand.charcoal[800],
            },
          }),
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
          fill: 'currentColor',
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
        indicator: <ExpandMore />,
        sx: {
          [`& .${selectClasses.indicator}`]: {
            transition: '0.2s',
            [`&.${selectClasses.expanded}`]: {
              transform: 'rotate(-180deg)',
            },
          },
        },
      },
      styleOverrides: {
        button: ({ theme, ownerState }) => ({
          //  选中框中的居中
          justifyContent: 'center',
          ...(ownerState.variant === 'borderplain' && {
            WebkitJustifyContent: 'flex-start',
            justifyContent: 'flex-start',
            color: theme.palette.brand.charcoal[800],
            ':disabled': {
              color: theme.palette.text.secondary,
            },
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
            boxShadow: theme.shadow.md,
            border: `1px solid ${theme.palette.brand.charcoal[300]}`,
            lineHeight: 2,
          }),
        }),
        root: ({ ownerState, theme }) => ({
          '--fortress-palette-background-surface': 'transparent',

          boxShadow: 'none',
          '--Select-focusedHighlight': theme.focus.default.outlineColor,
          borderColor: theme.palette.brand.charcoal[300],
          color: theme.palette.brand.wheat[500],
          bgcolor: 'transparent',
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
    JoyAutocomplete: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          boxShadow: 'none',
          ...(ownerState.variant === 'borderplain' && {
            border: 0,
            borderBottom: `1px solid ${theme.palette.brand.charcoal[300]}`,
            justifyContent: 'space-between',
          }),
        }),
        input: ({ theme, ownerState }) => ({
          ...(ownerState.variant === 'borderplain' && {
            WebkitJustifyContent: 'flex-start',
            justifyContent: 'flex-start',
            color: theme.palette.brand.charcoal[800],
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
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--variant-plainActiveBg': 'transparent',
          '--variant-plainHoverBg': 'transparent',
          ...(ownerState.color === 'neutral' && {
            '&:hover': {
              textDecorationColor: 'var(--fortress-palette-neutral-plainHoverColor)',
            },
          }),
        }),
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
            boxShadow: 'none',
            ...(ownerState.variant === 'borderplain' && {
              '--Input-borderColor': 'var(--fortress-palette-brand-charcoal-300)',
              border: 0,
              borderBottom: '1px solid var(--Input-borderColor)',
              color: 'var(--fortress-palette-brand-charcoal-800)',
              '&::before': {
                boxShadow: 'none',
              },
            }),
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
    JoyAccordionGroup: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {};
        },
      },
    },
    JoyAccordionSummary: {
      defaultProps: {
        // indicator: <Add />,
      },
      styleOverrides: {
        indicator: ({ ownerState, theme }) => {
          return {
            // transition: '0.2s',
            [`&.${accordionSummaryClasses.expanded}`]: {
              // TODO 变成一条现
              // transform: 'rotate(45deg)',
            },
          };
        },
      },
    },
    JoyDialogTitle: {
      defaultProps: {
        level: 'h1',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            // margin: 0,
            color: theme.palette.text.primary,
            [theme.breakpoints.down('sm')]: {
              '--Drawer-titleMargin': `${theme.spacing(2)} ${theme.spacing(3)}`,
            },
            [theme.breakpoints.up('sm')]: {
              '--Drawer-titleMargin': `${theme.spacing(3)} ${theme.spacing(2)}`,
            },
          };
        },
      },
    },
    JoyModalClose: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          // TODO 我想要 hover 的时候 旋转
          return {
            '--Icon-color': theme.palette.text.secondary,
            transition: '0.2s',
            transform: 'rotate(0deg)', // 默认状态下不旋转
            ':hover': {
              transition: '0.2s',
              transform: 'rotate(90deg)', // 鼠标悬停时旋转90度
            },
          };
        },
      },
    },
    JoyDrawer: {
      defaultProps: {},
      styleOverrides: {
        backdrop: ({ ownerState, theme }) => ({}),
        content: ({ ownerState, theme }) => ({
          '--Drawer-verticalSize': 'clamp(50%, 560px, 100%)',
          gap: 2, // sx={{ gap: 2, p: 0 }}
          padding: 0,
          ...(ownerState.anchor === 'bottom' && {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }),
          ...(ownerState.size === 'sm' && {
            '--Drawer-horizontalSize': 'min(408px,100%)',
          }),
          ...(ownerState.size === 'md' && {
            '--Drawer-horizontalSize': '616px',
          }),
          ...(ownerState.size === 'lg' && {
            '--Drawer-horizontalSize': 'clamp(50%, 736px, 100%)',
          }),

          ...(ownerState.anchor === 'bottom' && {
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }),

          [`.${modalCloseClasses.root}`]: {
            position: 'absolute',
            top: theme.spacing(3),
            right: theme.spacing(3),
            [theme.breakpoints.down('sm')]: {
              top: theme.spacing(2),
              right: theme.spacing(3),
            },
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '& svg': {
              fontSize: { xs: 'xl3', sm: 'xl4', lg: 'xl5' },
            },
          },
          // padding: theme.spacing(2),
          // paddingTop: 0,
        }),
        root: ({ ownerState, theme }) => ({
          // [`.${drawerClasses.content}`]: {
          //   [theme.breakpoints.down('md')]: {
          //     paddingLeft: theme.spacing(4),
          //     paddingRight: theme.spacing(4),
          //     paddingTop: theme.spacing(4),
          //   },
          //   [theme.breakpoints.up('md')]: {
          //     paddingLeft: theme.spacing(5),
          //     paddingRight: theme.spacing(5),
          //     paddingTop: theme.spacing(5.5),
          //   },
          //   [theme.breakpoints.up('lg')]: {
          //     paddingLeft: theme.spacing(7),
          //     paddingRight: theme.spacing(7),
          //     paddingTop: theme.spacing(6),
          //   },
          // },
          // [`.${modalCloseClasses.root}`]: {
          //   position: 'absolute',
          //   top: theme.spacing(3),
          //   right: theme.spacing(3),
          //   [theme.breakpoints.down('sm')]: {
          //     top: theme.spacing(2),
          //     right: theme.spacing(3),
          //   },
          //   zIndex: 1,
          //   '&:hover': {
          //     backgroundColor: 'transparent',
          //   },
          //   '& svg': {
          //     fontSize: { xs: 'xl3', sm: 'xl4', lg: 'xl5' },
          //   },
          // },
          // [`.${modalCloseClasses.root}`]: {
          //   padding: 0,
          //   [theme.breakpoints.down('xs')]: {
          //     margin: theme.spacing(1),
          //   },
          //   [theme.breakpoints.down('sm')]: {
          //     margin: theme.spacing(2),
          //   },
          //   '&> svg': {
          //     [theme.breakpoints.down('xs')]: {
          //       fontSize: '24px', // xl3 equivalent
          //     },
          //     [theme.breakpoints.between('sm', 'lg')]: {
          //       fontSize: '28px', // xl4 equivalent
          //     },
          //     [theme.breakpoints.up('lg')]: {
          //       fontSize: '32px', // xl5 equivalent
          //     },
          //     color: theme.palette.brand.wheat[500],
          //   },
          // },
        }),
      },
    },
    JoyModalDialog: {
      defaultProps: {
        variant: 'plain',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '--ModalDialog-radius': 0,
          [theme.breakpoints.down('sm')]: {
            // '--Card-padding': `${theme.spacing(6)} ${theme.spacing(4)}`,
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
            // '--Card-padding': `${theme.spacing(7)} ${theme.spacing(6)}`,
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

    JoyDialogContent: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          return {
            // padding: theme.spacing(2),
            paddingTop: 0,
            [theme.breakpoints.down('md')]: {
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              // paddingTop: theme.spacing(2),
            },
            [theme.breakpoints.up('md')]: {
              paddingLeft: theme.spacing(3),
              paddingRight: theme.spacing(3),
              // paddingTop: theme.spacing(3),
            },
            [theme.breakpoints.up('lg')]: {
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
              // paddingTop: theme.spacing(4),
            },
          };
        },
      },
    },
    JoyTooltip: {
      defaultProps: {
        variant: 'soft',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...{
            padding: 16,
            border: 0,
          },
          ...(ownerState.variant === 'soft' && {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05);',
            borderRadius: 'var(--spacing-system-focus-radius-angular, 4px)',
            backgroundColor: 'var(--fortress-palette-brand-charcoal-0)',
            color: 'var(--fortress-palette-brand-charcoal-800)',
            '.MuiTooltip-arrow::before': {
              boxShadow: 'none',
              borderColor: 'var(--fortress-palette-brand-charcoal-0)',
            },
          }),
          ...(ownerState.variant === 'solid' && {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05);',
            borderRadius: 'var(--spacing-system-focus-radius-angular, 4px)',
            color: `var(--fortress-palette-brand-charcoal-800)`,
            backgroundColor: 'var(--fortress-palette-brand-wheat-300)',
            '.MuiTooltip-arrow::before': {
              boxShadow: 'none',
              borderColor: `var(--fortress-palette-brand-wheat-300)`,
            },
          }),
        }),
      },
    },
    JoySnackbar: {
      defaultProps: {
        variant: 'soft',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          padding: 16,
          border: 0,
          // borderRadius: 'var(--spacing-2, 16px)',
          // paddingRight: '36px',
          // flexWrap: 'wrap',

          position: 'fixed',
          gap: '8px',
          boxShadow: 'none',
          alignItems: 'flex-start',

          '&.toast-desktop': {
            alignItems: 'center',
          },

          // Toast组件的两行布局样式
          '& .toast-content-desktop': {
            display: 'flex',
            gap: theme.spacing(1),
            width: '100%',
            alignItems: 'center',
          },
          '& .toast-content-mobile': {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
            width: '100%',
          },

          '& .toast-top-row': {
            display: 'flex',
            alignItems: 'flex-start',
            gap: theme.spacing(1),
            width: '100%',
          },

          '& .toast-action-row': {
            marginLeft: 'auto',
          },

          ...(ownerState.variant === 'soft' && {
            position: 'fixed',
            color: '#FFFDF9',
            background: `var(--fortress-palette-brand-charcoal-800, #323433)`,
          }),
          ...(ownerState.variant === 'solid' && {
            backgroundColor: theme.palette.brand.warmLinen[100],
            color: theme.palette.brand.maroonVelvet[500],
          }),
        }),
      },
    },
    JoyChip: {
      defaultProps: {
        variant: 'soft',
        color: 'primary',
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          '--_Chip-primary-color': theme.palette.brand.sage[500],
          '--_Chip-radius': 0,
          svg: {
            fill: 'currentColor',
          },
          ...(ownerState.variant === 'soft' && {
            color: 'var(--fortress-palette-brand-charcoal-700)',
            backgroundColor: `var(--fortress-palette-brand-charcoal-100)`,
          }),
          ...(ownerState.variant === 'solid' && {
            backgroundColor: `var(--_Chip-primary-color)`,
          }),
          ...(ownerState.variant === 'plain' && {
            color: `var(--_Chip-primary-color)`,
          }),
          ...(ownerState.variant === 'outlined' && {
            color: `var(--_Chip-primary-color)`,
            borderColor: `var(--_Chip-primary-color)`,
          }),
        }),
      },
    },
    JoyPagination: {
      defaultProps: {
        color: 'primary',
        variant: 'outlined',
        size: 'md',
        shape: 'rounded',
      },
      styleOverrides: {
        ul: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          gap: theme.spacing(0.5),
        }),
      },
    },
    JoyPaginationItem: {
      defaultProps: {},
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          backgroundColor: theme.palette.brand.charcoal[0],
          color: theme.palette.brand.terracotta[500],
          ...(ownerState.size === 'md' && {
            width: theme.spacing(4),
            height: theme.spacing(4),
            alignItems: 'center',
            justifyContent: 'center',
          }),
          ...(ownerState.variant === 'outlined' && {
            border: `1px solid ${theme.palette.brand.terracotta[500]}`,
            ':hover': {
              backgroundColor: theme.palette.primary.outlinedHoverBg,
            },
          }),
          ...(ownerState.selected && {
            backgroundColor: theme.palette.brand.terracotta[500],
            color: theme.palette.brand.charcoal[0],
          }),

          ...((ownerState.type === 'previous' || ownerState.type === 'next') && {
            border: 'none',
          }),
          ...((ownerState.type === 'first' || ownerState.type === 'last') && {
            border: 'none',
          }),
        }),
        icon: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          path: {
            fill: theme.vars.palette.brand.mono[500],
          },
        }),
        ellipsis: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ':hover': {
            cursor: 'pointer',
          },
          border: 'none',
          ...(ownerState.size === 'md' && {
            width: theme.spacing(4),
            height: theme.spacing(4),
          }),
        }),
      },
    },
    JoyFab: {
      styleOverrides: {
        root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
          ...(ownerState.size === 'sm' && {
            width: theme.spacing(5),
            height: theme.spacing(5),
            '--fortress-icon-width': theme.spacing(3),
            '--fortress-icon-height': theme.spacing(3),
          }),
          ...(ownerState.size === 'md' && {
            width: theme.spacing(7),
            height: theme.spacing(7),
            '--fortress-icon-width': theme.spacing(4),
            '--fortress-icon-height': theme.spacing(4),
          }),
          ...(ownerState.size === 'lg' && {
            width: theme.spacing(12),
            height: theme.spacing(12),
            '--fortress-icon-width': theme.spacing(7.5),
            '--fortress-icon-height': theme.spacing(7.5),
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
  },
});
