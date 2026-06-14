import React from 'react';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import style from './style.scss';

const Review = ({ className }) => (
  <div className={classNames(style.terms, className)}>
    {__YOTPO_ENABLED__ ? (
      <div className={`${style.terms}__container`}>
        <div>
          <h3 className={`${style.terms}__title`}>Review Guidelines</h3>
          <ul className={`${style.terms}__list`}>
            <li>Each review submitted is subject to approval to be published before credits are awarded.</li>
            <li>
              Each review submitted must be unique. The same text and image cannot be submitted for more than 1 review.
              If any image review submitted contains images already submitted in other reviews, that image review may
              not be approved or may only be given a text review reward (30 credits). Note: These image reviews must not
              violate any other guidelines.
            </li>
            <li>Image reviews must be original and feature your purchased item(s) in your interior space.</li>
            <li>Image reviews containing images taken from any Castlery marketing material may not be approved.</li>
            <li>Image reviews require at least 2 business days for approval.</li>
            <li>
              Castlery reserves the right not to publish reviews with content that is deemed irrelevant (not directly
              pertaining to the product), taken from Castlery's marketing material, fake, offensive, or defamatory.
            </li>
            <li>
              Castlery reserves the right to remove content (images or text) from an existing published review if later
              found to be violating any of our review guidelines.
            </li>
            <li>Castlery's decision with regards to submitted reviews is final.</li>
            <li>
              Castlery reserves the right to reject any review, withdraw or amend awarded credits for any customer
              subsequently found to be disqualified for any reason.
            </li>
            <li>
              By submitting a review (text and/or images), you agree to give consent for the review and its images to be
              used in Castlery's marketing channels and content.
            </li>
            <li>Castlery reserves the right to modify these guidelines at any time without prior notice.</li>
          </ul>
        </div>
        <div>
          <h3 className={`${style.terms}__title`}>Review Reward Terms & Conditions:</h3>
          <ul className={`${style.terms}__list`}>
            <li>30 credits will be awarded for a text review and 50 credits will be awarded for a photo review.</li>
            <li>Issued credits are non-transferable and are valid for 1 year from date of issue unless stated.</li>
            <li>
              Credits can be redeemed for vouchers, more details can be found{' '}
              <Link to={getUrl('promo-terms')}>here</Link>.
            </li>
            <li>Redeemed voucher can only be used per single order. </li>
            <li>Redeemed voucher is for one-time use only. </li>
            <li>Redeemed voucher can only be used with the minimum spend requirement stated.</li>
            <li>Redeemed voucher is not applicable for shipping fees and/or other charges.</li>
            <li>Redeemed voucher cannot be used with any other vouchers/promo codes.</li>
            <li>Redeemed voucher cannot be applied to past invoices.</li>
          </ul>
        </div>
      </div>
    ) : (
      <div className={`${style.terms}__container`}>
        <div>
          <h3 className={`${style.terms}__title`}>Review Guidelines</h3>
          <ul className={`${style.terms}__list`}>
            <li>Each review submitted is subject to approval to be published before voucher is awarded.</li>
            <li>
              Each review submitted must be unique. The same text & image cannot be submitted for more than 1 review. If
              any image review submitted contains images already submitted in other reviews, that image review may not
              be approved or may only be given a text review voucher. Note: These image reviews must not violate any
              other guidelines.
            </li>
            <li>Image reviews must be original and feature your purchased item(s) in your interior space.</li>
            <li>Image reviews containing images taken from any Castlery marketing material may not be approved.</li>
            <li>Image reviews require at least 2 business days for approval.</li>
            <li>
              Castlery reserves the right not to publish reviews with content that is deemed irrelevant (not directly
              pertaining to the product), taken from Castlery's marketing material, fake, offensive, or defamatory.
            </li>
            <li>
              Castlery reserves the right to remove content (images or text) from an existing published review if later
              found to be violating any of our review guidelines.
            </li>
            <li>Castlery's decision with regards to submitted reviews is final.</li>
            <li>
              Castlery reserves the right to reject any review, withdraw or amend vouchers for any customer subsequently
              found to be disqualified for any reason.
            </li>
            <li>
              By submitting a review (text and/or images), you agree to give consent for the review and its images to be
              used in Castlery's marketing channels and content.
            </li>
            <li>Castlery reserves the right to modify these guidelines at any time without prior notice.</li>
          </ul>
        </div>
        <div>
          <h3 className={`${style.terms}__title`}>Review Voucher Terms & Conditions:</h3>
          <ul className={`${style.terms}__list`}>
            <li>Voucher can only be used per single order.</li>
            <li>Voucher is for one-time use only.</li>
            <li>Voucher is non-transferable.</li>
            <li>Voucher is valid only for one year from date of issue.</li>
            <li>Voucher can only be used with the minimum spend requirement stated.</li>
            <li>Voucher is not applicable for shipping fees and/or other charges.</li>
            <li>Voucher cannot be used with any other vouchers/promo codes.</li>
            <li>Voucher cannot be applied to past invoices.</li>
          </ul>
        </div>
      </div>
    )}
  </div>
);
Review.propTypes = {
  className: PropTypes.string,
};

export default Review;
