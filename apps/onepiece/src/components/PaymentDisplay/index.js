import React from 'react';
import PropTypes from 'prop-types';

const PaymentDisplay = (props) => {
  const { payments, className } = props;

  return (
    <div className={className}>
      {payments.map((i, index) => (
        <p key={index}>{i.description}</p>
      ))}
    </div>
  );
};

PaymentDisplay.propTypes = {
  payments: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default PaymentDisplay;
