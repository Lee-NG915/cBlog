import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { load } from 'redux/modules/order';
import { connect } from 'react-redux';
import Spinner from 'components/Spinner';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import { formatTime, isOutdated } from 'utils/time';
import { toPrice } from 'utils/number';
import { GhostArrowBtn } from 'components/Button';
import { withUseBreakpoints } from 'utils/page';
import ItemList from './ItemList';
import style from './style.scss';

@connect(
  (state) => ({
    order: state.order,
  }),
  { load }
)
@withUseBreakpoints
export default class Orders extends Component {
  static propTypes = {
    order: PropTypes.object.isRequired,
    load: PropTypes.func.isRequired,
    breakpoints: PropTypes.object,
  };

  componentDidMount() {
    this.props.load();
  }

  reload() {
    this.props.load();
  }

  render() {
    const { order, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    let main;
    let giveaway;
    if (order.loaded) {
      if (order.data) {
        if (order.data.length === 0) {
          // no order is made, show go shopping msg
          main = (
            <div className={`${style.order}__helper`}>
              <p>You've not made any order yet.</p>

              <GhostArrowBtn href={__BASE_URL__} text="Go Shopping" size="medium" />
            </div>
          );
        } else {
          // only show giveaway when there are items are available for review
          giveaway =
            order.data.some((o) =>
              o.shipments?.some((shipment) => !(shipment.state !== 'delivered' || !shipment.has_unreviewed_items))
            ) && !isOutdated('2023-01-25 00:00', '2023-03-01 00:00') ? (
              <div className={`${style.record}__giveaway`}>
                For a limited time only, submit a review and stand a chance to win a $1,000 Castlery gift voucher!* Each
                submitted review counts as 1 chance in the giveaway.{' '}
                <a href={`${__BASE_ROUTE__}/promo-terms`} target="_blank">
                  Learn more.
                </a>
              </div>
            ) : null;
          main = order.data.map((o) => (
            <div className={style.record} key={o.id}>
              <div className={`${style.record}__header`}>
                <div>
                  <div className={`${style.record}__header__cell`}>
                    <label>Order No</label>
                    <span>{o.reference_number}</span>
                  </div>
                  <div className={`${style.record}__header__cell`}>
                    <label>Order Placed</label>
                    <span>{formatTime(o.completed_at)}</span>
                  </div>
                  {desktop && (
                    <div className={`${style.record}__header__cell`}>
                      <label>Total</label>
                      <span>{toPrice(o.total, true)}</span>
                    </div>
                  )}
                  <div className={`${style.record}__header__cell`}>
                    <label>Order Status</label>
                    <span>{o.order_status ? o.order_status.split('_').join(' ') : ''}</span>
                  </div>
                </div>
                {desktop && <Link to={`${getUrl('order-details')}?number=${o.number}`}>View Details</Link>}
              </div>
              <ItemList order={o} />
              {!desktop && (
                <div className={`${style.record}__actions`}>
                  <Link to={`${getUrl('order-details')}?number=${o.number}`} className="btn">
                    View Details
                  </Link>
                </div>
              )}
            </div>
          ));
        }
      } else {
        // no data is loaded which means something went wrong
        main = (
          <div className={`${style.order}__helper`}>
            <p>Oops! Something went wrong.</p>
            <button type="button" className="btn btn-primary" onClick={this.reload.bind(this)}>
              Try Again
            </button>
          </div>
        );
      }
    } else {
      // placeholder to take up space
      main = <div className={`${style.order}__placeholder`} />;
    }

    return (
      <div className={style.order}>
        <h1 className={style.header}>My Order History</h1>
        <div className={`${style.order}__container`}>
          {giveaway}
          {main}
          {order.loading && (
            <div className={`${style.order}__loading`}>
              <Spinner />
            </div>
          )}
        </div>
      </div>
    );
  }
}
