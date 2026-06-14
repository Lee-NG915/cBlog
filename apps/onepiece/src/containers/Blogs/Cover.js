import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import { formatDate } from 'utils/time';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import ReactPicture from 'components/ReactPicture';

import style from './style.scss';

const Cover = ({ blog, lazy = true }) => {
  const block = new Bem(style.cover);

  const link = `${blog.url}`;

  const image = (
    <ReactPicture
      className={block.elm('img').toString()}
      srcset={blog.bannerBackgroundImage}
      alt={blog.name}
      loader={{
        ratio: 0.68,
        sizes: ['0.3-md', '0.9-sm'],
      }}
      lazy={lazy}
    />
  );

  return (
    <div className={block}>
      <Link to={link}>{image}</Link>
      <h2>
        <Link to={link}>{blog.name}</Link>
      </h2>
      <p>{formatDate(blog?.publishedAt || new Date())}</p>
    </div>
  );
};

Cover.propTyeps = {
  blog: PropTypes.object.isRequired,
  lazy: PropTypes.bool,
};

export default Cover;
