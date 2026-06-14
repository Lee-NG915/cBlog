import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setUnreadCount } from 'redux/modules/fixSideBar';
import {
  initFreshchat,
  //  loadFreshchat
} from 'helpers/Freshchat';

import SvgIcon from 'components/SvgIcon';
import Script from 'components/Script';
import { addressFeatureInCA } from 'config';
import style from './style.scss';

@connect(
  (state) => ({
    unreadCount: state.fixSideBar.unreadCount,
    user: state.auth.user,
  }),
  { setUnreadCount }
)
export default class FixSidebar extends React.Component {
  static propTypes = {
    unreadCount: PropTypes.number.isRequired,
    setUnreadCount: PropTypes.func.isRequired,
    user: PropTypes.object,
  };

  state = {
    // this componenet won't render on server side
    // so use this state to make sure the client won't render it
    // on initial rendering to enable ssr
    active: false,
  };

  getUnreadCount = () => {
    const { setUnreadCount: setFunction } = this.props;
    window.fcWidget?.on('unreadCount:notify', ({ count }) => {
      setFunction(count);
    });
  };

  openChat = () => {
    window.fcWidget?.open();
  };

  render() {
    const { active } = this.state;
    const { unreadCount, user } = this.props;

    if (addressFeatureInCA) {
      return null;
    }

    return (
      <>
        <Script
          src="https://wchat.freshchat.com/js/widget.js"
          strategy="lazyOnload"
          onLoad={() => {
            initFreshchat(user);
            this.getUnreadCount();
          }}
          onReady={() => {
            this.setState({
              active: true,
            });
          }}
        />
        {active ? (
          <div className={style.sidebar}>
            <button type="button" onClick={this.openChat} className="btn">
              <div className={`${style.sidebar}__content`}>
                {/* <SvgIcon name="chat" /> */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                  <path
                    d="M4.667 14H14v-1.333H4.667V14zm0-4h14.666V8.667H4.667V10zm0-4h14.666V4.667H4.667V6zM0 22.767v-20.6c0-.623.206-1.14.617-1.551C1.028.206 1.544 0 2.167 0h19.666c.623 0 1.14.205 1.551.616.41.412.616.928.616 1.55V16.5c0 .622-.205 1.14-.616 1.55-.412.411-.928.617-1.55.617H4.1l-4.1 4.1zm1.333-3.234l2.2-2.2h18.3a.812.812 0 0 0 .6-.233.812.812 0 0 0 .234-.6V2.167a.812.812 0 0 0-.234-.6.812.812 0 0 0-.6-.234H2.167a.812.812 0 0 0-.6.234.812.812 0 0 0-.234.6v17.366zm0-17.366v-.834 18.2V2.167z"
                    fill="#F6F3E7"
                  />
                </svg>
                <span>Chat</span>
              </div>
              {unreadCount > 0 && <div className={`${style.sidebar}__unread`}>{unreadCount}</div>}
            </button>
          </div>
        ) : (
          ''
        )}
      </>
    );
  }
}
