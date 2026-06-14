import React, { useCallback } from 'react';
import { Link } from 'react-router';
import { getProductLink } from 'utils/link';
import { useCurrentProduct } from 'containers/Product/hooks/product';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import { useDispatch } from 'react-redux';

import style from '../style.scss';

const PlaDetail = ({ styleName }) => {
  const product = useCurrentProduct();
  const dispatch = useDispatch();

  const trackCompleteDetails = useCallback(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'complete_details',
        label: 'click',
      },
    });
  }, [dispatch]);

  return (
    <div className={`${style[styleName]} ${style.detailCommon}`}>
      <Link to={getProductLink(product.slug)}>View Full Product Page</Link>
    </div>
  );
};

export default PlaDetail;
