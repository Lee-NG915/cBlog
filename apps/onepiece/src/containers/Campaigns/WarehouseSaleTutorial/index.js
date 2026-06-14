/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
import { getUrl } from 'pages';

import style from './style.scss';

@wrapPage({ border: true })
export default class WarehouseSaleTutorial extends React.PureComponent {
  render() {
    const steps = [
      {
        text: <p>Sign in or Create your Castlery Account.</p>,
        images: ['https://res.cloudinary.com/castlery/image/upload/v1542959125/marketing/SG/201811/step1.jpg'],
      },
      {
        text: (
          <p>
            <b>Search</b> an item with <b>Serial No.</b> (shown on the price tag)
          </p>
        ),
        images: ['https://res.cloudinary.com/castlery/image/upload/v1542959124/marketing/SG/201811/step2.jpg'],
      },
      {
        text: (
          <p>
            Read product description and <b>Add to cart</b>.
          </p>
        ),
        images: ['https://res.cloudinary.com/castlery/image/upload/v1542959125/marketing/SG/201811/step3.jpg'],
      },
      {
        text: (
          <p>
            Proceed to <b>check out</b> an item one at a time <b>ASAP</b>. Item availability is not guaranteed until order is complete.
          </p>
        ),
        images: ['https://res.cloudinary.com/castlery/image/upload/v1542959125/marketing/SG/201811/step4.jpg'],
      },
      {
        text: <p>If an error occurs, it means that the item is no longer available. Please remove it from cart in order to proceed.</p>,
        images: ['https://res.cloudinary.com/castlery/image/upload/v1542964938/marketing/SG/201811/step5.jpg'],
      },
      {
        text: <p>Key in payment details. We accept credit card, paypal and instalment!</p>,
        images: ['https://res.cloudinary.com/castlery/image/upload/v1553852155/marketing/SG/201903/step6.png'],
      },
      {
        text: <p>Please select your delivery slot. All as-is and clearance item sold in warehouse sale must be delivered with 14 days.</p>,
        images: [
          'https://res.cloudinary.com/castlery/image/upload/v1553857417/marketing/SG/201903/step7.jpg',
          'https://res.cloudinary.com/castlery/image/upload/v1553858017/marketing/SG/201903/step8.png',
        ],
      },
    ];

    return (
      <div className={style.wrapper}>
        <h1>How to Shop Castlery Warehouse Clearance</h1>
        {steps.map((s, index) => (
          <div key={index} className={style.step}>
            <h2>Step {index + 1}</h2>
            {s.text}

            {s.images.map(image => (
              <div>
                <ReactPicture
                  srcset={image}
                  alt={`step ${index + 1}`}
                  loader={{ height: 250,widths: [300], sizes:'300px' }}
                  lazy={false}
                />
              </div>
            ))}
          </div>
        ))}
        <div className={style.note}>
          <h2>Important Note:</h2>
          <ul>
            <li>No refund, exchange or cancellation.</li>
            <li>No warranty on all items sold.</li>
            <li>Item availability is not guaranteed until order completion.</li>
            <li>Free Delivery on all orders</li>
            <li>Items must be delivered within 14 days after purchase.</li>
            <li>
              If you have placed multiple orders during the warehouse sale, all orders will be merged into the same delivery slot you have selected in
              your first order.
            </li>
            <li>Castlery reserves the rights to extend the delivery lead-time.</li>
            <li>
              You’re responsible to read full T&Cs at <Link to={getUrl('promo-terms')}>Promo Terms page</Link>.
            </li>
          </ul>
        </div>
        <div className={style.search}>
          <Link to={getUrl('as-is')} type="button" className="btn btn-primary">
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }
}
