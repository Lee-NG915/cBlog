import React from 'react';
import PropTypes from 'prop-types';
import { CssVarsProvider, defaultTheme } from '@castlery/fortress';
// import { getSsrMatchMedia } from 'fortress/utils/ssr';
import { getSsrMatchMedia } from '@castlery/fortress/utils';
import CssBaseline from '@mui/joy/CssBaseline';
import { GlobalStyles } from './globalStyles';

export const ThemeCompositionProvider = (props) => {
  const { children, appContext } = props;
  const theme = appContext?.theme || defaultTheme;

  if (theme.components?.MuiUseMediaQuery?.defaultProps) {
    theme.components.MuiUseMediaQuery.defaultProps.ssrMatchMedia = getSsrMatchMedia(appContext?.device);
  }
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </CssVarsProvider>
  );
};

ThemeCompositionProvider.propTypes = {
  children: PropTypes.node,
  appContext: PropTypes.object,
};
