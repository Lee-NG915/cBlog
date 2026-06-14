import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { getUrl } from 'pages';
import PropTypes from 'prop-types';
import Logo from 'components/Logo';
import { useSelector, useDispatch } from 'react-redux';
import { FrameContext } from 'containers/Frame/FrameContext';
import { Menu, ShoppingBag, Search } from '@castlery/fortress/Icons';
import { Badge, IconButton } from '@castlery/fortress';
import { EVENT_CLICK_CART_ICON } from 'utils/track/constants';
import Sidemenu from './Sidemenu';
import style from './style.scss';
import { UserMenu } from './UserMenu';

const Header = ({ border, borderColor, needSearchBar }, { router }) => {
  const cart = useSelector((state) => state.cart);
  const cartPending = cart.loading || cart.creating || cart.processing;
  const frame = useContext(FrameContext);
  const [searching, setSearching] = useState(false);
  const dispatch = useDispatch();

  const handleSideMenu = useCallback(() => {
    frame.addModal(<Sidemenu />, 'side', {
      dismiss: () => frame.removeModal(),
      position: 'left',
      maxWidth: 600,
    });
  }, [frame]);

  const handleSearch = useCallback(() => {
    setSearching(true);
    frame.openModal('search', {
      dismiss: () => {
        frame.removeModal();
        setSearching(false);
      },
    });
  }, [frame]);

  const cartClick = useCallback(() => {
    dispatch({
      type: EVENT_CLICK_CART_ICON,
    });
    if (router.pathname === '/cart' || cartPending) {
      return;
    }
    router.push(getUrl('cart'));
  }, [router, cartPending, dispatch]);

  return (
    <div
      className={classNames(style.header, { 'is-searching': searching })}
      style={border ? { borderBottom: `1px solid ${borderColor || '#e3e3e3'}` } : {}}
    >
      <div className={`${style.header}__left`}>
        <IconButton
          data-selenium="header-menu"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="menu"
          aria-label="Navigation"
          onClick={handleSideMenu}
        >
          <Menu />
        </IconButton>

        {needSearchBar && (
          <IconButton
            size="md"
            title="search"
            type="button"
            data-selenium="header-search"
            className={classNames({
              'is-hidden': searching,
            })}
            onClick={handleSearch}
          >
            <Search />
          </IconButton>
        )}
      </div>

      <Link
        href={`https://www${
          __APPLICATION_ENV__.includes('test') ? '-test' : __APPLICATION_ENV__.includes('uat') ? '-uat' : ''
        }.castlery.com/${__COUNTRY__.toLocaleLowerCase()}/`}
        className={`${style.header}__logo`}
      >
        <Logo />
      </Link>

      <div className={`${style.header}__right`}>
        <UserMenu />
        <IconButton
          size="md"
          data-selenium="header-cart"
          aria-label="cart"
          aria-haspopup="true"
          aria-expanded="false"
          className={classNames({
            'is-loading': cartPending,
          })}
          onClick={cartClick}
          sx={{
            '.MuiBadge-badge': {
              '--Badge-ring': '0',
              '--variant-solidBg': '#844025',
              color: '#f6f3e7',
            },
          }}
        >
          <Badge badgeContent={cart.data?.item_count > 0 ? cart.data.item_count : null} loading={!!cartPending}>
            <ShoppingBag />
          </Badge>
        </IconButton>
      </div>
    </div>
  );
};
Header.propTypes = {
  border: PropTypes.bool,
  borderColor: PropTypes.string,
  needSearchBar: PropTypes.bool,
};
Header.defaultProps = {
  needSearchBar: true,
};
Header.contextTypes = {
  router: PropTypes.object,
};
export default Header;
