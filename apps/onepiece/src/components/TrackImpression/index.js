// react hook doesn't work well with our cms structure cause the react import from your application code needs to resolve to the same module as the react import from inside the react-dom package in cms.
// https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react
// FIXME: so use InView to replace useInView

// import React, { useEffect, useRef, useMemo, useCallback } from 'react';
// import { useInView } from 'react-intersection-observer';
// import { impression } from 'utils/tracking';

// const TrackImpression = ({ children, item, listName, listPosition, triggerOnce, rootRef, isRootShown }) => {
//   const [ref, inView] = useInView({ triggerOnce: rootRef ? triggerOnce : true, threshold: 1, root: rootRef && rootRef.current });
//   const containerRef = useRef();
//   // react-slick add slick-cloned slides to slider
//   const isCloned = useMemo(() => rootRef && containerRef.current && containerRef.current.closest('.slick-cloned'), [rootRef, containerRef.current]);
//   const setRef = useCallback(
//     ele => {
//       ref(ele);
//       containerRef.current = ele;
//     },
//     [ref],
//   );
//   useEffect(() => {
//     if (inView && (rootRef ? isRootShown : true) && !isCloned) {
//       try {
//         impression.add({
//           id: item.sku,
//           name: item.name,
//           price: item.price,
//           list_name: listName,
//           list_position: listPosition,
//         });
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   }, [inView, item, listName, listPosition, isRootShown, rootRef, isCloned]);

//   return <div ref={setRef}>{children}</div>;
// };

// export default TrackImpression;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InView } from 'react-intersection-observer';
import { connect } from 'react-redux';
import { EVENT_ADD_PRODUCT_IMPRESSION } from 'utils/track/constants';

@connect(null, (dispatch) => ({
  addImpression: (result) => dispatch({ type: EVENT_ADD_PRODUCT_IMPRESSION, result }),
}))
export default class TrackImpression extends Component {
  static propTypes = {
    children: PropTypes.node,
    item: PropTypes.object,
    taxons: PropTypes.array,
    listName: PropTypes.string,
    listPosition: PropTypes.number,
    triggerOnce: PropTypes.bool,
    rootRef: PropTypes.object,
    isRootShown: PropTypes.bool,
    addImpression: PropTypes.func,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  componentDidUpdate(prevProps) {
    const { item } = this.props;
    if (prevProps.item.id !== item.id) {
      this.trackImpression();
    }
  }

  trackImpression = () => {
    const { item, taxons, listName, listPosition, addImpression } = this.props;
    const { router } = this.context;
    try {
      addImpression({
        variant: item,
        taxons,
      });
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            message: 'Track impression error',
            error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
          },
          null,
          2
        )
      );
    }
  };

  handleChange = (inView, entry) => {
    const { rootRef, isRootShown } = this.props;
    if (rootRef && typeof this.isCloned === 'undefined') {
      this.isCloned = entry.target.closest && !!entry.target.closest('.slick-cloned');
    }
    if (rootRef && this.isCloned) {
      return;
    }
    if (inView && (rootRef ? isRootShown : true)) {
      this.trackImpression();
    }
  };

  render() {
    const { children, triggerOnce, rootRef, isRootShown } = this.props;
    const root = isRootShown && rootRef ? rootRef.current : null;
    return (
      <InView onChange={this.handleChange} triggerOnce={rootRef ? triggerOnce : true} threshold={0.25} root={root}>
        {({ ref }) => (
          <div style={{ alignSelf: 'stretch' }} ref={ref}>
            {children}
          </div>
        )}
      </InView>
    );
  }
}
