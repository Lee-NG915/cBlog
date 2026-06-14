import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import ApiClient from 'helpers/ApiClient';
import ReactSVG from 'components/ReactSVG';
import { connect } from 'react-redux';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import config from 'config';
import style from './style.scss';

@connect(null, {
  trackFormSubmit: (result) => (dispatch) => dispatch({ type: EVENT_FORM_SUBMIT, result }),
})
export default class HomeOwnersModal extends Component {
  static animation = 'plain';

  static propTypes = {
    estate: PropTypes.string.isRequired,
    trackFormSubmit: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  client = new ApiClient();

  input = createRef();

  state = {
    loading: false,
    error: '',
  };

  close = (e) => {
    const { frame } = this.context;
    if (e.target === e.currentTarget) {
      frame.removeModal();
    }
  };

  onInput = () => {
    const { error } = this.state;
    if (error) {
      this.setState({ error: '' });
    }
  };

  submit = (e) => {
    e.preventDefault();
    const val = this.input.current.value.trim();
    const { frame } = this.context;
    const { estate, userId } = this.props;
    const { loading } = this.state;
    if (val && !loading) {
      this.setState({ loading: true, error: '' });
      this.client
        .post(config.enableNewPromotion ? 'api/v1/estates/registrations' : '/estates/registrations', {
          // auth: 'loose',
          data: {
            estate,
            email: val,
          },
        })
        .then((res) => {
          if (config.enableNewPromotion && res.code !== 0) {
            this.setState({
              loading: false,
              error: res?.msg || 'error',
            });
            return;
          }
          frame.removeModal();
          this.setState({ loading: false });
          setTimeout(() => {
            frame.openModal('response', {
              status: 'successful',
              title: 'Thank You!',
              body: 'Check your inbox for the promo code!',
            });
          });

          this.props.trackFormSubmit({
            action: 'New Homeowners',
            label: estate,
            method: val,
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
            error: Array.isArray(e.errors) ? e.errors[0]?.detail : 'error',
          });
        });
    }
  };

  render() {
    const { loading, error } = this.state;
    const { estate } = this.props;
    const { frame } = this.context;
    return (
      <div className={style.homeOwners} onClick={this.close}>
        <div className={`${style.homeOwners}__container`}>
          <div className={`${style.homeOwners}__container-head`}>New Homeowners Special</div>
          <div className={`${style.homeOwners}__container-intro`}>
            – <span>{estate}</span> –
          </div>
          <form className={`${style.homeOwners}__container-input`} onSubmit={this.submit}>
            <input
              ref={this.input}
              placeholder="Enter your email"
              aria-label="Enter your email to subscribe"
              onInput={this.onInput}
            />
            <button
              type="submit"
              disabled={loading || (error && error.length)}
              className={`btn ${style.homeOwners}__container-input-btn`}
              style={{ color: loading ? '#a45b37' : '#fff' }}
            >
              Get Promo Code
              {loading ? <Spinner small /> : null}
            </button>
          </form>
          {error && error.length > 0 ? <div className={`${style.homeOwners}__container-error`}>{error}</div> : null}
          <div className={`${style.homeOwners}__container-foot`}>
            By signing up, you consent to receiving marketing content from Castlery. You can unsubscribe anytime.
          </div>
          <button
            type="button"
            className={classNames('btn', `${style.homeOwners}__close`)}
            onClick={() => frame.removeModal()}
          >
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    );
  }
}
