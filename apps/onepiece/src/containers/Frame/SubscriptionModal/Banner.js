import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { connect } from 'react-redux';
import Form, { FloatInput } from 'components/Form';
import ApiClient from 'helpers/ApiClient';
import { trackSignUpNewsletter } from 'utils/tracking';
import Spinner from 'components/Spinner';
import { hideSubscriptionBar } from 'redux/modules/subscriptionBar';
import { renderImage } from 'utils/image';
import { setSubscribed } from 'utils/cookies';
import { withUseBreakpoints } from 'utils/page';
import { globalFeatureInSG } from 'config';
import style from './style.scss';

@connect(
  (state) => ({
    showOnProductPage: state.subscriptionBar.showOnProductPage,
    geolocation: state.geolocation.data,
    menu: state.marketing.menu,
  }),
  { hideSubscriptionBar }
)
@withUseBreakpoints
class SubscriptionBanner extends React.Component {
  static contextTypes = {
    frame: PropTypes.object,
  };

  static propTypes = {
    onClose: PropTypes.func,
    showOnProductPage: PropTypes.bool,
    hideSubscriptionBar: PropTypes.func,
    geolocation: PropTypes.object,
    menu: PropTypes.object,
    type: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  state = {
    processing: false,
    error: '',
  };

  client = new ApiClient();

  getValidBlock() {
    const { geolocation, menu } = this.props;
    if (menu && menu.data?.subscription?.blocks) {
      const { blocks } = menu.data.subscription;
      let validBlock = [];
      if (globalFeatureInSG) {
        validBlock = blocks;
      } else {
        validBlock = blocks.find(
          (block) =>
            !block.region_code ||
            block.region_code.length === 0 ||
            (geolocation.region_code &&
              block.region_code.some((code) => code.toLowerCase() === geolocation.region_code.toLowerCase()))
        );
      }
      return validBlock;
    }
  }

  submit = (data) => {
    const { type, hideSubscriptionBar, breakpoints = {} } = this.props;
    const { frame } = this.context;
    const { desktop } = breakpoints;
    this.setState({
      processing: true,
    });

    if (!desktop) {
      this.input.blur();
    }

    data.source = type;
    const request = this.client.post('/subscriptions', {
      data,
    });
    request.then(
      () => {
        this.setState({
          processing: false,
        });

        // set cookie to avoid future popup
        frame.openModal('response', {
          status: 'successful',
          title: 'Thank you!',
          body: 'You have successfully subscribed to the newsletter.',
        });
        // setCookie('has_subscribed', JSON.stringify(true), 365);
        setSubscribed();
        hideSubscriptionBar({
          showOnProductPage: false,
          showOnHomePage: false,
        });
        trackSignUpNewsletter(data.email);
      },
      (error) => {
        this.setState({
          processing: false,
          error: error.errors[0].detail,
        });
      }
    );
    return request;
  };

  render() {
    const { onClose, showOnProductPage } = this.props;
    const { processing, error } = this.state;
    if (!onClose && !showOnProductPage) {
      return null;
    }

    const validBlock = this.getValidBlock();

    if (!validBlock) {
      return null;
    }

    return (
      <div className={style.banner} style={{ backgroundColor: validBlock.background_color }}>
        <div className={`${style.banner}__promotions`}>
          {renderImage(validBlock.image_url, 0.26667, 0.5, {
            alt: validBlock.title,
          })}
        </div>
        <div className={`${style.banner}__form`}>
          {error && <p className={`${style.banner}__form-error`}>{error}</p>}
          <Form
            formName="Newsletter Sign-up"
            onValidSubmit={this.submit}
            className={`${style.banner}__form-container`}
            noValidate
            action="/"
          >
            <FloatInput
              className={`${style.banner}__form-floatInput`}
              type="email"
              name="email"
              refPassed={(c) => (this.input = c)}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="email"
              placeholder="Email *"
              icon={<ReactSVG name="email" />}
              validations="isEmail"
              validationError="Please provide a valid email."
              required
            />
            <div className={`${style.banner}__form-submit`}>
              <input
                style={{ color: validBlock.background_color }}
                className="btn btn-white btn-small"
                type="submit"
                disabled={processing}
                value={processing ? ' ' : 'Subscribe'}
              />
              {processing && <Spinner small />}
            </div>
          </Form>
        </div>
        {onClose && (
          <button type="button" className={`${style.banner}__close btn`} onClick={onClose}>
            <ReactSVG name="close" />
          </button>
        )}
      </div>
    );
  }
}

export default SubscriptionBanner;
