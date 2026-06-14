import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Helmet from 'components/Helmet';
import Breadcrumbs from 'components/Breadcrumbs';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
// import { globalFeatureInCA } from 'config';

export function wrapPage(options) {
  const border = !!(options && options.border);
  const isOnlineScheduleV2 = !!(options && options.isOnlineScheduleV2);

  const ComposedComponentWarper = (ComposedComponent) => {
    const ForwardProps = (props) => {
      const { pathname } = props.location;

      if (options && options.hideHeaderFooter) {
        return (
          <div>
            <Helmet path={pathname} />
            <ComposedComponent {...props} />
          </div>
        );
      }
      if (
        __COUNTRY__ === 'CA' &&
        // (pathname === '/' ||
        pathname === '/announcement'
        // pathname === '/terms-of-use' ||
        // pathname === '/privacy-policy'
        // )
      ) {
        return (
          <div>
            <Helmet path={pathname} page={options?.page} />
            <ComposedComponent {...props} />
          </div>
        );
      }
      return (
        <div style={{ backgroundColor: isOnlineScheduleV2 ? '#FBF9F4' : '#F6F3E7' }}>
          <Helmet path={pathname} page={options?.page} />
          {isOnlineScheduleV2 ? null : <Header border={border} />}
          {!options?.hideBreadcrumbs && <Breadcrumbs location={props.location} />}
          <div>
            <ComposedComponent {...props} />
          </div>
          {isOnlineScheduleV2 ? null : <Footer fromCategoryRetired={options && options.fromCategoryRetired} />}
        </div>
      );
    };
    return ForwardProps;
  };

  return ComposedComponentWarper;
}

export function withContext(Context) {
  return (Component) => {
    const forwardProps = (props) => (
      <Context.Consumer>{(values) => <Component {...{ ...props, ...values }} />}</Context.Consumer>
    );
    return forwardProps;
  };
}

export function withUseBreakpoints(Component) {
  // Create a wrapper function component
  const WithBreakpoints = (props) => {
    // Use the hook inside this function component
    const breakpoints = useBreakpoints() || {};

    // Render the wrapped component with the breakpoints prop
    return <Component breakpoints={breakpoints} {...props} />;
  };

  // Optional: Set display name for debugging purposes
  WithBreakpoints.displayName = `WithBreakpoints(${Component.displayName || Component.name || 'Component'})`;

  return WithBreakpoints;
}
