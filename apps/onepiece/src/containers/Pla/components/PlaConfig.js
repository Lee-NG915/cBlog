import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ModelConfig, AllConfig, ProductCustom } from 'containers/Product/components/ProductConfig';
import { ProductBundleConfigItems } from 'containers/Product/components/ProductBundleConfig';
import { useProductOptions, useCurrentProduct } from 'containers/Product/hooks/product';
import { useUpdateVariant, useMaterialLoad, useConfigOptions } from 'containers/Product/hooks/config';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useBundle } from 'containers/Product/hooks/bundle';
import style from '../style.scss';

const PlaConfigNormal = ({ styleName }) => {
  const { customisable } = useProductOptions();

  return (
    <div className={`${style[styleName]}__panel-cover`}>
      <ModelConfig />
      <AllConfig customisable={customisable} />
      <ProductCustom />
    </div>
  );
};

const PlaConfigBundle = ({ styleName }) => (
  <div className={classNames(`${style[styleName]}__panel-cover`, 'bundleMargin')}>
    <ProductBundleConfigItems />
  </div>
);

const PlaConfigPanel = ({ show, product, styleName }) => {
  const ref = useRef();

  const bundle = product.product_type === 'bundle';

  useEffect(() => {
    let timmer;
    if (ref.current) {
      if (show) {
        ref.current.style.cssText = 'max-height: 1000px; opacity: 1;';
        timmer = setTimeout(() => {
          ref.current.style.overflow = 'visible';
        }, 600);
      } else {
        ref.current.style.cssText = 'max-height: 0px; opacity: 0;';
        timmer = setTimeout(() => {
          ref.current.style.overflow = 'hidden';
        });
      }
    }
    return () => clearTimeout(timmer);
  }, [show, ref]);

  return (
    <div
      ref={ref}
      className={classNames({
        [`${style[styleName]}__panel`]: true,
        bundle,
      })}
      style={{ maxHeight: 0, opacity: 0 }}
    >
      {!bundle ? <PlaConfigNormal styleName={styleName} /> : <PlaConfigBundle styleName={styleName} />}
    </div>
  );
};

PlaConfigPanel.propTypes = {
  show: PropTypes.bool,
  product: PropTypes.object,
};

const PlaConfig = ({ styleName }) => {
  const product = useCurrentProduct();
  const { customisable } = useProductOptions();

  const [show, setShow] = useState(false);

  const dispatch = useDispatch();

  const click = useCallback(() => {
    setShow((last) => {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'configuration',
          label: last ? 'close' : 'expand',
        },
      });
      return !last;
    });
  }, [dispatch]);

  const allConfig = useConfigOptions({ customisable });

  const bundle = useBundle();

  return bundle.length || allConfig.length ? (
    <div className={style[styleName]}>
      <button type="button" className={`${style[styleName]}__title`} onClick={click}>
        <div>Product Options</div>
        <div className={classNames({ active: show })} />
      </button>
      <PlaConfigPanel show={show} product={product} styleName={styleName} />
    </div>
  ) : null;
};

const PlaConfigWrapper = ({ styleName }) => {
  // TODO This will result in the above-the-fold content not having the product option
  useUpdateVariant();
  const { desktop } = useBreakpoints();
  useMaterialLoad({ needLoad: desktop });

  return <PlaConfig styleName={styleName} />;
};

export default PlaConfigWrapper;
