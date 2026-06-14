import React from 'react';
import MGlobalStyles from '@mui/joy/GlobalStyles';
import { css } from '@emotion/react';

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
        },
        '*': {
          '&::before, &::after': {
            boxSizing: 'inherit',
          },
        },
        // Typography
        //

        // Remove top margins from headings
        //
        // By default, `<h1>`-`<h6>` all receive top and bottom margins. We nuke the top
        // margin for easier control within type scales as it avoids margin collapsing.
        'h1,h2,h3,h4,h5,h6': {
          marginTop: 0,
          marginBottom: '0.5rem',
        },
        // Reset margins on paragraphs
        //
        // Similarly, the top margin on `<p>`s get reset. However, we also reset the
        // bottom margin to use `rem` units instead of `em`.
        p: {
          marginTop: 0,
          marginBottom: '1rem',
        },

        address: {
          marginBottom: '1rem',
          fontStyle: 'normal',
          lineHeight: 'inherit',
        },
        'ol,ul,dl': {
          marginTop: 0,
          marginBottom: '1rem',
        },
        'ol ol,ul ul,ol ul': {
          marginBottom: 0,
        },
        dt: {
          // TODO
          // fontWeight: '$dt-font-weight',
        },
        dd: {
          marginBottom: '0.5rem',
          marginLeft: 0, // Undo browser default
        },
        blockquote: {
          margin: '0 0 1rem',
        },
        //
        // Links
        //
        a: {
          // color:
          textDecoration: 'none',
          '&:hover, &:focus': {
            // 修改原因：使用硬编码的terracotta主色，对应terracotta-500
            color: '#844025',
          },
          // TODO focus
        },
        //
        // Code
        //
        pre: {
          // Remove browser default top margin
          marginTop: 0,
          // Reset browser default of `1em` to use `rem`s
          marginBottom: '1rem',
        },
        //
        // Figures
        //
        figure: {
          // Normalize adds `margin` to `figure`s as browsers apply it inconsistently.
          // We reset that to create a better flow in-page.
          margin: '0 0 1rem',
        },
        //
        // Images
        //
        img: {
          // By default, `<img>`s are `inline-block`. This assumes that, and vertically
          // centers them. This won't apply should you reset them to `block` level.
          verticalAlign: 'middle',
          // Note: `<img>`s are deliberately not made responsive by default.
          // For the rationale behind this, see the comments on the `.img-fluid` class.

          width: '100%',
        },
        // iOS "clickable elements" fix for role="button"
        //
        // Fixes "clickability" issue (and more generally, the firing of events such as focus as well)
        // for traditionally non-focusable elements with role="button"
        // see https://developer.mozilla.org/en-US/docs/Web/Events/click#Safari_Mobile
        "[role = 'button']": {
          cursor: 'pointer',
        },
        // Avoid 300ms click delay on touch devices that support the `touch-action` CSS property.
        //
        // In particular, unlike most other browsers, IE11+Edge on Windows 10 on touch devices and IE Mobile 10-11
        // DON'T remove the click delay when `<meta name="viewport" content="width=device-width">` is present.
        // However, they DO support removing the click delay via `touch-action: manipulation`.
        // See:
        // * http://v4-alpha.getbootstrap.com/content/reboot/#click-delay-optimization-for-touch
        // * http://caniuse.com/#feat=css-touch-action
        // * http://patrickhlauke.github.io/touch/tests/results/#suppressing-300ms-delay
        "a, area, button, [role='button'], input, label, select, summary, textarea": {
          touchAction: 'manipulation',
        },
        //
        // Tables
        //
        table: {
          // Reset for nesting within parents with `background-color`.
          // TODO
          backgroundColor: '',
        },
        // TODO
        caption: {
          paddingTop: '$table-cell-padding',
          paddingBottom: '$table-cell-padding',
          color: '$text-muted',
          textAlign: 'left',
          captionSide: 'bottom',
        },
        th: {
          // Centered by default, but left-align-ed to match the `td`s below.
          textAlign: 'left',
        },
        //
        // Forms
        //
        label: {
          // Allow labels to use `margin` for spacing.
          display: 'inline-block',
          marginBottom: '0.5rem',
        },
        // Work around a Firefox/IE bug where the transparent `button` background
        // results in a loss of the default `button` focus styles.
        //
        // Credit: https://github.com/suitcss/base/
        button: {
          '&:focus': {
            outline: '1px dotted',
            // outline: '5px auto -webkit-focus-ring-color',
          },
        },
        // 'button, input, optgroup, select, textarea': {},
        'button, input, optgroup, select, textarea': {
          // Remove all `margin`s so our classes don't have to do it themselves.
          margin: 0,
          // Normalize includes `font: inherit;`, so `font-family`. `font-size`, etc are
          // properly inherited. However, `line-height` isn't addressed there. Using this
          // ensures we don't need to unnecessarily redeclare the global font stack.
          lineHeight: 'inherit',
          // iOS adds rounded borders by default
          borderRadius: 0,
        },
        // TODO: Use normalize reboot to handle this type of problem
        'input[type="search"]::-webkit-search-cancel-button': {
          // '-webkit-appearance': 'none',
          WebkitAppearance: 'none',
          display: 'none',
        },
        textarea: {
          // Textareas should really only resize vertically so they don't break their (horizontal) containers.
          resize: 'vertical',
        },
        fieldset: {
          // Chrome and Firefox set a `min-width: min-content;` on fieldsets,
          // so we reset that to ensure it behaves more like a standard block element.
          // See https://github.com/twbs/bootstrap/issues/12359.
          minWidth: 0,
          // Reset the default outline behavior of fieldsets so they don't affect page layout.
          padding: 0,
          margin: 0,
          border: 0,
        },
        legend: {
          // Reset the entire legend element to match the `fieldset`
          display: 'block',
          width: '100%',
          padding: 0,
          marginBottom: '0.5rem',
          fontSize: '1.5rem',
          lineHeight: 'inherit',
        },
        "input[type='search']": {
          // Undo Normalize's default here to match our global overrides.
          boxSizing: 'inherit',
          // This overrides the extra rounded corners on search inputs in iOS so that our
          // `.form-control` class can properly style them. Note that this cannot simply
          // be added to `.form-control` as it's not specific enough. For details, see
          // https://github.com/twbs/bootstrap/issues/11586.
          WebkitAppearance: 'none',
        },
        output: {
          display: 'inline-block',
          //  font-size: $font-size-base;
          //  line-height: $line-height;
          //  color: $input-color;
        },
        '[hidden]': {
          display: 'none !important',
        },
      },
      /* -------------------------------------------------------------------------- */
      /*                            ~bootstrap/scss/normalize'                          */
      /* -------------------------------------------------------------------------- */
      {
        // Forms
        // ==========================================================================
        //
        // Known limitation: by default, Chrome and Safari on OS X allow very limited
        // styling of `select`, unless a `border` property is set.
        //
        //
        // 1. Correct color not being inherited.
        //    Known issue: affects color of disabled elements.
        // 2. Correct font properties not being inherited.
        // 3. Address margins set differently in Firefox 4+, Safari, and Chrome.
        //
        'button, input, optgroup, select, textarea': {
          color: 'inherit', // 1
          font: 'inherit', // 2
          margin: 0, // 3
        },
      },
      /* -------------------------------------------------------------------------- */
      /*                                    src/sass/base.scss                                  */
      /* -------------------------------------------------------------------------- */

      {
        body: {
          touchAction: 'manipulation',
        },
        // a: {},
        'a, button': {
          ':focus': {
            // outlineOffset: '2px',
            // outline: `var(--fortress-focus-thickness, 2px) solid var(--fortress-palette-focusVisible, #096BDE)`,
            // outlineColor: `var(--fortress-palette-info-200)`,
            // TODO 后续再思考怎么全面开启 现在默认只有 Fortress 的组件才有 因为以前 就是这种逻辑 不能随便打开 不然样式不好看
            outline: 'none',
          },
        },
        // 修改原因：使用硬编码的Aime字体，对应fontFamily-display
        'h1, h2': {
          fontFamily: '"Aime", "Helvetica Neue", Arial, sans-serif',
        },
      },
      {
        // TODO 加个这个的背景是发现 默认的 button 没有带 pointer 了
        // TODO 但是为啥丢失 具体是哪个样式没迁移过来 还未确认 后续要检查这里
        button: {
          cursor: 'pointer',
        },
      },
      // TODO
      {
        body: {
          margin: 0,
          // 修改原因：使用硬编码的文本色，对应mono-900
          color: '#3C101E',
          // 修改原因：使用硬编码的字体配置，SanomatSans作为body字体
          fontFamily: '"Aime", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          '--fortress-fontFamily-body': 'Aime, Helvetica Neue, Arial, sans-serif',
          '--fortress-palette-primary-color': '#3C101E',
          // 修改原因：使用硬编码的背景色变量，对应warmLinen-200
          backgroundColor: '#fbf9f4',
          '& .MuiSelect-listbox': {
            background: '#FBF9F4',
            border: 'none',
            boxShadow: '0 4px 10px -1px rgba(0, 0, 0, 0.30)',
            '.MuiOption-root': {
              fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
              fontWeight: 400,
              lineHeight: 1.4,
              letterSpacing: 0,
              color: '#3C101E',
              padding: '12px 16px',
              // body1 样式
              '@media (min-width: 0px) and (max-width: 600px)': {
                fontSize: '1rem',
              },
              '@media (min-width: 601px) and (max-width: 900px)': {
                fontSize: '1rem',
              },
              '@media (min-width: 901px)': {
                fontSize: '1.125rem',
              },
              '&:focus:not(.Mui-selected)': {
                backgroundColor: '#F6F3E7',
                color: '#3C101E',
              },
              '&:hover:not(.Mui-selected)': {
                backgroundColor: '#F6F3E7',
                color: '#3C101E',
              },
            },
            '.Mui-selected': {
              backgroundColor: '#F9F7EF',
              color: '#844025',
            },
          },
          // 默认body1 样式
          '--fortress-palette-background-surface': '#fbf9f4',
          '@media (min-width: 0px) and (max-width: 600px)': {
            fontSize: '1rem', // 16px
          },
          '@media (min-width: 601px) and (max-width: 900px)': {
            fontSize: '1rem', // 16px
          },
          '@media (min-width: 901px)': {
            fontSize: '1.125rem', // 18px
          },

          '.MuiTypography-h1': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1.5rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1.5rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '2.125rem',
            },
          },
          '.MuiTypography-h2': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1.375rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1.375rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '2rem',
            },
          },
          '.MuiTypography-h3': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1.25rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1.25rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1.75rem',
            },
          },
          '.MuiTypography-h4': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1.125rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1.125rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1.375rem',
            },
          },
          '.MuiTypography-h5': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1.125rem',
            },
          },
          '.MuiTypography-subh1': {
            fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1rem',
            },
          },
          '.MuiTypography-subh2': {
            fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '0.875rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '0.875rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '0.875rem',
            },
          },
          '.MuiTypography-subh3': {
            fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',

            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '0.75rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '0.75rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '0.75rem',
            },
          },
          '.MuiTypography-body1': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0,
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '1rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '1.125rem',
            },
          },
          '.MuiTypography-body2': {
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
          },
          '.MuiTypography-caption1': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0,
            '@media (min-width: 0px) and (max-width: 600px)': {
              fontSize: '0.75rem',
            },
            '@media (min-width: 601px) and (max-width: 900px)': {
              fontSize: '0.75rem',
            },
            '@media (min-width: 901px)': {
              fontSize: '0.875rem',
            },
          },
          '.MuiTypography-caption2': {
            fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0,
            fontSize: '0.75rem',
          },
        },
      }
    )}
  />
);
