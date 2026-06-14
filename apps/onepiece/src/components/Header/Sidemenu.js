import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import ReactPicture from 'components/ReactPicture';
import { CountrySelector } from 'components/CountrySelector';
import Logo from 'components/Logo';
import PropTypes from 'prop-types';
import { getCategories, getUrl, getPageByKey } from 'pages';
import { isBusinessHours } from 'utils/time';
import Bem from 'utils/bem';
import { useFrame } from 'hooks/frame';
import { getCustomerServiceApi } from 'utils/customer-service/sdk-loader';
import { IconButton } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import TrackableLink from './TrackableLink';

import style from './style.scss';
import { isOriginalLink } from './GlobalNav';

const Sidemenu = (props, context) => {
  const frame = useFrame();
  const menu = useSelector((state) => state.marketing.menu);
  const user = useSelector((state) => state.auth.user);
  const [chosenIndex, setChosenIndex] = useState(0);
  const block = new Bem(style.sideMenu);

  const categories = useMemo(() => {
    const allSaleCategory = {
      key: 'custom__all-sale',
      name: 'All Sale',
      url: getUrl('sale'),
      thumbnail:
        'https://res.cloudinary.com/castlery/image/upload/v1648716501/knight/category/mobile_thumbnail/ALL_AllSale_Mobile.jpg',
      children: [],
    };
    const saleCategory = {
      key: 'custom__sale',
      name: getPageByKey('sale')?.metaTitle || 'Sale',
      disable: menu.data.sale.disable,
      url: '',
      thumbnail:
        'https://res.cloudinary.com/castlery/image/upload/v1648716481/knight/category/mobile_thumbnail/SaleSideMenu_Mobile.jpg',
      children: menu.data['sale-text']
        ? menu.data['sale-text'].blocks
            .map((b) => ({
              key: b._uid,
              name: b.title,
              url: b.link,
              thumbnail: b.image_url,
              children: [],
            }))
            .concat(allSaleCategory)
        : [allSaleCategory],
    };
    const newInCategory = {
      key: 'custom__new',
      name: 'New In',
      disable: menu.data.new.disable,
      children: menu.data['new-category']
        ? menu.data['new-category'].blocks.map((b) => ({
            key: b._uid,
            name: b.title,
            url: b.link,
            thumbnail: b.image_url,
            children: [],
          }))
        : [],
    };
    const designToolsCategory = {
      key: 'design_tools',
      name: 'Inspiration & Tools',
      children: menu.data['design-category']
        ? menu.data['design-category'].blocks.map((b) => ({
            key: b._uid,
            name: b.title,
            url: b.link,
            thumbnail: b.image_url,
            children: [],
          }))
        : [],
    };
    if (newInCategory.children.length === 0) {
      return getCategories().concat(designToolsCategory).concat(saleCategory);
    }
    return getCategories().concat(designToolsCategory).concat(saleCategory).concat(newInCategory);
  }, [menu]);

  const go = (e, url) => {
    // e.preventDefault();
    // context.router.push(url);
    setTimeout(() => frame.removeModal(), 0);
  };

  const chooseCategory = (index) => {
    if (index !== chosenIndex) {
      setChosenIndex(index);
    }
  };

  const isBusinessHour = isBusinessHours();

  const chosenCategory = categories[chosenIndex];
  return (
    <nav className={block} aria-label="Main">
      <div className={block.elm('header')}>
        <div className={block.elm('header').elm('country')}>
          <CountrySelector mode="simple" size="sm" />
        </div>
        <div className={block.elm('header').elm('logo')}>
          <Logo />
        </div>
        <IconButton className="btn" onClick={() => frame.removeModal()}>
          <Close fontSize="xl3" />
        </IconButton>
      </div>

      <div className={block.elm('body')}>
        <div className={block.elm('main')}>
          <ul className={block.elm('main').elm('top')}>
            {categories.map(
              (c, index) =>
                c.name &&
                !c.disable && (
                  <li key={index}>
                    <a
                      role="button"
                      tabIndex="0"
                      aria-haspopup="true"
                      aria-expanded={index === chosenIndex ? 'true' : 'false'}
                      aria-controls="menuItems"
                      style={{ outline: 'none', ...(c.key === 'custom__sale' && { color: '#bf5419' }) }}
                      className={index === chosenIndex ? 'is-selected' : ''}
                      onClick={() => chooseCategory(index)}
                    >
                      {c.name}
                    </a>
                  </li>
                )
            )}
            {/* TODO 这里是不是不可以复用 redux header 里面的数据呢？
            改不动 等下一期才弄吧
            */}
            {menu.data['new-category']?.blocks.length === 0 && (
              <li>
                <TrackableLink
                  path={getUrl('new')}
                  // onClick={(e) => go(e, getUrl('new'))}
                  menuType="primary_menu"
                  text="New"
                  className={categories.length === chosenIndex ? 'is-selected' : ''}
                  // onClick={() => chooseCategory(categories.length)}
                >
                  New In
                </TrackableLink>
              </li>
            )}
          </ul>

          {global.__globalNav.length > 0 && (
            <ul className={block.elm('main').elm('center')}>
              {global.__globalNav.map((item, index) => {
                if (!item) return;
                return (
                  <li key={index}>
                    <TrackableLink
                      path={item.linkProps.path}
                      menuType={item.linkProps.menuType}
                      text={item.linkProps.text}
                      target={item.linkProps.target}
                      isOriginal={isOriginalLink(item.linkProps.path)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <ul className={block.elm('main').elm('bottom')}>
            <li>
              <TrackableLink path={getUrl('wishlist')} menuType="user_menu" text="Wishlist" />
            </li>

            <li>
              <TrackableLink path={user ? getUrl('profile') : getUrl('login')} menuType="user_menu" text="My Account" />
            </li>

            <li>
              <div
                onClick={() => {
                  frame.removeModal();
                  setTimeout(() => {
                    getCustomerServiceApi()
                      .then((api) => api.openChat())
                      .catch(() => {});
                  }, 500);
                }}
                role="button"
              >
                <TrackableLink
                  menuType="user_menu"
                  text={isBusinessHour ? 'Chat Online' : 'Leave a message'}
                  isOriginal
                >
                  {isBusinessHour ? (
                    <>
                      Chat <span className={block.elm('main').elm('online')}>Online</span>
                    </>
                  ) : (
                    'Leave a message'
                  )}
                </TrackableLink>
              </div>
            </li>
          </ul>
        </div>

        {chosenCategory && (
          <div className={block.elm('sub')} id="menuItems">
            <div className={block.elm('sub').elm('items')}>
              {chosenCategory.children.map((page) => {
                const { name } = page;
                return (
                  <TrackableLink
                    className={block.elm('sub').elm('item')}
                    key={page.key}
                    path={page.url}
                    onClick={(e) => go(e, page.url)}
                    menuType="primary_menu"
                    text={name}
                  >
                    <p>{name}</p>
                    <ReactPicture src={page.thumbnail || page.image} alt={name} />
                  </TrackableLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

Sidemenu.contextTypes = {
  router: PropTypes.object,
};
export default Sidemenu;
