import { useEffect } from 'react';
import { load } from 'redux/modules/dyApiData';
import { useDispatch, useSelector } from 'react-redux';

/**
 * @param {
        selectorArray = [],
        pageType = 'other',
        customContext = null,
        collectionName = '',
        shouldCheckIfNeedLoad = true,
      } = {} 
 * @returns campaign
 */
export function useApiCampaigns(loadOptions) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state?.dyApiData?.campaign || {});
  useEffect(() => {
    dispatch(load(loadOptions));
  }, [loadOptions?.productId, loadOptions?.customPageAttribute]);
  return data;
}
