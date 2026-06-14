import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { disableNotice } from 'redux/modules/notice';
import { connect } from 'react-redux';
import { hasSubscribed } from 'utils/cookies';
import ReactSVG from 'components/ReactSVG';
import { withUseBreakpoints } from 'utils/page';
import { globalFeatureInSG } from 'config';
import Notices from './Notices';
import Promotion from './Promotion';
import style from './style.scss';

@connect(
  (state) => ({
    user: state.auth.user,
    menu: state.marketing.menu,
    notice: state.notice,
    geolocation: state.geolocation.data,
  }),
  { disableNotice }
)
@withUseBreakpoints
export default class NoticeBar extends Component {
  static contextTypes = {
    frame: PropTypes.object,
  };

  static propTypes = {
    user: PropTypes.object,
    menu: PropTypes.object,
    notice: PropTypes.object,
    geolocation: PropTypes.object,
    disableNotice: PropTypes.func,
    breakpoints: PropTypes.object,
  };

  handlePermalink = (notice) => {
    const { frame } = this.context;
    if (notice.permalink === 'subscription') {
      frame.openModal('subscription', {
        type: 'NOTIFICATION_BANNER',
        title: notice.subscription_title || `Stay in touch!`,
        intro: notice.intro || 'Join our mailing list for the latest news, products, offers and more.',
        bannerDesktop: notice.banner_background_image,
        bannerMobile: notice.banner_background_image_mobile,
      });
    }
  };

  handleDelegateClick = (validNotices, target) => {
    if (!target) return;
    const permalinkNotice = [];
    const imageUrlNotice = [];
    validNotices.forEach((item) => {
      if (item.permalink) {
        permalinkNotice.push(item);
        imageUrlNotice.push(item);
      }
    });
    const tag = target.getAttribute('data-notice') || null;
    const uid = target.getAttribute('data-uid') || null;
    if (tag && uid) {
      if (tag === 'permalink') {
        const targetNotice = permalinkNotice.find((item) => item._uid === uid);
        this.handlePermalink(targetNotice);
      } else if (tag === 'image_url') {
        const targetNotice = imageUrlNotice.find((item) => item._uid === uid);
        this.handlePopup(targetNotice);
      }
    }
  };

  getValidNoticeBlock(notices, noPinnedDisable) {
    const { user, geolocation } = this.props;
    if (!notices || notices.blocks.length === 0) return null;
    const inRangeNotice = notices.blocks;
    const countdownNotice = inRangeNotice.find((notice) => notice.countdown_enabled);
    if (countdownNotice) return [countdownNotice];
    let validBlock;
    const pinnedNotice = inRangeNotice.find((block) => block.pinned);
    if (pinnedNotice) {
      validBlock = [pinnedNotice];
    } else {
      validBlock = inRangeNotice.filter((notice) => {
        if (noPinnedDisable) return false;

        if (notice.permalink === 'subscription') return !user && !hasSubscribed();

        if (globalFeatureInSG) return notice;

        return (
          !notice.region_code ||
          notice.region_code.length === 0 ||
          (geolocation.region_code &&
            notice.region_code.some((code) => code.toLowerCase() === geolocation.region_code.toLowerCase()))
        );
      });
    }
    return validBlock;
  }

  handlePopup = (notice) => {
    const { frame } = this.context;
    frame.openModal('container', {
      component: <Promotion image={notice.image_url} link={notice.link} />,
    });
  };

  dismissNotice() {
    const { disableNotice } = this.props;
    disableNotice();
  }

  render() {
    const { menu, notice, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (!notice.loaded || !menu || !menu.data) {
      return null;
    }

    const slug = !desktop ? 'notice-mobile' : 'notice';
    const notices = menu.data[slug];
    const validNotices = this.getValidNoticeBlock(notices, notice.disabled)?.slice(0, notices.limit_num || 3);

    return (
      <div className={style.notice}>
        {validNotices?.length ? (
          <div
            style={{
              display: 'flex',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              const target = e.target.closest('div[data-notice]');
              this.handleDelegateClick(validNotices, target);
            }}
          >
            <Notices notices={validNotices} handlePopup={this.handlePopup} handlePermalink={this.handlePermalink} />
          </div>
        ) : null}
        {validNotices?.length
          ? !validNotices.every((validNotice) => validNotice.countdown_enabled) &&
            !validNotices.every((validNotice) => validNotice.pinned) && (
              <button onClick={this.dismissNotice.bind(this)} type="button" className="btn">
                <ReactSVG name="close" />
              </button>
            )
          : null}
      </div>
    );
  }
}
