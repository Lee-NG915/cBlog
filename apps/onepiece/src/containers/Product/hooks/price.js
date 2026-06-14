import { useRef, useEffect, useCallback, useMemo } from 'react';
import { loadAffirm } from 'utils/affirm';
import { useCurrentProduct, useCurrentVariant, useCurrentSelectedVariants } from './product';

const useZIP = () => {
  const zipRef = useRef();

  const loadScript = useCallback((src) => {
    if (window.Zip && window.Zip.Widget) {
      window.Zip.Widget.setup();
      return;
    }
    const request = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => {
        resolve();
      };
      s.onerror = () => {
        reject(new Error('Error in loading script.'));
      };
      document.head.appendChild(s);
    });

    return request;
  }, []);

  const modifyPopup = useCallback((popupIframe) => {
    const iframeDoc = popupIframe.contentDocument || popupIframe.contentWindow.document;
    if (!iframeDoc) {
      return;
    }
    const termsContainer = iframeDoc.querySelector('footer:last-child');
    if (!termsContainer) {
      return;
    }
    termsContainer.className = 'how-it-works';
    const terms = iframeDoc.createElement('div');
    const styleEle = iframeDoc.createElement('style');
    styleEle.appendChild(
      iframeDoc.createTextNode(`
          body {
            margin: 0 0 22px;
          }
          .size-container {
            overflow: auto;
            height: 100%;
          }
          .how-it-works {
            margin: 24px;
          }
          .how-it-works p {
            font-size: 0.8rem;
            color: #a5abc1;
            line-height: 1.5;
          }
          .terms-container {
            margin: 24px;
          }
        `)
    );
    iframeDoc.head.appendChild(styleEle);
    terms.innerHTML = `
        <p>
          (3) New to Zip? <a href="https://account.zipmoney.com.au/#/" target="_blank">Create a Zip account</a>
          easily using Facebook, Paypal or Email address.
          Not sure what account to sign up for? See the difference between Zip Pay and Zip Money
          <a href="/au/zip" target="_blank">here.</a>
        </p>
        <p>
          (4) Subject to approval, Zip Pay will issue up to $1,000 credit.
        </p>
        <p>
          (5) Order is processed immediately. Zip Pay will pay on your behalf up to $1,000, the rest will be paid by your card.
        </p>
        <p>
          Note: the maximum purchase is $1,500 in an order using Zip Pay, where Zip Pay will pay up to a credit limit of $1,000
          and the remaining amount will be paid by you. For orders greater than $1,500, you will need to apply for Zip Money.
          Click on <a href="/au/zip" target="_blank">this link</a> to see the difference between Zip Pay and Zip Money.
        </p>
        <p>
          (6) Login to your Zip account and set up a repayment schedule that suits your lifestyle.
          Read more about Zip <a href="/au/zip" target="_blank">here.</a>
        </p>
      `;

    termsContainer.appendChild(terms);
  }, []);

  const handleZipLabelClick = useCallback(() => {
    // FIXME hotfix
    zipRef.current.querySelector('.zip-learn-more').click();
    // zipRef.current.querySelector('#zip-info-link .zip-learn-more').click();
    // zipRef.current.children[0].contentDocument.body.click();
  }, []);

  useEffect(() => {
    if (__ZIP_PUBLIC_KEY__ && zipRef.current) {
      // FIXME can use Script Component
      loadScript('https://static.zipmoney.com.au/lib/js/zm-widget-js/dist/zip-widget.min.js');
      const popupObserver = new MutationObserver((mutationList) => {
        mutationList.forEach((mutation) => {
          if (
            mutation.addedNodes &&
            mutation.addedNodes[0] &&
            mutation.addedNodes[0].className === 'zip-widget__popup__overlay'
          ) {
            const popupIframe = mutation.addedNodes[0].firstChild.firstChild;
            modifyPopup(popupIframe);
            popupIframe.onload = () => {
              modifyPopup(popupIframe);
            };
          }
        });
      });

      popupObserver.observe(document.body, { childList: true });
      return () => popupObserver.disconnect();
    }
  }, [modifyPopup, loadScript]);

  return [zipRef, handleZipLabelClick];
};

const usePrice = (props = {}) => {
  const { single } = props;
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const selectedVariants = useCurrentSelectedVariants();
  return useMemo(() => {
    let price = 0;
    let listPrice = 0;
    let singlePrice = 0;
    if (product && variant && variant.price !== undefined) {
      if (product.product_type === 'bundle') {
        price = product.bundle_options.reduce((result, option) => {
          const optionPriceModifier = selectedVariants[option.id]?.price_modifier || 0;
          return result + Number(optionPriceModifier) * option.default_quantity;
        }, +variant.price);

        listPrice = product.bundle_options.reduce((result, option) => {
          const optionPriceModifier = selectedVariants[option.id]?.price_modifier || 0;
          return result + Number(optionPriceModifier) * option.default_quantity;
        }, +variant.list_price);

        singlePrice = product.bundle_options.reduce((result, option) => {
          const optionPriceModifier = selectedVariants[option.id]?.price_modifier || 0;
          return result + Number(optionPriceModifier) * option.default_quantity;
        }, +variant.list_price);
      } else {
        price = +variant.price * (single ? 1 : product.min_sale_qty);
        listPrice = +variant.list_price * (single ? 1 : product.min_sale_qty);
        singlePrice = +variant.list_price;
      }
    }
    return { price, listPrice, singlePrice };
  }, [product, variant, selectedVariants, single]);
};

const useAFFIRM = () => {
  const { price, listPrice } = usePrice();
  useEffect(() => {
    if (__AFFIRM_ENABLED__) {
      if (!window.affirm) {
        loadAffirm();
      } else {
        window.affirm.ui.ready(() => {
          window.affirm.ui.refresh();
        });
      }
    }
  }, [price, listPrice]);
};

export { useZIP, useAFFIRM, usePrice };
