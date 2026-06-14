import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getUrl } from 'pages';
import { logout } from 'redux/modules/auth';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';
import ReactSVG from 'components/ReactSVG';
import TrackableLink from 'components/Header/TrackableLink';
import Rewards from 'containers/Rewards/component';
import { withUseBreakpoints } from 'utils/page';
import { Box, Container, Link, Typography } from '@castlery/fortress';
import config from 'config';
import ProfileNew from './ProfileNew';
import Orders from './Orders';
import Vouchers from './Vouchers';
import VouchersV2 from './VouchersV2';
import Address from './Address';
import OrderDetails from './OrderDetails';
import OrderDetailsV2 from './OrderDetailsV2';
import Reviews from './Reviews';
import style from './style.scss';

@withUseBreakpoints
export default class Account extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    breakpoints: PropTypes.object,
  };

  state = {
    onShowTips: false,
  };

  // use array to allow multiple pages share the same menu item
  pages = [
    {
      url: [getUrl('profile')],
      name: 'Account',
      icon: <ReactSVG name="avatar" />,
    },
    {
      url: [getUrl('orders'), getUrl('order-details')],
      name: 'Orders',
      icon: <ReactSVG name="shop-cart-outline" />,
    },
    {
      url: [getUrl('vouchers')],
      name: 'Vouchers',
      icon: <ReactSVG name="voucher" />,
    },
    __YOTPO_ENABLED__ && {
      url: [getUrl('account-rewards')],
      name: 'Rewards',
      icon: <ReactSVG name="rewards" />,
      type: 'thin',
    },
    {
      url: [getUrl('address')],
      name: 'Address',
      icon: <ReactSVG name="address-book" />,
    },
    {
      url: [getUrl('my-reviews')],
      name: 'Reviews',
      icon: <ReactSVG name="star-outline" />,
    },
  ].filter((item) => item.url);

  pageComponents = __YOTPO_ENABLED__
    ? [
        [ProfileNew],
        [Orders, config.enableNewPromotion ? OrderDetailsV2 : OrderDetails],
        config.enableNewPromotion ? [VouchersV2] : [Vouchers],
        [Rewards],
        [Address],
        [Reviews],
      ]
    : [
        [ProfileNew],
        [Orders, config.enableNewPromotion ? OrderDetailsV2 : OrderDetails],
        config.enableNewPromotion ? [VouchersV2] : [Vouchers],
        [Address],
        [Reviews],
      ];

  componentDidMount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      this.updateTabMenu(this.props.location.pathname);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { breakpoints = {} } = nextProps;
    const { desktop } = breakpoints;
    if (!desktop && nextProps.location.pathname !== this.props.location.pathname) {
      this.updateTabMenu(nextProps.location.pathname);
    }
  }

  updateTabMenu(pathname) {
    // update ht e tab location if on mobile
    // default width of tab is 38%
    const matchedIndex = this.pages.findIndex((p) => p.url.findIndex((url) => url === pathname) > -1);

    const ratio = (this.menu.children[0].offsetWidth / this.menu.offsetWidth) * 100;
    const x = Math.min(matchedIndex * ratio, ratio * (this.pages.length + 1) - 100) / 100;
    this.menu.scrollLeft = this.menu.offsetWidth * x;
  }

  handleModeChange = (mode) => {
    if (mode === 'view') {
      this.setState({ onShowTips: true });
    } else {
      this.setState({ onShowTips: false });
    }
  };

  render() {
    const { location } = this.props;
    const { pathname } = location || {};
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const activeIndex = this.pages.findIndex((p) => p.url.findIndex((url) => url === pathname) > -1);
    const activeLink = this.pages[activeIndex].url.findIndex((url) => url === pathname);

    const sidemenu = (
      <div className={style.sidemenu}>
        <ul className={`${style.sidemenu}__list`} ref={(c) => (this.menu = c)}>
          {Object.keys(this.pages).map((key, index) => (
            <li
              className={classNames({
                'is-active': index === activeIndex,
                'is-thin': this.pages[key]?.type === 'thin',
              })}
              key={key}
            >
              <TrackableLink path={this.pages[key].url[0]} menuType="user_menu" text={this.pages[key].name}>
                {this.pages[key].icon}
                {this.pages[key].name}
              </TrackableLink>
            </li>
          ))}
          <li>
            <TrackableLink menuType="user_menu" text="Log Out" onClick={logout} isOriginal>
              <ReactSVG name="logout" />
              Log Out
            </TrackableLink>
          </li>
        </ul>
      </div>
    );

    const Module = this.pageComponents[activeIndex][activeLink];

    return (
      <div>
        <Helmet path={pathname} />
        <Header />

        {!desktop && sidemenu}
        <Container
          sx={{
            display: 'flex',
            py: (theme) => ({
              md: theme.spacing(6),
              lg: theme.spacing(10),
            }),
          }}
        >
          {desktop && sidemenu}
          <div className={style.body} style={{ paddingLeft: desktop ? (activeIndex === 0 ? 0 : '50px') : undefined }}>
            {activeIndex === 0 && (
              <ProfileNew
                onChangeMode={(mode) => {
                  this.handleModeChange(mode);
                }}
              />
            )}
            {activeIndex !== 0 && <Module location={location} />}
            {this.state.onShowTips && activeIndex === 0 && (
              <Box
                sx={{
                  marginTop: 4,
                  marginLeft: 1,
                  borderTop: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
                }}
              >
                <Typography
                  sx={{
                    color: (theme) => theme.palette.brand.charcoal[500],
                    padding: desktop ? '32px 48px' : '16px 0',
                  }}
                >
                  The birthday reward is an annual reward and will only be awarded to The Castlery Club members who have
                  made at least 1 purchase before and have given their birthday information at least 7 days prior to the
                  start of the month. All standard
                  <Link
                    href={`/${__COUNTRY__.toLocaleLowerCase()}${getUrl('promo-terms')}`}
                    sx={{
                      textDecoration: 'underline',
                      marginLeft: 0.5,
                      marginRight: 0.5,
                      color: (theme) => theme.palette.brand.charcoal[500],
                      '&:hover': {
                        color: (theme) => theme.palette.brand.charcoal[500],
                      },
                    }}
                  >
                    Terms and Conditions
                  </Link>
                  apply.
                </Typography>
              </Box>
            )}
          </div>
        </Container>
        <Footer />
      </div>
    );
  }
}
