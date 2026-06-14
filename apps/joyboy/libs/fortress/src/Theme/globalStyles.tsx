import MGlobalStyles from '@mui/joy/GlobalStyles';
import { css } from '@emotion/react';

/**
 * GlobalStyles 组件
 *
 * 提供全局CSS样式，包括：
 * - 滚动条样式统一
 *
 * 使用方式：在 ThemeProvider 中引入即可自动应用到全局
 */
export const GlobalStyles = () => (
  <MGlobalStyles
    styles={css(
      /* -------------------------------------------------------------------------- */
      /*                           ~bootstrap/scss/reboot                           */
      /* -------------------------------------------------------------------------- */
      /**
       *  Reboot
       * Global resets to common HTML elements and more for easier usage by Bootstrap.
       * Adds additional rules on top of Normalize.css, including several overrides.
       */
      {
        // Reset the box-sizing
        //
        // Change from `box-sizing: content-box` to `border-box` so that when you add
        // `padding` or `border`s to an element, the overall declared `width` does not
        // change. For example, `width: 100px;` will always be `100px` despite the
        // `border: 10px solid red;` and `padding: 20px;`.
        //
        // Heads up! This reset may cause conflicts with some third-party widgets. For
        // recommendations on resolving such conflicts, see
        // http://getbootstrap.com/getting-started/#third-box-sizing.
        //
        // Credit: https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/

        html: {
          boxSizing: 'border-box',
          // Firefox 滚动条支持
          /* 两个有效的颜色。 第一个应用于滚动条的滑块，第二个应用于轨道。 */
          // scrollbarColor: 'var(--fortress-palette-warning-500) var(--fortress-palette-brand-mono-100)',
          // 覆盖浏览器自动填充的默认样式
          'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active':
            {
              transition: 'background-color 50000s   !important',
            },
          // 针对Firefox和其他浏览器的内部样式
          'input:-internal-autofill-selected': {
            backgroundColor: 'transparent !important',
            backgroundImage: 'none !important',
          } as any,
        },
        body: {
          // 保持默认背景，由主题控制
        },
        '*': {
          // v2 暂时不支持滚动条样式
          // '&::before, &::after': {
          // },
          // '&::-webkit-scrollbar': {
          //   width: '4px',
          //   // height: 8,
          // },
          // '&::-webkit-scrollbar-track': {
          //   backgroundColor: 'var(--fortress-palette-brand-mono-100)',
          //   borderRadius: '8px',
          // },
          // '&::-webkit-scrollbar-thumb': {
          //   backgroundColor: 'var(--fortress-palette-warning-500)',
          //   borderRadius: '8px',
          //   '&:hover': {
          //     backgroundColor: 'var(--fortress-palette-warning-600)',
          //   },
          // },
        },

        // 全局 a 标签样式 - 与fortress Link组件保持一致
        // 确保第三方平台插入的链接样式与主题匹配
        a: {
          // 基础样式 - 匹配body2 typography
          // fontWeight: 'var(--fortress-fontWeight-md)', // 400
          // fontFamily: 'var(--fortress-fontFamily-display)',
          // lineHeight: 'var(--fortress-lineHeight-xs)', // 1.2
          // letterSpacing: 'var(--fortress-letterSpacing-md)', // -0.0125em

          // 默认颜色 - 匹配Link组件primary color (warning)
          color: 'var(--fortress-palette-warning-500)',
          textDecorationColor: 'var(--fortress-palette-warning-500)',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          textDecorationThickness: '1px',

          // 禁用状态
          '&:disabled, &[aria-disabled="true"]': {
            color: 'var(--fortress-palette-brand-mono-500)',
            textDecorationColor: 'var(--fortress-palette-brand-mono-500)',
            cursor: 'not-allowed',
          },
        },
      }
    )}
  />
);
