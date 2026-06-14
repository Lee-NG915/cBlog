import React, { useEffect } from 'react';
import TheLook from 'containers/ShopTheLook/components/TheLook';
import { useApiCampaigns } from 'hooks/dy';
import { useDispatch, useSelector } from 'react-redux';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { EVENT_DY_EVENT } from 'utils/track/constants';
import { useInView } from 'react-intersection-observer';
import PropTypes from 'prop-types';

import style from './style.scss';

let isTriggerEvent = false;

const ProductShopTheLook = ({ product }) => {
  const dyApiCampaigns = useApiCampaigns({ selectorArray: ['PDP Shop The Look'], pageType: 'product' });
  const isEmbedShopTheLook =
    dyApiCampaigns?.['PDP Shop The Look']?.data.embed && product?.slug === 'adams-chaise-sectional-sofa';
  const shopTheLookState = useSelector(
    (state) =>
      state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/pdp-shop-the-look`]
  );
  const shopTheLookData = shopTheLookState?.data?.story.content.adams_chaise_sectional_sofa[0];
  const dispatch = useDispatch();
  const [inViewRef, inView] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    product?.slug === 'adams-chaise-sectional-sofa' &&
      dispatch(
        loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/pdp-shop-the-look`)
      );
  }, [dispatch, product]);

  // GA-dy Event
  useEffect(() => {
    const detailAction = dyApiCampaigns?.['PDP Shop The Look']?.campaignName;
    // only inView triger B / A
    if (inView && !isTriggerEvent) {
      isTriggerEvent = true;
      detailAction &&
        dispatch({
          type: EVENT_DY_EVENT,
          result: {
            detailAction,
            label: isEmbedShopTheLook ? 'B' : 'A',
          },
        });
    }
  }, [dyApiCampaigns, dispatch, isEmbedShopTheLook, inView]);

  return (
    <div ref={inViewRef}>
      {isEmbedShopTheLook && shopTheLookData && (
        <div className={`${style.ShopTheLook}`}>
          <h2 className={`${style.ShopTheLook}__title`}>Shop The Look</h2>
          <TheLook item={shopTheLookData} />
        </div>
      )}
    </div>
  );
};
ProductShopTheLook.propTypes = {
  product: PropTypes.object,
};
export default ProductShopTheLook;
