import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Formsy from 'formsy-react';
import { FloatInput, Checkbox } from 'components/Form';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ApiClient from 'helpers/ApiClient';
import { update as updateUser } from 'redux/modules/auth';
import { loadIfNeeded as loadSubscription, update as updateSubscription } from 'redux/modules/subscription';
import { Button } from 'components/Button';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@connect(
  (state) => ({
    auth: state.auth,
    subscription: state.subscription,
  }),
  { updateUser, loadSubscription, updateSubscription }
)
@withUseBreakpoints
export default class Profile extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    updateUser: PropTypes.func.isRequired,
    subscription: PropTypes.object.isRequired,
    loadSubscription: PropTypes.func.isRequired,
    updateSubscription: PropTypes.func.isRequired,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    changePassword: false,
  };

  client = new ApiClient();

  componentDidMount() {
    const { loadSubscription, breakpoints = {} } = this.props;
    const { frame } = this.context;
    const { desktop } = breakpoints;
    // autofocus on desktop to provide convenience to keyboard users
    if (desktop) {
      this.firstInput.focus();
    }

    loadSubscription().catch((error) => {
      frame.openModal('response', { body: error });
    });
  }

  submit = (data) => {
    const { updateUser, updateSubscription, breakpoints = {} } = this.props;
    const { frame } = this.context;
    const { desktop } = breakpoints;

    // blur input on mobile to hide virtual keyboard
    if (!desktop) {
      const focusd = this.wrapper.querySelector('input:focus');
      if (focusd) {
        focusd.blur();
      }
    }

    const passedData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    };

    const isSub = data.subscribed;

    if (data.old_password && data.new_password) {
      passedData.password = data.old_password;
      passedData.new_password = data.new_password;
    }

    Promise.all([updateUser(passedData), updateSubscription(isSub)])
      .then(() => {
        this.setState({
          changePassword: false,
        });

        frame.openModal('response', {
          status: 'successful',
          title: 'Success!',
          body: 'Your changes have been successfully saved.',
        });
      })
      .catch((error) => {
        frame.openModal('response', { body: error });
      });
  };

  togglePassword() {
    // this.setState({
    //   changePassword: !this.state.changePassword,
    // });
    this.setState((last) => ({ changePassword: !last.changePassword }));
  }

  render() {
    const avatarIcon = <ReactSVG name="avatar" />;
    const emailIcon = <ReactSVG name="email" />;
    const lockIcon = <ReactSVG name="lock" />;

    const { auth, subscription } = this.props;
    const { changePassword } = this.state;

    const { user = {} } = auth;
    const isSub =
      subscription.data &&
      subscription.data.message_groups.some((g) => g.name === 'promotions' && g.deliver_types.email);
    const loading = auth.loading || subscription.loading;
    const processing = auth.processing || subscription.processing;

    return (
      <div className={style.profile} ref={(c) => (this.wrapper = c)}>
        <h1 className={style.header}>Edit Your Profile</h1>

        <Formsy onValidSubmit={this.submit} noValidate action="/">
          <div className="row">
            <div className="col-xs-12 col-lg-6">
              <FloatInput
                type="text"
                name="firstname"
                autoCorrect="off"
                autoComplete="given-name"
                placeholder="First Name *"
                maxLength="32"
                icon={avatarIcon}
                value={user.firstname}
                refPassed={(c) => (this.firstInput = c)}
                required
              />
            </div>
            <div className="col-xs-12 col-lg-6">
              <FloatInput
                type="text"
                name="lastname"
                autoCorrect="off"
                autoComplete="family-name"
                placeholder="Last Name *"
                maxLength="32"
                icon={avatarIcon}
                value={user.lastname}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-lg-6">
              <FloatInput
                type="email"
                name="email"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="email"
                placeholder="Email *"
                validations="isEmail"
                validationError="Please provide a valid email."
                icon={emailIcon}
                value={user.email}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-lg-12">
              <div className={`${style.profile}__password`}>
                <div className="clearfix">
                  <a
                    className={classNames(`${style.profile}__password__header`, {
                      'is-shown': changePassword,
                    })}
                    onClick={this.togglePassword.bind(this)}
                  >
                    <span>Change Password</span>
                    <div>
                      <ReactSVG name="arrow-down" />
                    </div>
                  </a>
                </div>
                {changePassword && (
                  <div
                    className={classNames(`${style.profile}__password__body`, {
                      'is-hidden': !changePassword,
                    })}
                  >
                    <div className="row">
                      <div className="col-xs-12 col-lg-6">
                        <FloatInput
                          name="old_password"
                          placeholder="Old Password *"
                          autoComplete="current-password"
                          type="password"
                          icon={lockIcon}
                          value=""
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12 col-lg-6">
                        <FloatInput
                          name="new_password"
                          placeholder="New Password *"
                          autoComplete="new-password"
                          type="password"
                          icon={lockIcon}
                          value=""
                          required
                        />
                      </div>
                      <div className="col-xs-12 col-lg-6">
                        <FloatInput
                          name="confirm_password"
                          placeholder="Confirm New Password *"
                          autoComplete="new-password"
                          type="password"
                          validations="equalsField:new_password"
                          validationError="Please make sure your passwords match."
                          icon={lockIcon}
                          value=""
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`${style.profile}__setting`}>
                <Checkbox
                  name="subscribed"
                  value={!!isSub}
                  label="I'd like to receive promotion emails from Castlery"
                />
              </div>
              <div className={style.submit}>
                {/* <input
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={loading || processing}
                  value={loading || processing ? ' ' : 'Save'}
                />
                {(loading || processing) && <Spinner small />} */}
                <Button
                  type="submit"
                  text="Save"
                  disabled={loading || processing}
                  loading={loading || processing}
                  width={120}
                  size="medium"
                />
              </div>
            </div>
          </div>
          {__FRIENDBUY_ENABLED__ && (
            <div className={`${style.profile}__friendbuy`}>
              <div id="friendbuyaccount" />
            </div>
          )}
          {(loading || processing) && (
            <div className={`${style.profile}__mask`}>
              <Spinner />
            </div>
          )}
        </Formsy>
      </div>
    );
  }
}
