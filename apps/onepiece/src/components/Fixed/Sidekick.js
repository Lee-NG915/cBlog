// src/components/Fixed/Sidekick.js
// NOTE: The original Sidekick called navigate() (window.Gladly.navigate()) in componentDidMount
// for SPA page tracking. This was effectively a no-op since Gladly wasn't loaded yet at that point.
// The Customer Service SDK manages Gladly lifecycle internally but does not expose a navigate() API.
// If page tracking is needed, it should be handled after SDK init — tracked separately.
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCustomerServiceApi } from 'utils/customer-service/sdk-loader';
import { EVENT_INITIATE_CHAT } from 'utils/track/constants';
import { getDate } from 'utils/time';

@connect(
  (state) => ({
    user: state.auth.user,
  }),
  (dispatch) => ({
    trackInitChat: (result) => dispatch({ type: EVENT_INITIATE_CHAT, result }),
  })
)
export default class Sidekick extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    trackInitChat: PropTypes.func,
  };

  state = {
    initTime: 0,
    isTrack: false,
  };

  unsubscribers = [];

  componentDidMount() {
    this.setState({ initTime: getDate() });

    getCustomerServiceApi()
      .then((api) => {
        // Subscribe to SDK events
        this.unsubscribers.push(
          api.on('channel_opened', () => {
            this.trackInitChat();
          })
        );

        // Sync user if already logged in
        this.syncUser();
      })
      .catch((err) => {
        console.error('[CustomerService] SDK initialization failed:', err);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      this.syncUser();
    }
  }

  componentWillUnmount() {
    this.unsubscribers.forEach((fn) => {
      fn();
    });
    this.unsubscribers = [];
  }

  syncUser() {
    const user = this.props.user;
    if (!user) return;
    getCustomerServiceApi()
      .then((api) => {
        api.setUser({
          name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
          email: user.email,
        });
      })
      .catch(() => {});
  }

  trackInitChat() {
    const initTime = this.state.initTime;
    const isTrack = this.state.isTrack;
    if (isTrack) return;
    this.setState({ isTrack: true });
    const now = getDate();
    const duration = (now.diff(initTime) / 1000).toFixed();
    this.props.trackInitChat({
      pageUrl: window.location.href,
      label: duration,
    });
  }

  render() {
    return null;
  }
}
