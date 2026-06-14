import React, { useEffect, useRef } from 'react';
import { getCurrentContext } from 'utils/dy';
import { getHistory } from 'helpers/History';

const DYWrapper = React.memo(
  ({ campaign, render }) => {
    let pathname = getHistory().getCurrentLocation().pathname || '';
    pathname = pathname.replace(/\/|-/g, '_');
    // const selector = `dy_${campaign.replace(/\s/g, '_')}${productId ? `_${productId}` : ''}`;
    const ref = useRef(`dy_${campaign.replace(/\s/g, '_')}_${pathname}`);
    // const selector = `dy_${campaign.replace(/\s/g, '_')}_${pathname}_${count}`;
    useEffect(() => {
      if (typeof DYO !== 'undefined' && DYO.smartObject && DY) {
        const currentContext = getCurrentContext();
        if (currentContext) {
          DY.recommendationContext = currentContext;
        }
        DYO.smartObject(campaign, {
          target: ref.current,
          inline: true,
        });
      }
    }, [campaign]);
    return render(ref.current);
  },
  (prevProps, nextProps) => {
    if (prevProps.campaign === nextProps.campaign) {
      return true;
    }
    return false;
  }
);

export default DYWrapper;
