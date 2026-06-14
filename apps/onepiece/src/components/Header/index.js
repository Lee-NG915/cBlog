import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { loadIfNeeded as loadCart } from 'redux/modules/cart';
import { loadIfNeeded as loadWishlist } from 'redux/modules/wishlist';
import { loadIfNeeded as loadTheLookWishlist } from 'redux/modules/theLookWishlist';
import NoticeBar from 'components/NoticeBar';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import GlobalNav from './GlobalNav';

const Header = ({ border, borderColor, needSearchBar }) => {
  const dispatch = useDispatch();
  const isCastleryApp = useSelector((state) => state.browser.isCastleryApp);

  const { desktop: isDesktop } = useBreakpoints();

  useEffect(() => {
    dispatch(loadCart());
    dispatch(loadWishlist());
    dispatch(loadTheLookWishlist());
  }, [dispatch]);

  if (isCastleryApp) {
    return null;
  }

  return (
    <>
      <NoticeBar />
      {!isDesktop ? (
        <MobileHeader border={border} borderColor={borderColor} needSearchBar={needSearchBar} />
      ) : (
        <>
          <GlobalNav />
          <DesktopHeader border={border} borderColor={borderColor} />
        </>
      )}
    </>
  );
};

Header.propTypes = {
  border: PropTypes.bool,
  borderColor: PropTypes.string,
  needSearchBar: PropTypes.bool,
};

export default Header;
