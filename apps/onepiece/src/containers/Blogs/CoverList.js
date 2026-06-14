import React from 'react';
import PropTypes from 'prop-types';
import Cover from './Cover';

import style from './style.scss';

const CoverList = ({ blogs }) => (
  <div className={style.coverList}>
    {blogs.map((blog, i) => (
      <Cover key={blog.id} blog={blog} lazy={![0, 1].includes(i)} />
    ))}
  </div>
);

CoverList.propTypes = {
  blogs: PropTypes.array.isRequired,
};

export default CoverList;
