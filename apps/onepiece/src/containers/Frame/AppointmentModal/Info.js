import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Form, { FloatInput, PhoneNumberInput } from 'components/Form';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import { Link } from 'react-router';
import classNames from 'classnames';
import { getUrl } from 'pages';
import config, { globalFeatureInUS } from 'config';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@connect((state) => ({
  user: state.auth.user,
}))
@withUseBreakpoints
export default class Info extends Component {
  static propTypes = {
    user: PropTypes.object,
    title: PropTypes.bool,
    confirmBtnText: PropTypes.string,
    confirmBtnStyle: PropTypes.string,
    showTerms: PropTypes.bool,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
    goToStep: PropTypes.func,
    submitInfo: PropTypes.func,
  };

  static defaultProps = {
    confirmBtnText: 'Confirm Appointment',
    confirmBtnStyle: 'btn-green',
    showTerms: false,
  };

  state = {
    processing: false,
    checked: false,
  };

  componentDidMount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    // autofocus on desktop to provide convenience to keyboard users
    if (desktop) {
      this.input.focus();
    }
  }

  toggleCheck() {
    this.setState((state) => ({
      checked: !state.checked,
    }));
  }

  submit(data) {
    const { frame } = this.context;
    const { checked } = this.state;
    const { showTerms, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (showTerms && !checked) {
      frame.openModal('response', {
        status: 'failed',
        title: 'Oops!',
        body: 'Please accept terms and conditions before confirm your RSVP.',
      });

      return;
    }

    // blur input on mobile to hide virtual keyboard
    if (!desktop) {
      const focusd = this.wrapper.querySelector('input:focus');
      if (focusd) {
        focusd.blur();
      }
    }

    this.setState({
      processing: true,
    });
    const request = this.context.submitInfo(data);
    request
      .then(() => this.context.goToStep('success'))
      .catch((error) => {
        this.setState({
          error: error?.errors?.[0]?.detail,
          processing: false,
        });
      });
    return request;
  }

  render() {
    const { user, title, confirmBtnText, confirmBtnStyle, showTerms } = this.props;
    const { processing, error, checked } = this.state;

    return (
      <div className={style.info} ref={(c) => (this.wrapper = c)}>
        {title && <div className={style.header}>Fill Your Information</div>}
        <Form formName="Appointment" onValidSubmit={this.submit.bind(this)} noValidate action="/">
          {error && <p className={`${style.info}__error`}>{error}</p>}
          <FloatInput
            type="text"
            name="firstname"
            autoCorrect="off"
            autoComplete="given-name"
            placeholder="First Name *"
            maxLength="32"
            icon={<ReactSVG name="avatar" />}
            value={user ? user.firstname : ''}
            refPassed={(c) => (this.input = c)}
            required
          />
          <FloatInput
            type="text"
            name="lastname"
            autoCorrect="off"
            autoComplete="family-name"
            placeholder="Last Name *"
            maxLength="32"
            icon={<ReactSVG name="avatar" />}
            value={user ? user.lastname : ''}
            required
          />
          <FloatInput
            type="email"
            name="email"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="email"
            placeholder="Email *"
            validations="isEmail"
            validationError="Please provide a valid email."
            icon={<ReactSVG name="email" />}
            value={user ? user.email : ''}
            required
          />
          {globalFeatureInUS ? (
            <PhoneNumberInput
              name="phone_number"
              autoCorrect="off"
              placeholder="Contact Number *"
              options={{
                numericOnly: true,
                blocks: [0, 3, 0, 3, 4],
                delimiters: ['(', ')', ' ', '-'],
              }}
              validations={{
                matchRegexp: config.phoneRegExp,
              }}
              validationError="Please provide a valid phone number."
              value={user && user.phone ? user.phone : ''}
              required
            />
          ) : (
            <FloatInput
              type="tel"
              name="phone_number"
              autoCorrect="off"
              autoComplete="tel"
              placeholder="Phone * (no space or dash)"
              validations={{
                matchRegexp: config.phoneRegExp,
              }}
              icon={<ReactSVG name="phone" />}
              validationError="Please provide a valid phone number."
              value={user && user.phone ? user.phone : ''}
              required
            />
          )}
          {showTerms && (
            <div className={`${style.info}__tnc`}>
              <button
                type="button"
                className={classNames('btn', { 'is-checked': checked })}
                onClick={this.toggleCheck.bind(this)}
              >
                By clicking Submit, you agree to our&nbsp;
                <Link to={getUrl('sales-and-refunds')} target="_blank">
                  terms and conditions
                </Link>{' '}
                and that you have read our&nbsp;
                <Link to={getUrl('privacy-policy')} target="_blank">
                  privacy policy
                </Link>
                .
              </button>
            </div>
          )}
          <div className={`${style.info}__submit`}>
            <input
              className={classNames('btn btn-block', confirmBtnStyle)}
              type="submit"
              disabled={processing}
              value={processing ? ' ' : confirmBtnText}
            />
            {processing && <Spinner small />}
          </div>
        </Form>
      </div>
    );
  }
}
