import React from 'react';
import PropTypes from 'prop-types';
import Workshop from './Workshop';
import style from './style.scss';

const SignUp = ({ events }) => (
  <div className={`${style.signUp}`}>
    <div className={`${style.signUp}__wrapper`}>
      <div className={`${style.signUp}__wrapper__event`}>
        <div className={`${style.signUp}__title`}>Wellness Weekend at Orchard Flagship</div>
        <div className={`${style.signUp}__line`} />
        <div className={`${style.signUp}__description`}>
          Stay present in the moment through a series of curated events, happening on
        </div>
        <div className={`${style.signUp}__date`}>March 25 & 26</div>
      </div>

      {events?.map((workshop, index) => (
        <Workshop workshop={workshop} key={index} rowReverse={index % 2 === 1} border />
      ))}
    </div>
  </div>
);
SignUp.propTypes = {
  events: PropTypes.array,
};

export default SignUp;
