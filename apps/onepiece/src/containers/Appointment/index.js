import React from 'react';
import queryString from 'query-string';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import { Container } from '@castlery/fortress';
import Appointment from './appointment';
import style from './style.scss';

export default class Index extends React.Component {
  state = {
    loadingAppointment: true,
    error: '',
  };

  componentDidMount() {
    const { search } = this.props.location;
    const parsedResult = queryString.parse(search);
    this.loadAppointment(this.props.routeParams.id, parsedResult.phone_number);
  }

  client = new ApiClient();

  loadAppointment(id, phone_number) {
    this.setState({
      loadingAppointment: true,
      error: '',
    });

    const request = this.client.get(`/appointments/${id}`, {
      params: {
        phone_number,
      },
    });

    request
      .then((appointment) => {
        this.setState({
          loadingAppointment: false,
          appointment,
        });
      })
      .catch((error) => {
        this.setState({
          loadingAppointment: false,
          error: error.errors[0].detail,
        });
      });

    const request2 = this.client.post(`/appointments/${id}/show_up`, {
      params: {
        phone_number,
      },
    });

    request2
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        this.setState({
          loadingAppointment: false,
          error:
            error.errors[0].code === 42201
              ? 'Please present the QR code on your mobile phone upon arrival!'
              : error.errors[0].detail,
        });
      });
  }

  render() {
    if (!this.state.loadingAppointment) {
      if (this.state.appointment) {
        return (
          <div className={`${style.appointment}__container`}>
            <p>{this.state.error}</p>
            <Appointment appointment={this.state.appointment} location={this.props.location} />
          </div>
        );
      }
      return <Container>Appointment Not Found</Container>;
    }
    return (
      <div className={`${style.appointment}__loading`}>
        <Spinner />
      </div>
    );
  }
}
