import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { getUrl } from 'pages';
import PropTypes from 'prop-types';
import Logo from 'components/Logo';
import { useSelector, useDispatch } from 'react-redux';
import { FrameContext } from 'containers/Frame/FrameContext';
import SearchBar from 'components/SearchBar';
import { Badge, Container, IconButton, Sheet, Stack, iconButtonClasses, Link } from '@castlery/fortress';
import { Favorite, Search, ShoppingBag } from '@castlery/fortress/Icons';
import { RouterLink } from 'components/RouterLink';
import { EVENT_CLICK_CART_ICON } from 'utils/track/constants';
import style from './style.scss';
import MainNav from './MainNav';
import { UserMenu } from './UserMenu';
import { TrackableLink } from './GlobalNav';

const Header = ({ border, borderColor }, { router }) => {
  const cart = useSelector((state) => state.cart);
  const cartPending = cart.loading || cart.creating || cart.processing;
  const wishlist = useSelector((state) => state.wishlist);
  const theLookWishlist = useSelector((state) => state.theLookWishlist);
  const menu = useSelector((state) => state.marketing.menu);
  const frame = useContext(FrameContext);
  const [searching, setSearching] = useState(false);
  const navRef = useRef();
  const searchBarRef = useRef();
  const dispatch = useDispatch();

  const location = {
    pathname: '/home',
  };

  const handleSearchBar = (visible) => {
    setSearching(visible);
  };

  const handleChangeSearchBar = useCallback(() => {
    const navEle = navRef?.current?.childNodes;
    const searchEle = searchBarRef?.current;
    const maskClass = `${style.headerDesktop}__maskText`;

    if (!navEle) return;
    if (searchEle && searching) {
      const { left: searchLeft } = searchEle.getBoundingClientRect();
      navEle.forEach((item) => {
        const { right } = item.getBoundingClientRect();
        const navItem = item?.children?.[0];

        if (right > searchLeft) {
          navItem.classList.add(maskClass);
        } else if (navItem.classList.contains(maskClass)) {
          navItem.classList.remove(maskClass);
        }
      });
    } else {
      navEle.forEach((item) => {
        const navItem = item?.children?.[0];
        if (navItem.classList.contains(maskClass)) {
          navItem.classList.remove(maskClass);
        }
      });
    }
  }, [searching]);
  const cartClick = useCallback(() => {
    dispatch({
      type: EVENT_CLICK_CART_ICON,
    });
    if (router.pathname === '/cart' || cartPending) {
      return;
    }
    router.push(getUrl('cart'));
  }, [router, cartPending, dispatch]);

  useEffect(() => {
    handleChangeSearchBar();
  }, [searching, handleChangeSearchBar]);

  useEffect(() => {
    window.addEventListener('resize', handleChangeSearchBar);
    return () => window.removeEventListener('resize', handleChangeSearchBar);
  }, [handleChangeSearchBar]);

  return (
    <Container
      sx={{
        position: 'relative',
        '--Badge-ring': 'none',
        '.MuiBadge-badge': {
          '--Badge-ring': 'none',
          '--variant-solidBg': '#844025',
          color: '#f6f3e7',
        },
      }}
    >
      <Stack className={style.headerDesktop} direction="row">
        <Link
          href={`${__BASE_URL__}`}
          aria-label="Go to homepage"
          sx={{
            width: '174px',
            mr: {
              xs: 2,
              lg: 4,
            },
            svg: {
              fill: '#844025',
            },
          }}
        >
          <Logo />
        </Link>
        <MainNav location={location} menu={menu} forwardRef={navRef} id="menu" />
        {/* /* ------------------------------------right-------------------------------------- */}
        <Stack
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{
            [`& .${iconButtonClasses.root}`]: {
              minWidth: '',
              paddingInline: 0,
            },
          }}
        >
          {/* TODO The outline of the search icon is obscured  */}
          <Sheet className={style.search}>
            <SearchBar
              isHidden={!searching}
              onClose={() => handleSearchBar(false)}
              className={`${style.search}__searchBar`}
              forwardRef={searchBarRef}
            />

            <IconButton
              size="md"
              title="search"
              type="button"
              data-selenium="header-search"
              className={classNames({
                'is-hidden': searching,
              })}
              onClick={() => handleSearchBar(true)}
            >
              <Search fontSize="xl3" />
            </IconButton>
          </Sheet>

          {/* Here is to avoid shaking. 
        The specific reason is still unknown, 
        and how css-in-js handles it is not yet known. */}
          <Sheet
            sx={{
              '--fortress-palette-background-surface': 'transparent',
            }}
          >
            <UserMenu />
          </Sheet>

          <IconButton
            component={TrackableLink}
            path={getUrl('wishlist')}
            menuType="user_menu"
            text="Wishlist"
            data-selenium="header-wishlist"
            size="md"
            aria-label="Go to Wishlist"
          >
            <Badge
              loading={wishlist.loading || wishlist.processing}
              badgeContent={
                wishlist.data?.length > 0 || theLookWishlist.data?.length > 0
                  ? wishlist.data.length + theLookWishlist.data.length
                  : null
              }
            >
              <Favorite fontSize="xl3" />
            </Badge>
          </IconButton>
          <IconButton
            size="md"
            role="button"
            data-selenium="header-cart"
            aria-label="cart"
            aria-haspopup="true"
            aria-expanded="false"
            className={classNames({
              'is-loading': cartPending,
            })}
            onClick={cartClick}
          >
            <Badge badgeContent={cart.data?.item_count > 0 ? cart.data.item_count : null} loading={!!cartPending}>
              <ShoppingBag fontSize="xl3" />
            </Badge>
          </IconButton>
        </Stack>
      </Stack>
    </Container>
  );
};
Header.propTypes = {
  border: PropTypes.bool,
  borderColor: PropTypes.string,
};
Header.contextTypes = {
  router: PropTypes.object,
};
export default Header;
