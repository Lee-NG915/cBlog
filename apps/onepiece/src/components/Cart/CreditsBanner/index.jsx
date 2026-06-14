import React from 'react';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import PropTypes from 'prop-types';
import style from '../style.scss';

const CreditsBanner = ({ points }) => {
  if (!points || points < 50) return null;

  return (
    <div className={`${style.body}__points`}>
      <Link href={`${__BASE_URL__}/the-castlery-club`}>
        You have <span>{points} credits</span>! Redeem your voucher here.
      </Link>
    </div>
  );
};
CreditsBanner.propTypes = {
  points: PropTypes.number,
};
export default React.memo(CreditsBanner);
