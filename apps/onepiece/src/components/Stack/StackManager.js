import React, { useRef, useEffect } from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import Frame from 'containers/Frame';
import FixBar from 'components/Fixed/FixBar';
import { trackSPAEvent } from 'utils/tracking';
import PropTypes from 'prop-types';
import { globalFeatureInAU } from 'config';
import { LocationContext, ParamsContext } from './RouteContext';
import style from './style.scss';
import ThirdScripts from './ThirdScripts';

const StackManager = (props) => {
  const mounted = useRef(false);
  const { routes, store, location, router, params } = props;
  const pageType = routes[routes.length - 1].name;

  useEffect(() => {
    if (!mounted.current) {
      // do componentDidMount logic
      mounted.current = true;
    } else {
      // do componentDidUpdate logic
      trackSPAEvent({ pageType, state: store.getState() });
      window.scrollTo({
        top: 0,
      });
    }
  });

  return (
    <LocationContext.Provider value={location}>
      <ParamsContext.Provider value={params}>
        <div className={style.stack} data-selenium="top-layer">
          <ThirdScripts store={store} pageType={pageType} />
          <Frame router={router}>
            <RouterContext {...props} />
          </Frame>
        </div>
        {globalFeatureInAU && <FixBar />}
      </ParamsContext.Provider>
    </LocationContext.Provider>
  );
};

StackManager.propTypes = {
  routes: PropTypes.array,
  location: PropTypes.object,
  components: PropTypes.array,
  params: PropTypes.object,
  router: PropTypes.object,
  store: PropTypes.object,
};

export default StackManager;
