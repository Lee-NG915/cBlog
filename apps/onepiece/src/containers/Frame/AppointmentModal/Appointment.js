import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ApiClient from 'helpers/ApiClient';
import ReactSVG from 'components/ReactSVG';
import { trackAppointment } from 'utils/tracking';
import { knightHost } from 'config';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

import Timing from './Timing';
import Info from './Info';
import Success from './Success';
import Intro from './Intro';

@withUseBreakpoints
export default class Appointment extends Component {
  static propTypes = {
    type: PropTypes.string,
    eventId: PropTypes.number,
    date: PropTypes.string, // starting date
    days: PropTypes.number,
    className: PropTypes.string,
    navigator: PropTypes.bool, // whether to show navigation
    title: PropTypes.bool, // whether to show title,
    studioTitle: PropTypes.string, // the title content
    studioBtnText: PropTypes.string,
    studioBtnStyle: PropTypes.string,
    confirmBtnText: PropTypes.string,
    confirmBtnStyle: PropTypes.string,
    onSuccess: PropTypes.func, // called after successfully booking appointment
    studioFilter: PropTypes.func,
    skipIntro: PropTypes.bool, // whether to skip the intro page
    initialStudio: PropTypes.string, // the slug of the initial selected studio
    pixelName: PropTypes.string,
    eventLabel: PropTypes.string,
    showTerms: PropTypes.bool,
    showCertainDay: PropTypes.bool,
    successBtnText: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static childContextTypes = {
    goToStep: PropTypes.func,
    setRetail: PropTypes.func,
    setSlot: PropTypes.func,
    submitInfo: PropTypes.func,
  };

  static defaultProps = {
    navigator: true,
    title: true,
    skipIntro: true,
    pixelName: 'Booking Appointment',
    eventLabel: 'bookAppointment',
  };

  client = new ApiClient();

  state = {
    step: this.props.skipIntro ? 'timing' : 'intro', // studio, timing, info, success, intro
    steps: [
      {
        name: 'timing',
        display: 'Choose Timing',
        component: Timing,
      },
      {
        name: 'info',
        display: 'Your Information',
        component: Info,
      },
    ],
    appointedOn: '',
    retailName: 'Jit Poh Studio',
    slotId: '',
  };

  getChildContext() {
    return {
      goToStep: this.goToStep,
      setSlot: this.setSlot,
      submitInfo: this.submitInfo,
      setRetail: this.setRetail,
    };
  }

  goToStep = (step) => {
    this.setState({
      step,
    });
  };

  setRetail = (id, name) => {
    this.setState({
      retailName: name,
    });
  };

  setSlot = (slotId, appointedOn) => {
    this.setState({
      slotId,
      appointedOn,
    });
  };

  submitInfo = (info) => {
    const { appointedOn, retailName, slotId } = this.state;
    const { eventId, eventLabel, pixelName } = this.props;

    const bookingInfo = {
      event_id: eventId,
      slot_id: slotId,
    };

    const request = this.client.post('/appointments', {
      auth: 'loose',
      data: {
        ...bookingInfo,
        ...info,
      },
    });

    request
      .then((result) => {
        // track lead event
        trackAppointment({
          eventLabel,
          pixelName,
          appointment: {
            appointment_date: Math.round(Date.parse(appointedOn) / 1000),
            studio: retailName,
            customer_name: `${info.firstname} ${info.lastname}`,
            customer_phone: info.phone_number,
            appointment_id: {
              value: result.id,
              url: `${knightHost}/appointments/${result.id}/edit`,
            },
          },
          customer: info,
        });
      })
      .catch((err) =>
        console.error(
          JSON.stringify(
            {
              message: 'Error submitting appointment information',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        )
      );

    return request;
  };

  render() {
    const { steps, step, appointedOn } = this.state;
    const {
      className,
      type,
      navigator,
      title,
      onSuccess,
      date,
      days,
      studioTitle,
      studioBtnText,
      studioBtnStyle,
      studioFilter,
      initialStudio,
      confirmBtnText,
      confirmBtnStyle,
      showTerms,
      eventId,
      showCertainDay,
      successBtnText,
      breakpoints = {},
    } = this.props;
    const { desktop } = breakpoints;

    const stepIndex = steps.findIndex((s) => s.name === step);
    let RenderedComponent;
    if (stepIndex === -1) {
      if (step === 'intro') {
        RenderedComponent = Intro;
      } else {
        RenderedComponent = Success;
      }
    } else {
      RenderedComponent = steps[stepIndex].component;
    }

    return (
      <div className={classNames(style.appointment, className)}>
        {navigator && stepIndex > -1 && (
          <div className={style.navigator}>
            {desktop ? (
              steps.map((s, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => this.goToStep(s.name)}
                  disabled={index >= stepIndex}
                  tabIndex="0"
                  className={classNames('btn', {
                    'is-selected': index === stepIndex,
                  })}
                >
                  {s.display}
                </button>
              ))
            ) : (
              <div className={`${style.navigator}__wrapper`}>
                {steps.map((s, index) => (
                  <div
                    key={index}
                    className={classNames(
                      `${style.navigator}__step`,
                      { 'is-selected': index === stepIndex },
                      { 'is-disabled': index > stepIndex }
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => this.goToStep(s.name)}
                      disabled={index >= stepIndex}
                      className="btn"
                    >
                      {index >= stepIndex ? index + 1 : <ReactSVG name="check" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <RenderedComponent
          type={type}
          title={title}
          slot={appointedOn}
          eventId={eventId}
          onSuccess={onSuccess}
          studioTitle={studioTitle}
          studioBtnText={studioBtnText}
          studioBtnStyle={studioBtnStyle}
          confirmBtnText={confirmBtnText}
          confirmBtnStyle={confirmBtnStyle}
          studioFilter={studioFilter}
          showTerms={showTerms}
          initialStudio={initialStudio}
          date={date}
          days={days}
          showCertainDay={showCertainDay}
          successBtnText={successBtnText}
        />
      </div>
    );
  }
}
