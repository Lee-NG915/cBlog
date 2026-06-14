import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { getDate } from 'utils/time';
import { Link } from 'react-router';
import { getUrl } from 'pages';

import style from './style.scss';

export default class Success extends Component {
  static propTypes = {
    slot: PropTypes.string,
    onSuccess: PropTypes.func,
    successBtnText: PropTypes.string,
  };

  render() {
    const { slot, onSuccess, successBtnText } = this.props;

    return (
      <div className={style.success}>
        <ReactSVG name="check-circle" />
        <h3>
          <span>Thank you!</span>
          <br />
          See you on <strong>{getDate(slot).format('ddd, MMM D @ h:mm a')}</strong>
        </h3>
        <hr />
        <p>
          Don’t worry about forgetting – we’ll send you a reminder email and SMS a few hours before your appointment.
        </p>
        {onSuccess && (
          <button type="button" className="btn btn-green" onClick={() => onSuccess()}>
            {successBtnText || 'Continue Shopping'}
          </button>
        )}
        <div className={`${style.success}__remind`}>
          *Kindly be reminded that Castlery reserves the right to refuse future bookings in the event of a no-show. If
          you are unable to make it for the workshop, please reach out to us <Link to={getUrl('contact-us')}>here</Link>{' '}
          to cancel your appointment.
        </div>
      </div>
    );
  }
}
