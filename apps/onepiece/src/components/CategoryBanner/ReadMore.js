import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

const ReadMore = ({ content, columns }) => {
  const targetRef = useRef();
  useEffect(() => {
    const target = targetRef?.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList[entry.target.scrollHeight > entry.contentRect.height ? 'add' : 'remove']('truncated');
      }
    });

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, []);

  return (
    <div className={style.readMore}>
      <input type="checkbox" id="expanded" />
      <div className={`${style.readMore}__target`} ref={targetRef} style={{ '-webkit-line-clamp': columns }}>
        {content}
      </div>
      <label htmlFor="expanded">read more</label>
    </div>
  );
};

ReadMore.propTypes = {
  content: PropTypes.string,
  columns: PropTypes.string,
};

export default ReadMore;
