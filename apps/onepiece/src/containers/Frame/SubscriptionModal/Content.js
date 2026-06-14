import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ApiClient from 'helpers/ApiClient';
import Form, { FloatInput } from 'components/Form';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import { trackSignUpNewsletter } from 'utils/tracking';
import { setSubscribed } from 'utils/cookies';
// import { set as setCookie } from 'helpers/Cookie';
import { ternaryExpressions } from 'utils/ternaryExpression';
import { withUseBreakpoints } from 'utils/page';
import { globalFeatureInSG, globalFeatureInUS } from 'config';
import bgDesktopUS from './bg-desktop-us.jpg';
import bgDesktopSG from './bg-desktop-sg.jpg';
import bgMobileSG from './bg-mobile-sg.jpg';
import bgDesktop from './bg-desktop.jpg';
import bgMobile from './bg-mobile.jpg';
import style from './style.scss';

@connect(
  (state) => ({
    user: state.auth.user,
  }),
  null
)
@withUseBreakpoints
export default class Content extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    intro: PropTypes.string,
    type: PropTypes.string,
    close: PropTypes.func.isRequired,
    user: PropTypes.object,
    zipcode: PropTypes.string,
    bannerDesktop: PropTypes.string,
    bannerMobile: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  state = {
    processing: false,
    error: '',
    success: false,
  };

  client = new ApiClient();

  isZipcodeFailurePopup = () => {
    const { type } = this.props;
    return type === 'ZIPCODE_FAILURE_POPUP';
  };

  submit = (data) => {
    const { type, zipcode, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    this.setState({
      processing: true,
    });

    if (!desktop) {
      this.input.blur();
    }

    data.source = type;
    if (zipcode) {
      data.extra = {
        zipcode,
      };
    }
    const request = this.client.post('/subscriptions', {
      data,
    });
    request.then(
      () => {
        this.setState({
          processing: false,
          success: true,
        });

        // set cookie to avoid future popup
        // setCookie('has_subscribed', JSON.stringify(true), 365);
        setSubscribed();
        trackSignUpNewsletter(data.email);
      },
      (error) => {
        if (error && error.errors[0] && error.errors[0].code === 40016 && this.isZipcodeFailurePopup()) {
          this.setState({
            processing: false,
            success: true,
          });
        } else {
          this.setState({
            processing: false,
            error: error && error.errors && error.errors[0].detail,
          });
        }
      }
    );
    return request;
  };

  render() {
    const { title, intro, close, type, user, bannerDesktop, bannerMobile, breakpoints = {} } = this.props;
    const { processing, error, success } = this.state;
    const { desktop } = breakpoints;
    const POPUP_CONTENT = {
      ZIPCODE_FAILURE_POPUP: {
        title: 'Sorry, we currently do not ship to your specific area',
        intro: 'Subscribe and get notified when we support shipping to your area.',
      },
      EXIT_INTENT: {
        title: ternaryExpressions(globalFeatureInSG, `Let's Get Comfy.`, `Browse more later.`),
        intro: ternaryExpressions(
          globalFeatureInSG,
          `Subscribe with us today to get in on the latest offers, news and inspo to make home better!`,
          `Stay in touch with exclusive deals, new arrivals & more.`
        ),
      },
    };

    const titleDisplay = title || POPUP_CONTENT[type].title;
    const introDisplay = intro || POPUP_CONTENT[type].intro;
    const imgDesktop =
      bannerDesktop ||
      ternaryExpressions(globalFeatureInSG, bgDesktopSG, () =>
        ternaryExpressions(globalFeatureInUS, bgDesktopUS, bgDesktop)
      );
    const imgMobile = bannerMobile || (globalFeatureInSG ? bgMobileSG : bgMobile);

    if (success) {
      if (this.isZipcodeFailurePopup()) {
        return (
          <div className={style.success}>
            <ReactSVG name="check-circle" />
            <h3>Success!</h3>
            <hr />
            <p>We will email you when we support shipping to your area.</p>
            <button type="button" className="btn btn-primary" onClick={() => close()}>
              Continue
            </button>
          </div>
        );
      }
      return (
        <div className={style.success}>
          <ReactSVG name="check-circle" />
          <h3>Thank you!</h3>
          <hr />
          <p>You have successfully subscribed to the newsletter.</p>
          <button type="button" className="btn btn-primary" onClick={() => close()}>
            Continue Shopping
          </button>
        </div>
      );
    }
    let info = (
      <div className={`${style.content}__info`}>
        {titleDisplay && <h3>{titleDisplay}</h3>}
        {introDisplay && <p dangerouslySetInnerHTML={{ __html: introDisplay }} />}
        <Form formName="Newsletter Sign-up" onValidSubmit={this.submit} className={style.form} noValidate action="/">
          <FloatInput
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
          {error && <p className={`${style.form}__error`}>{error}</p>}
          <div className={`${style.content}__no-spam`}>
            {globalFeatureInUS ? '' : `We promise good vibes only, none of that spam stuff.`}
          </div>
          <div className={`${style.form}__submit`}>
            <input
              className="btn btn-primary btn-block"
              type="submit"
              disabled={processing}
              value={processing ? ' ' : 'Subscribe'}
            />
            {processing && <Spinner small />}
          </div>
        </Form>
      </div>
    );

    if (this.isZipcodeFailurePopup() && user) {
      info = (
        <div className={`${style.content}__info`}>
          {titleDisplay && <h3>{titleDisplay}</h3>}
          <p>We will email you when we support shipping to your area.</p>
        </div>
      );
    }

    return (
      <div className={style.content}>
        {!desktop ? (
          <ReactPicture
            className={`${style.content}__image`}
            src={imgMobile}
            alt="castlery newsletter"
            loader={{ ratio: 0.51 }}
          />
        ) : (
          <div
            style={{
              minHeight: '380px',
              backgroundImage: `url(${imgDesktop})`,
            }}
            className={`${style.content}__image`}
          />
        )}
        {info}
        <button type="button" className={`${style.content}__close btn`} onClick={() => close()}>
          <ReactSVG name="close" />
        </button>
      </div>
    );
  }
}
