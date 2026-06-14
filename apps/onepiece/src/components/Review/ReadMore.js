import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import truncate from 'lodash/truncate';

import style from './style.scss';

const ReadMore = ({ content, maxLength = 300, mode = 'old', showLess = false, onClick, color, underline = false }) => {
  // show ellipsis when the length of content is over 300;
  const initialState = content.length >= maxLength;
  const [showEllipsis, setShowEllipsis] = useState(initialState);
  const [isReadMore, setIsReadMore] = useState(initialState);
  useEffect(() => {
    if (content.length >= maxLength) {
      setShowEllipsis(true);
    } else {
      setShowEllipsis(false);
    }
  }, [content, maxLength]);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
    // eslint-disable-next-line no-unused-expressions
    onClick && onClick(isReadMore);
  };

  const formattedContent = useMemo(
    () =>
      truncate(content, {
        length: maxLength,
        separator: /(,|\.)? +/,
        omission: ' ...',
      }),
    [maxLength, content]
  );

  return showEllipsis ? (
    <span>
      {isReadMore ? formattedContent : content}{' '}
      <a
        role="button"
        tabIndex="0"
        className={classNames({
          [`${style.message}__more`]: true,
          [`${style.message}__moreNew`]: mode === 'new',
        })}
        onClick={toggleReadMore}
        style={{ color, textDecoration: underline ? 'underline' : 'none' }}
      >
        {isReadMore ? 'Read more' : showLess ? 'Show less' : ''}
      </a>
    </span>
  ) : (
    content
  );
};

ReadMore.propTypes = {
  content: PropTypes.string,
  maxLength: PropTypes.number,
  mode: PropTypes.oneOf(['old', 'new']),
  showLess: PropTypes.bool,
  onClick: PropTypes.func,
  color: PropTypes.string,
  underline: PropTypes.bool,
};

export default ReadMore;
