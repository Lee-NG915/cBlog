import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import { connect } from 'react-redux';
import { complete } from 'redux/modules/cart';
import { getUrl } from 'pages';
import { trackPayment } from 'utils/tracking';
import Spinner from 'components/Spinner';
import { Link } from 'react-router';
import { EVENT_CHECKOUT } from 'utils/track/constants';

import { Container } from '@castlery/fortress';
import Footer from './components/Footer';
import Header from './components/Header';

import style from './style.scss';

@connect(
  (state) => ({
    cart: state.cart,
  }),
  {
    complete,
    trackOrderComplete: (result) => (dispatch) => dispatch({ type: EVENT_CHECKOUT, result }),
  }
)
export default class Confirm2c2p extends React.Component {
  static propTypes = {
    cart: PropTypes.object,
    location: PropTypes.object,
    complete: PropTypes.func,
    trackOrderComplete: PropTypes.func,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    const { cart, complete, location, trackOrderComplete } = props;
    const { router } = context;

    const order = cart.data;

    if (__CLIENT__) {
      if (order && order.state === 'complete') {
        this.state = {
          error: '',
          loading: true,
        };

        trackPayment(order, 'instalment');

        trackOrderComplete({
          checkoutStep: 5,
          paymentMethod: 'instalment',
        });

        complete()
          .then(() => {
            router.replace(getUrl('checkout-success'));
          })
          .catch((error) => {
            this.setState({
              error: error.errors ? error.errors[0].detail : error.toString(),
              loading: false,
            });
          });
      } else {
        this.state = {
          error: location.query.error || '',
          loading: false,
        };
      }
    } else {
      this.state = {
        error: '',
        loading: true,
      };
    }
  }

  render() {
    const { pathname, search } = this.props.location;
    const { error, loading } = this.state;

    return (
      <div className={style.wrapper}>
        <Helmet path={pathname} />
        <Header />

        <div className={style.tctp}>
          <Container fixed>
            {loading ? (
              <div className={`${style.tctp}__loading`}>
                <div>
                  <Spinner />
                </div>
                <p>We're processing your order, please wait a second.</p>
              </div>
            ) : (
              <div className={`${style.tctp}__error`}>
                {error && <p>{error}</p>}
                <Link to={getUrl('checkout-payment')} className="btn btn-primary-outline">
                  Please Try Again
                </Link>
              </div>
            )}
          </Container>
        </div>

        <Footer />
      </div>
    );
  }
}
