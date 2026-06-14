import React from 'react';
import Banner from 'components/Banner';
import { GhostArrowBtn } from 'components/Button';
import classNames from 'classnames';
import { isBefore } from 'utils/time';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInSG } from 'config';
import style from './style.scss';
import { sales } from '../config';

const Products = () => {
  const showPromotion = globalFeatureInSG && isBefore('2023-03-27 00:00');
  const { desktop } = useBreakpoints();
  return (
    <div className={`${style.products}`}>
      <div className={`${style.products}__wrapper`}>
        <div className={`${style.products}__text`}>
          <div className={`${style.products}__title`}>Create Your Own Sanctuary</div>

          {showPromotion && (
            <div className={`${style.products}__description`}>
              <div>
                {desktop ? (
                  <>
                    On Mar 25 & 26, enjoy an <b>extra $100 off</b> in the Refresh Storewide Sale - exclusively at
                    Orchard Flagship.*
                  </>
                ) : (
                  <>
                    On Mar 25 & 26, enjoy an <b>extra $100 off</b> in the Refresh Storewide Sale.
                  </>
                )}
              </div>
              <div className={`${style.products}__promotion`}>
                {desktop ? (
                  '$280 off with min. spend of $2,500 | $550 off with min. spend of $4,500'
                ) : (
                  <>
                    $280 off with min. spend of $2,500
                    <br />
                    $550 off with min. spend of $4,500
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={classNames(`${style.products}__sales`, {
            'no-description': !showPromotion,
          })}
        >
          {sales.map((sale, index) => (
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: sale.image_small,
                  loader: { ratio: 0.4479 },
                },
                {
                  breakpoint: 'lg',
                  srcset: sale.image_large,
                  loader: { ratio: 0.814 },
                },
              ]}
              title="Workshop"
              key={index}
            >
              <GhostArrowBtn
                className={`${style.products}__sales__btn`}
                href={sale.url}
                text={sale.title}
                hasArrow
                arrowMargin={10}
              />
            </Banner>
          ))}
        </div>

        {showPromotion && (
          <div className={`${style.products}__tips`}>
            *Promo is valid with a min. purchase of at least 1 product from our latest collection.{' '}
            {!desktop && 'Exclusively at Orchard Flagship.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
