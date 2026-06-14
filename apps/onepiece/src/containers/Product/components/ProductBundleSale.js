import React from 'react';
import { useCurrentVariant } from '../hooks/product';

import style from './style.scss';

const ProductBundleSale = () => {
  const variant = useCurrentVariant();
  return variant.pair_up_info ? (
    <div className={style.bundleSale}>
      <div className={`${style.bundleSale}__left`}>
        <div className={`${style.bundleSale}__left-head`}>Bundle Sale</div>
        <span
          className={`${style.bundleSale}__left-content`}
          dangerouslySetInnerHTML={{
            __html: variant.pair_up_info.product_page_hint,
          }}
        />
      </div>
      <a
        className={`${style.bundleSale}__right`}
        type="button"
        href={`${__BASE_ROUTE__}/bundle-and-save`}
        target="_blank"
      >
        Get it Now
      </a>
    </div>
  ) : null;
};

export default ProductBundleSale;
