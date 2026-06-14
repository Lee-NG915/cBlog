import React from 'react';
import Banner from 'components/Banner';
import PropTypes from 'prop-types';
import ProductList from 'components/ProductList';
import style from './style.scss';
import { quizConfig } from '../config';

const QuizResults = ({ quizKey }) => {
  const quizObj = quizConfig[quizKey];

  if (!quizObj) {
    return null;
  }

  return (
    <div className={style.quizResults}>
      <Banner
        className={`${style.quizResults}__banner`}
        mediaQueries={[
          {
            breakpoint: 'xs',
            srcset: quizObj.image_small,
            loader: { ratio: 1.0512 },
          },
          {
            breakpoint: 'lg',
            srcset: quizObj.image_large,
            loader: { ratio: 0.4172 },
          },
        ]}
        title="Discover Your Self-Care Routine"
        showMask
      >
        <div className={`${style.quizResults}__banner__text`}>
          <div className={`${style.quizResults}__banner__text__title`}>{quizObj.title}</div>
          <div className={`${style.quizResults}__banner__text__desc`}>{quizObj.description}</div>
        </div>
      </Banner>

      <div className={`${style.quizResults}__products`}>
        <ProductList products={quizObj.productsId[__COUNTRY__]} type="new" isUsedInPDP />
      </div>
    </div>
  );
};
QuizResults.propTypes = {
  quizKey: PropTypes.string,
};

export default QuizResults;
