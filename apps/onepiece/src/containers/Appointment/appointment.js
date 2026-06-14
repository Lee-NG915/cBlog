import React from 'react';
import PropTypes from 'prop-types';
import { getDate } from 'utils/time';

export default class Appointment extends React.Component {
  static propTypes = {
    appointment: PropTypes.object.isRequired,
  };

  render() {
    const { appointment } = this.props;
    return (
      appointment && (
        <div>
          <h1>Appointment Details</h1>
          <p>{`Appointment: ${getDate(appointment.appointed_on).format('MMM D, h:mm a')}`}</p>
          <p>Email: {appointment.email}</p>
          <p>
            Name: {appointment.firstname} {appointment.lastname}
          </p>
          <p>Phone: {appointment.phone_number}</p>
        </div>
      )
    );
  }
}
