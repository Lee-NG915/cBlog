import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
// import { defaultTheme } from './default-theme';
// import { isSSR, getSsrMatchMedia } from '../utils/ssr';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/joy';
import type { ThemeProviderProps } from './types/ThemeProviderProps';
// export function ThemeProvider({
//   /* the default theme will be created in the next step */
//   theme = defaultTheme,
//   children,

//   appContext,
// }: ThemeProviderProps) {
//   if (theme.components?.MuiUseMediaQuery?.defaultProps) {
//     theme.components.MuiUseMediaQuery.defaultProps.ssrMatchMedia =
//       getSsrMatchMedia(appContext?.device);
//   }
//   return <CssVarsProvider theme={theme}>{children}</CssVarsProvider>;
// }

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export default function ThemeRegistry(props: ThemeProviderProps) {
  const { options, children, theme } = props;

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <CssVarsProvider theme={theme}>
        {/* the custom theme is optional */}
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}
