import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import Logo from 'components/Logo';
import PropTypes from 'prop-types';
import { Container } from '@castlery/fortress';
import style from './style.scss';

const Header = ({ breadcrumbBtnOnclick }) => {
  const menus = useMemo(
    () => [
      { link: '/our-story', text: 'Our story' },
      { link: '/blog', text: 'Blog' },
      { link: '/', text: 'Main Website' },
    ],
    []
  );

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const { body } = document;
    if (visible) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }, [visible]);

  return (
    <Container component="header" className={`${style.header}`}>
      <a href="/" className={`${style.header}__logo`}>
        <Logo />
      </a>
      <div className={`${style.header}__nav`}>
        {menus.map((menu, index) => (
          <a key={index} href={menu.link}>
            {menu.text}
          </a>
        ))}
      </div>
      <div
        className={`${style.header}__breadcrumbBtn`}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        <svg width="19" height="8" viewBox="0 0 19 8">
          <g strokeWidth="1.5" fill="none" fillRule="evenodd" strokeDasharray="0,0" stroke="black">
            <path d="M0 1h19M0 7h19" />
          </g>
        </svg>
      </div>

      <div
        className={classNames(`${style.header}__menuModal`, {
          visible,
        })}
        onClick={() => {
          setVisible(false);
        }}
      >
        <div className={`${style.header}__menuList`}>
          {menus.map((menu, i) => (
            <a key={i} href={menu.link}>
              {menu.text}
            </a>
          ))}
        </div>
      </div>
    </Container>
  );
};

Header.propTypes = {
  breadcrumbBtnOnclick: PropTypes.func,
};

export default Header;
