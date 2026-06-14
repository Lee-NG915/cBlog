import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { trackSubscription } from 'utils/tracking';
// import { set as setCookie } from 'helpers/Cookie';
import { setSubscribed } from 'utils/cookies';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { hideSubscriptionBar } from 'redux/modules/subscriptionBar';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import { randomId } from 'utils/number';
import style from './style.scss';

@connect(
  (state) => ({
    user: state.auth.user,
  }),
  {
    hideSubscriptionBar,
    trackFormSubmit: (result) => (dispatch) => dispatch({ type: EVENT_FORM_SUBMIT, result }),
  }
)
export default class Input extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onSuccess: PropTypes.func,
    hideSubscriptionBar: PropTypes.func,
    type: PropTypes.string,
    isUsedInPDP: PropTypes.bool,
    trackFormSubmit: PropTypes.func,
  };

  static defaultProps = {
    isUsedInPDP: false,
  };

  static validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  state = {
    processing: false,
    error: '',
  };

  client = new ApiClient();

  onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value.trim();
    const { type, onSuccess, hideSubscriptionBar } = this.props;

    if (email === '') {
      this.setState({
        error: 'Please provide your email address.',
      });
    } else if (!Input.validateEmail(email)) {
      this.setState({
        error: 'Please provide a valid email.',
      });
    } else {
      this.setState({
        processing: true,
        error: '',
      });

      this.emailInput.blur();

      this.client
        .post('/subscriptions', {
          data: {
            source: type,
            email,
          },
        })
        .then(
          () => {
            this.setState({
              processing: false,
            });
            form.email.value = '';

            if (onSuccess) {
              onSuccess();
            }

            // set cookie to avoid future popup
            // setCookie('has_subscribed', JSON.stringify(true), 365);
            setSubscribed();

            if (hideSubscriptionBar) {
              hideSubscriptionBar({
                showOnProductPage: false,
                showOnHomePage: false,
              });
            }
            const eventId = randomId('NewsletterSubscription');

            /* record signup newsletter event */
            trackSubscription(email, { eventId });

            this.props.trackFormSubmit({
              action: 'Newsletter Sign-up',
              label: this.props.user?.id,
              eventId,
              method: email,
            });
          },
          (err) => {
            this.setState({
              processing: false,
              error: err && err.errors && err.errors[0].detail,
            });
          }
        );
    }
  };

  render() {
    const { className, isUsedInPDP } = this.props;
    const { processing, error } = this.state;

    return (
      <form
        action="/"
        onSubmit={this.onSubmit}
        noValidate
        className={classNames(className, style.form, {
          [`${style.pdpForm}`]: isUsedInPDP,
        })}
      >
        {error && <p className={`${style.form}__error`}>{error}</p>}
        {isUsedInPDP ? (
          <>
            <input
              className={`form-control ${style.pdpForm}__control `}
              type="email"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="email"
              ref={(c) => (this.emailInput = c)}
              name="email"
              disabled={processing}
              placeholder="Enter your email"
              aria-label="Enter your email to subscribe"
            />
            <input
              className={`btn btn-primary ${style.pdpForm}__control`}
              type="submit"
              disabled={processing}
              value="Subscribe Now"
            />
          </>
        ) : (
          <div className="input-group">
            <input
              className="form-control"
              type="email"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="email"
              ref={(c) => (this.emailInput = c)}
              name="email"
              disabled={processing}
              placeholder="Enter your email"
              aria-label="Enter your email to subscribe"
            />
            <span className="input-group-btn">
              <input type="submit" className="btn btn-primary" disabled={processing} value="Subscribe" />
            </span>
          </div>
        )}
      </form>
    );
  }
}
