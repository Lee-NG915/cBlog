import React from 'react';
import PropTypes from 'prop-types';
import { getPageByKey } from 'pages';
import TrackableLink from './TrackableLink';

import style from './style.scss';

const CategoryList = ({ categoryKey }) => {
  const page = getPageByKey(categoryKey);

  if (page && page.children) {
    const subLinks = page.children;
    if (subLinks.length < 1) {
      return null;
    }
    // console.log('subLinks =====', subLinks);
    return (
      <div className={`${style.menuPanel}__menu`}>
        <div className={`${style.menuPanel}__menu__header`}>
          {page.name}
          {page.new && <span>New</span>}
        </div>
        <ul className={`${style.menuPanel}__menu__newList`}>
          {subLinks.map((l, index) => (
            <li key={index}>
              <TrackableLink path={l.url} menuType="primary_menu" text={l.name} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};
CategoryList.propTypes = {
  categoryKey: PropTypes.string.isRequired,
};

export default CategoryList;
