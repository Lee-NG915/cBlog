import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import { getVariantLink } from 'utils/link';
import { toPrice } from 'utils/number';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ModelConfig, AllConfig } from './ProductConfig';
import { useBundle, useBundleVariant, useUpdateSelectVariant } from '../hooks/bundle';
import { useMaterialLoad, useUpdateVariant } from '../hooks/config';
import { useMobileFrame, useProductOptions } from '../hooks/product';
import style from './style.scss';

const ConfigItem = ({ src, alt, loader, variantInfo, variantName, clickHandler }) => (
  <div role="button" className={style.bundleList} onClick={clickHandler}>
    <div className={`${style.bundleList}__left`}>
      <ReactPicture
        className={`${style.bundleList}__left-img`}
        srcset={src}
        alt={alt}
        loader={{ ...loader, objectFit: 'contain' }}
      />
    </div>
    <div className={`${style.bundleList}__right`}>
      <h4>{variantName}</h4>
      <div>{variantInfo}</div>
      {clickHandler && <button type="button">{'Select >'}</button>}
    </div>
  </div>
);

ConfigItem.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  loader: PropTypes.object,
  variantInfo: PropTypes.string,
  variantName: PropTypes.string,
  clickHandler: PropTypes.func,
};

const BundleVariantPopup = ({ variant, product, children }) => {
  const { frame } = useMobileFrame();

  const [mounted, setMounted] = useState(false);

  const { bundleVariant } = useBundleVariant(variant, product);

  const variantLink = useMemo(() => `${__BASE_ROUTE__}${getVariantLink(bundleVariant)}`, [bundleVariant]);

  const { desktop } = useBreakpoints();
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  return (
    <div className={style.bundleVariantPopup}>
      <div className={`${style.bundleVariantPopup}__img`}>
        {mounted ? (
          <Slick
            dots
            infinite={!!(bundleVariant.images && bundleVariant.images.length > 1)}
            draggable={false}
            speed={500}
            arrows={!desktop && !!(bundleVariant.images && bundleVariant.images.length > 1)}
            prevArrow={!desktop && <PrevBtn />}
            nextArrow={!desktop && <NextBtn />}
          >
            {bundleVariant.images && bundleVariant.images.length > 0 ? (
              bundleVariant.images.map((image, index) => {
                // use gray images
                const { large } = image.links;
                const links = {
                  large,
                };

                return (
                  <div key={index}>
                    <div>
                      <ReactPicture
                        srcset={links}
                        alt={`${bundleVariant.name} ${index}`}
                        loader={{
                          ratio: 0.667,
                          widths: [250, 500, 750],
                          sizes: '250px',
                          objectFit: 'contain',
                        }}
                        lazy={false}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="is-disabled">
                <ReactPicture alt={bundleVariant.name} loader={{ ratio: 0.667 }} />
              </div>
            )}
          </Slick>
        ) : null}
      </div>
      <div className={`${style.bundleVariantPopup}__main`}>
        <a href={variantLink} target="_blank" rel="noopener" className={`${style.bundleVariantPopup}__main-name`}>
          {bundleVariant.product_name}
        </a>
        {bundleVariant.id ? (
          <div className={`${style.bundleVariantPopup}__main-price`}>{toPrice(Number(bundleVariant.price), true)}</div>
        ) : null}
        <AllConfig bundle />
      </div>
      {desktop && (
        <button
          type="button"
          className={`${style.bundleVariantPopup}__drawer__dismiss`}
          onClick={() => frame.removeModal()}
        >
          <ReactSVG name="dismiss" />
        </button>
      )}
      {children}
    </div>
  );
};

BundleVariantPopup.propTypes = {
  variant: PropTypes.object,
  product: PropTypes.object,
  children: PropTypes.node,
};

const BundleVariantButton = ({ product, closeHandler }) => {
  const { bundleVariant } = useProductOptions();
  const updateSelectedVariants = useUpdateSelectVariant();
  const buttonClickHandler = useCallback(() => {
    if (closeHandler) {
      setTimeout(closeHandler, 80);
    }
    updateSelectedVariants(product.id, bundleVariant);
  }, [product, bundleVariant, updateSelectedVariants, closeHandler]);

  return (
    <div className={`${style.bundleVariantPopup}__button`}>
      <button type="button" onClick={buttonClickHandler}>
        Confirm
      </button>
    </div>
  );
};

BundleVariantButton.propTypes = {
  product: PropTypes.object,
  closeHandler: PropTypes.func,
};

const ProductBundleConfigItems = () => {
  const bundles = useBundle();

  const { frame } = useMobileFrame();
  const { desktop } = useBreakpoints();
  const modifiedBundles = useMemo(
    () =>
      bundles.map((bundleVariant) => {
        const temp = bundleVariant;
        if (temp.variant?.variant_option_values?.length > 0) {
          temp.clickHandler = () => {
            if (!desktop) {
              frame.openModal(
                'mobileModal',
                {
                  content: <BundleVariantPopup variant={temp.variant} product={temp.product} />,
                  styleOverflow: 'scroll',
                },
                {
                  height: 85,
                  fixedItem: <BundleVariantButton product={temp.product} closeHandler={() => frame.removeModal()} />,
                  styleOverflow: 'auto',
                }
              );
            } else {
              frame.addModal(
                <BundleVariantPopup variant={temp.variant} product={temp.product}>
                  <BundleVariantButton product={temp.product} closeHandler={() => frame.removeModal()} />
                </BundleVariantPopup>,
                'side',
                {
                  dismiss: () => frame.removeModal(),
                  position: 'right',
                  maxWidth: 500,
                }
              );
            }
          };
        }
        return temp;
      }),
    [bundles, frame, desktop]
  );

  return (
    <>
      {modifiedBundles.map((it) => (
        <ConfigItem key={it.id} {...it} />
      ))}
    </>
  );
};

const ProductBundleConfig = () => {
  // TODO This will result in the above-the-fold content not having the product option
  // auto update bundleVariant
  useUpdateVariant();
  const { desktop } = useBreakpoints();

  useMaterialLoad({ needLoad: desktop });

  return (
    <div className={style.bundleConfigPanel}>
      <ModelConfig />
      <ProductBundleConfigItems />
    </div>
  );
};

export { ProductBundleConfigItems };

export default ProductBundleConfig;
