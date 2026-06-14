import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { EVENT_MULBERRY_WARRANTY } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import Script from 'components/Script';
import lang from 'utils/lang';
import style from './style.scss';

function MulberryInlinePicker({ variant, bundleVariant, product, listPrice, setCurrentWarranty }) {
  const [currentOffer, setCurrentOffer] = useState(null);
  const [selected, setSelected] = useState(null);
  const [initIsFinished, setInitIsFinished] = useState(false);
  const dispatch = useDispatch();

  const getWarrantyOffer = useCallback(() => {
    if (!variant) {
      return Promise.resolve([]);
    }

    const imagesSrc =
      variant?.images?.map((image) => ({
        src: image.link?.large || Object.values(image.links || {})[0],
      })) || [];

    // 确保 product 和 taxons 存在
    const breadcrumbs = product?.taxons
      ?.filter((taxon) => taxon?.name !== 'Category' && !taxon?.name?.includes('Collection'))
      .map((taxon) => ({
        category: taxon.name,
      }));
    let title = variant.name;
    let id = variant.sku;

    if (product?.product_type === 'bundle' && bundleVariant) {
      // Here the backend checks the id string and requires the key in the bundleVariant to be in ascending order
      // I(rickgao) did not reorder, because for js, the key is ascending by default when it is a number
      // if there is a real problem, you can determine whether the asce order, to see if you wanna to manually sort
      title = Object.values(bundleVariant).reduce((acc, v) => `${acc}, ${v.name}`, variant.name);
      id = `${Object.entries(bundleVariant).reduce(
        (pre, cur, index) => `${pre}${index === 0 ? '' : '&'}bundle_option[${cur?.[0]}]=${cur?.[1]?.id}`,
        `${variant.sku}?`
      )}`;
    }

    const payload = {
      title,
      id,
      price: listPrice,
      images: imagesSrc,
      meta: {
        breadcrumbs,
      },
    };

    // return window.mulberry.core.getWarrantyOffer(payload); // this is a promise
    return window.mulberry?.core?.getWarrantyOffer?.(payload) || Promise.resolve([]); // this is a promise
  }, [product, variant, listPrice, bundleVariant]);
  useEffect(() => {
    // race condition
    // https://beta.reactjs.org/learn/you-might-not-need-an-effect#fetching-data
    let ignore = false;

    (async () => {
      setInitIsFinished(false);
      setSelected(null);
      setCurrentWarranty({
        isSelected: false,
        warranty_offer_id: null,
        hasOffers: false,
      });

      try {
        const offers = await getWarrantyOffer();
        if (ignore) return;

        if (offers?.length > 0) {
          setCurrentWarranty((prevState) => ({
            ...prevState,
            hasOffers: true,
          }));
        }

        setCurrentOffer(offers);

        const settings = window.mulberry?.core?.settings;
        if (offers?.length > 0) {
          try {
            await window.mulberry?.inline?.init?.({
              offers,
              settings,
              selector: '.mulberry-inline-picker',
            });
          } catch (initError) {
            console.warn('Mulberry inline init failed:', initError);
          }
        }

        setInitIsFinished(true);
      } catch (error) {
        console.error('Error in warranty offer flow:', error);
        if (!ignore) {
          setInitIsFinished(true);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [getWarrantyOffer, setCurrentWarranty]);

  return (
    currentOffer?.length > 0 && (
      <div className={`${style.mulberryInlineContainer}`}>
        <h3>Protect Your Product</h3>
        {initIsFinished && (
          <a
            role="button"
            onClick={() => {
              dispatch({
                type: EVENT_MULBERRY_WARRANTY,
                result: {
                  detailAction: 'extended_warranty_faq',
                  label: null,
                  skuId: variant.sku,
                  skuName: variant.product_name,
                  position: 'pdp',
                  price: null,
                },
              });
              window.mulberry.inline.instances[0].postMessageClient.listeners
                .find((x) => x.key === 'mulberry:inline-to-faq')
                .fn(window.mulberry.core.settings);
            }}
          >
            What's Covered
          </a>
        )}
        <p>Fast repairs, fast replacement, no fees</p>
        <div className="mulberry-inline-picker" />
        <section>
          {currentOffer.map((offer, index) => (
            <button
              key={index}
              type="button"
              disabled={!initIsFinished}
              onClick={() => {
                if (selected === index) {
                  setSelected(null);
                  setCurrentWarranty((prevState) => ({
                    ...prevState,
                    isSelected: false,
                    warranty_offer_id: null,
                  }));
                } else {
                  setSelected(index);
                  setCurrentWarranty((prevState) => ({
                    ...prevState,
                    isSelected: true,
                    warranty_offer_id: currentOffer[index].warranty_offer_id,
                    label: `${offer.duration_months / 12} years`,
                    skuId: variant.sku,
                    skuName: variant.product_name,
                    position: 'pdp',
                    price: offer.customer_cost,
                  }));
                  dispatch({
                    type: EVENT_MULBERRY_WARRANTY,
                    result: {
                      detailAction: 'select_extended_warranty',
                      label: `${offer.duration_months / 12} years`,
                      skuId: variant.sku,
                      skuName: variant.product_name,
                      position: 'pdp',
                      price: offer.customer_cost,
                    },
                  });
                }
              }}
              className={`${index === selected ? 'selected' : ''}`}
            >{`${offer.duration_months / 12} ${offer.duration_months / 12 > 1 ? `Years` : `Year`} - ${lang.t(
              'common.currency_symbol'
            )}${offer.customer_cost}`}</button>
          ))}
        </section>
      </div>
    )
  );
}

MulberryInlinePicker.propTypes = {
  variant: PropTypes.object,
  bundleVariant: PropTypes.object,
  product: PropTypes.object,
  listPrice: PropTypes.number,
  setCurrentWarranty: PropTypes.func,
};

export default function MulberryInlinePickerWrapper(props) {
  const [hadInitMulberry, setHadInitMulberry] = useState(false);
  // TODO loading?
  if (!__MULBERRY_PUBLIC_TOKEN__) return '';
  return (
    <>
      <Script
        src={__MULBERRY_SDK__}
        onLoad={() => {
          window.mulberry.core.init({
            publicToken: __MULBERRY_PUBLIC_TOKEN__,
          });
        }}
        onReady={() => {
          setHadInitMulberry(true);
        }}
      />
      {hadInitMulberry && <MulberryInlinePicker {...props} />}
    </>
  );
}
