import React from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import AsyncLoad from 'components/AsyncLoad';
import loadingBar from 'components/LoadingBar';
import { ThemeCompositionProvider } from 'theme/themeProvider';
import SentryErrorBoundary from 'components/ErrorBoundary/SentryErrorBoundary';

const MainEntry = ({ store, history, routes, appContext }) => (
  <SentryErrorBoundary>
    <ThemeCompositionProvider appContext={appContext}>
      <Provider store={store}>
        <Router
          render={(props) => <AsyncLoad {...props} />}
          onUpdate={() => {
            loadingBar.start();
          }}
          history={history}
        >
          {routes}
        </Router>
      </Provider>
    </ThemeCompositionProvider>
  </SentryErrorBoundary>
);

MainEntry.propTypes = {
  store: PropTypes.object,
  history: PropTypes.object,
  routes: PropTypes.element,
  appContext: PropTypes.object,
};

export default MainEntry;
