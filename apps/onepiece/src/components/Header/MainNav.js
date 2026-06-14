import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import { getCategories, getUrl, removeKnightPrefix, getPageByKey } from 'pages';
import PropTypes from 'prop-types';
import { Stack } from '@castlery/fortress';
import CategoryList from './CategoryList';
import LinkPicture from './LinkPicture';
import TrackableLink from './TrackableLink';
import style from './style.scss';

const MenuBanners = ({ className, loading, data }) => (
  <div className={classNames(`${style.menuPanel}__col`, className)}>
    {loading && (
      <div className={`${style.menuPanel}__loading`}>
        <Spinner />
      </div>
    )}
    {data && (
      <div className={`${style.menuPanel}__imageBlock`}>
        {data.map((b) => (
          <LinkPicture
            key={b._uid}
            link={b.link}
            image={{
              imageUrl: b.image_url,
              imageTitle: b.title,
              actionText: b.action_text,
            }}
          />
        ))}
      </div>
    )}
  </div>
);
MenuBanners.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  data: PropTypes.array,
};

const MenuPanelWrapper = ({ children }) => (
  <Stack
    direction="row"
    px={{
      md: 2,
      lg: 4,
    }}
    py={4}
    justifyContent="space-between"
  >
    {children}
  </Stack>
);
MenuPanelWrapper.propTypes = {
  children: PropTypes.node,
};

// 因为之前是 css 的 hover 等 来控制 animation， 不好做延时操作，所以改成了 js 控制 animation 的开始和结束
// 本来想做父元素集合监听的，但是 data-label 有重复的，不好区分，怕影响到其他的T_T，先改成元素自身监听

const MainNav = ({ location, menu, forwardRef }) => {
  const topCategories = getCategories();
  const [hoverTab, setHoverTab] = useState();
  const timer = useRef();
  const handleMouseEnterEle = (label) => {
    clearTimeout(timer.current);
    timer.current = null;
    // const label = e.target.getAttribute('data-label');
    setHoverTab(label);
  };
  const handleMouseLeaveEle = () => {
    if (timer.current) {
      return;
    }
    timer.current = setTimeout(() => {
      setHoverTab(undefined);
    }, 400);
  };
  return (
    <ul
      className={classNames(`${style.headerDesktop}__mainLinks`, {
        'has-more': false,
      })}
      key={location.pathname}
      ref={forwardRef}
      data-selenium="menu"
    >
      {!menu.data.new.disable && (
        <li
          onMouseEnter={() => handleMouseEnterEle('New')}
          onFocus={() => handleMouseEnterEle('New')}
          onMouseLeave={handleMouseLeaveEle}
        >
          <TrackableLink path={getUrl('new')} menuType="primary_menu" text="New">
            New
          </TrackableLink>
          {(menu?.data?.['new-category']?.blocks.length > 0 || menu?.data?.new?.blocks.length > 0) && (
            <div className={classNames(style.menuPanel, hoverTab === 'New' && style.liAnimation)}>
              <MenuPanelWrapper>
                {menu?.data?.['new-category']?.blocks.length > 0 && (
                  <div className={`${style.menuPanel}__col--left`}>
                    <div className={`${style.menuPanel}__menu`}>
                      <p className={`${style.menuPanel}__menu__header`}>New</p>

                      {menu?.data?.['new-category']?.blocks && (
                        <ul className={`${style.menuPanel}__menu__newList`}>
                          {menu.data['new-category'].blocks.map((b) => (
                            <li key={b._uid}>
                              <TrackableLink
                                path={b.link}
                                menuType="primary_menu"
                                text={b.title}
                                isOriginal={/^https?:\/\//.test(b.link)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <MenuBanners
                  loading={menu?.loading}
                  data={menu?.data?.new?.blocks.slice(0, 3)}
                  className={`${style.menuPanel}__col--right`}
                />
              </MenuPanelWrapper>
            </div>
          )}
        </li>
      )}
      {topCategories.map(
        (item, i) =>
          item.name && (
            <li
              key={i}
              onMouseEnter={() => handleMouseEnterEle(item.name)}
              onFocus={() => handleMouseEnterEle(item.name)}
              onMouseLeave={handleMouseLeaveEle}
            >
              <TrackableLink path={item?.url} menuType="primary_menu" text={item.name} />

              <div className={classNames(style.menuPanel, hoverTab === item.name && style.liAnimation)}>
                <MenuPanelWrapper>
                  <div className={`${style.menuPanel}__col--left`}>
                    <CategoryList categoryKey={item.key} />
                  </div>
                  <MenuBanners
                    loading={menu?.loading}
                    data={menu?.data?.[removeKnightPrefix(item.key)]?.blocks.slice(0, 3)}
                    className={`${style.menuPanel}__col--right`}
                  />
                </MenuPanelWrapper>
              </div>
            </li>
          )
      )}
      <li
        onMouseEnter={() => handleMouseEnterEle('Design Tools')}
        onFocus={() => handleMouseEnterEle('Design Tools')}
        onMouseLeave={handleMouseLeaveEle}
      >
        <TrackableLink
          // path={getUrl('room-designer')}
          menuType="primary_menu"
          className={`${style.menuPanel}__menuitem`}
          style={{
            cursor: 'pointer',
          }}
        >
          Inspiration & Tools
        </TrackableLink>

        <div
          onMouseEnter={() => handleMouseEnterEle('Design Tools')}
          onFocus={() => handleMouseEnterEle('Design Tools')}
          onMouseLeave={handleMouseLeaveEle}
          className={classNames(style.menuPanel, hoverTab === 'Design Tools' && style.liAnimation)}
        >
          <MenuPanelWrapper>
            <div className={`${style.menuPanel}__col--left`}>
              <div className={`${style.menuPanel}__menu`}>
                <p className={`${style.menuPanel}__menu__header`}>Inspiration & Tools</p>

                {menu?.data?.['design-category']?.blocks && (
                  <ul className={`${style.menuPanel}__menu__newList`}>
                    {menu.data['design-category'].blocks.map((b) => (
                      <li key={b._uid}>
                        <TrackableLink
                          path={b.link}
                          menuType="primary_menu"
                          text={b.title}
                          isOriginal={/^https?:\/\//.test(b.link)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <MenuBanners
              loading={menu?.loading}
              data={menu?.data?.['design-tools']?.blocks.slice(0, 3)}
              className={`${style.menuPanel}__col--right`}
            />
          </MenuPanelWrapper>
        </div>
      </li>

      {!menu.data.sale.disable && (
        <li
          onMouseEnter={() => handleMouseEnterEle('Sale')}
          onFocus={() => handleMouseEnterEle('Sale')}
          onMouseLeave={handleMouseLeaveEle}
        >
          <TrackableLink
            className={classNames(`${style.menuPanel}__sale`)}
            path={getUrl('sale')}
            menuType="primary_menu"
            text={getPageByKey('sale')?.metaTitle || 'Sale'}
          />

          <div className={classNames(style.menuPanel, hoverTab === 'Sale' && style.liAnimation)}>
            <MenuPanelWrapper>
              <div className={`${style.menuPanel}__col--saleLeft`}>
                <div className={`${style.menuPanel}__menu`}>
                  <p className={`${style.menuPanel}__menu__header`}>Sale</p>

                  {menu?.data?.['sale-category']?.blocks && (
                    <ul className={`${style.menuPanel}__menu__list`}>
                      {menu.data['sale-category'].blocks.map((b) => (
                        <li key={b._uid}>
                          <TrackableLink
                            path={b.link}
                            menuType="primary_menu"
                            text={b.title}
                            isOriginal={/^https?:\/\//.test(b.link)}
                          />
                        </li>
                      ))}
                      <li>
                        <TrackableLink path={getUrl('sale')} menuType="primary_menu" text="All Sale" />
                      </li>
                    </ul>
                  )}
                </div>

                <div className={`${style.menuPanel}__menu`}>
                  <p className={`${style.menuPanel}__menu__header`}>Limited Time Offers</p>

                  {menu?.data?.['sale-text']?.blocks && (
                    <ul className={`${style.menuPanel}__menu__list`}>
                      {menu.data['sale-text'].blocks.map((b) => (
                        <li key={b._uid}>
                          <TrackableLink path={b.link} menuType="primary_menu" text={b.title} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <MenuBanners
                loading={menu?.loading}
                data={menu?.data?.sale?.blocks.slice(0, 3)}
                className={`${style.menuPanel}__col--saleRight`}
              />
            </MenuPanelWrapper>
          </div>
        </li>
      )}
    </ul>
  );
};
MainNav.propTypes = {
  location: PropTypes.object,
  menu: PropTypes.object,
  forwardRef: PropTypes.object,
};
export default MainNav;
