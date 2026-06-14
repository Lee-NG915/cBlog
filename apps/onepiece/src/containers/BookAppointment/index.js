import React, { Component } from 'react';

import { wrapPage } from 'utils/page';
import Helmet from 'components/Helmet';
import Appointment from '../Frame/AppointmentModal/Appointment';
import style from './style.scss';

@wrapPage()
export default class BookAppointment extends Component {
  render() {
    return (
      <div className={style.bookAppointment}>
        <Helmet
          path={this.props.location.pathname}
          page={{
            title: 'Book Appointment',
          }}
        />
        <Appointment initialStudio={this.props.params.slug} />
      </div>
    );
  }
}
