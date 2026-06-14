import React, { useMemo } from 'react';
import ReactSVG from 'components/ReactSVG';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import { useCurrentProduct, useCurrentVariant } from '../hooks/product';

const Delivery = () => (
  <>
    View full{' '}
    <Link className="feature-list__content--underline" to={getUrl('delivery')} target="_blank">
      Delivery Policy
    </Link>{' '}
    here
  </>
);
const Returns = () => (
  <>
    <Link className="feature-list__content--underline" to={getUrl('sales-and-refunds')} target="_blank">
      Terms and Conditions
    </Link>{' '}
    apply
  </>
);

const getUSPs = (clearance = false, variant, product) => {
  let isHidden = false;
  if (product.product_type !== 'bundle' && variant?.is_customized) {
    isHidden = true;
  }
  return {
    US: [
      {
        name: 'Delivery calculated per shipment*',
        desc: <Delivery />,
        // name: 'Flat Rate Shipping*',
        // desc: 'Delivery calculated per shipment',
        icon: 'new-usp-car',
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Pay Later' : isHidden ? '' : '30-Day Returns*',
        desc: clearance ? 'With monthly installments' : <Returns />,
        icon: clearance ? 'usp-pay-now' : isHidden ? 'usp-customization' : 'usp-box',
      },
    ],
    SG: [
      {
        name: 'Free Delivery Above $300',
        desc: <Delivery />,
        // name: 'Free Delivery',
        // desc: 'Over $300*',
        icon: 'new-usp-car',
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Instalment' : isHidden ? '' : '30-Day Returns',
        desc: clearance ? 'On orders over $500' : <Returns />,
        icon: clearance ? 'usp-pay-now' : isHidden ? 'usp-customization' : 'usp-box',
      },
    ],
    AU: [
      {
        name: 'Delivery calculated per shipment*',
        desc: <Delivery />,
        icon: 'new-usp-car',
        id: 'pdp-shipping-usp',
      },
      {
        name: clearance ? 'Instalment' : isHidden ? '' : '30-Day Returns',
        desc: clearance ? 'On orders up to $5000' : <Returns />,
        icon: clearance ? 'usp-pay-now' : isHidden ? 'usp-customization' : 'usp-box',
      },
    ],
    CA: [
      {
        name: 'Delivery calculated per shipment*',
        desc: <Delivery />,
        icon: 'new-usp-car',
        id: 'pdp-shipping-usp',
      },
      !clearance && {
        name: isHidden ? '' : '30-Day Returns',
        desc: <Returns />,
        icon: isHidden ? 'usp-customization' : 'usp-box',
      },
    ],
    UK: [
      // todo: just for testing, need to be checked @carl
      {
        name: 'Delivery calculated per shipment*',
        desc: <Delivery />,
        icon: 'new-usp-car',
        id: 'pdp-shipping-usp',
      },
      !clearance && {
        name: isHidden ? '' : '30-Day Returns',
        desc: <Returns />,
        icon: isHidden ? 'usp-customization' : 'usp-box',
      },
    ],
  };
};

const ProductUSP = () => {
  const variant = useCurrentVariant();
  const product = useCurrentProduct();
  const clearance = useMemo(() => variant?.tags?.some((i) => i.toLowerCase() === 'clearance'), [variant]);
  const usps = getUSPs(clearance, variant, product)[__COUNTRY__] || [];
  return (
    <>
      {usps.map((usp, i) => (
        <div key={i} className="feature-list">
          <div className="feature-list__icon">
            <ReactSVG name={usp.icon} style={{ width: '20px', height: '20px' }} />
          </div>
          <div className="feature-list__desc" id={usp.id}>
            <div>{usp.name}</div>
            <div className="feature-list__content">{usp.desc}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductUSP;
