import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

/**
 * @description Collapse component
 * @prop {node} children - the content of collapse
 * @prop {node} header - the header of collapse
 * @prop {string} title - the title of collapse
 * @prop {boolean} defaultExpand - whether the collapse is expanded by default
 * @prop {boolean} border - whether the collapse has border
 * @returns {React.Component}
 */
const Collapse = ({ children, header, title = ' ', defaultExpand = false, border = true }) => {
  const contentRef = useRef(null);
  const [expand, setExpand] = useState(defaultExpand);
  const toggleCollapse = () => {
    setExpand(!expand);
    if (contentRef.current.style.maxHeight) {
      contentRef.current.style.maxHeight = null;
    } else {
      contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
    }
  };
  return (
    <div className={style.collapseV2}>
      <header
        className={`${style.collapseV2}__header ${expand ? 'active' : ''}`}
        style={!border ? { border: 'none' } : {}}
        onClick={toggleCollapse}
      >
        {header || <div className={`${style.collapseV2}__header__title`}>{title}</div>}
        <span className={`${style.collapseV2}__header__icon`} />
      </header>
      <section className={`${style.collapseV2}__content`} ref={contentRef}>
        <div style={{ padding: '15px 15px' }}>{children}</div>
      </section>
    </div>
  );
};
Collapse.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  title: PropTypes.string,
  defaultExpand: PropTypes.bool,
  border: PropTypes.bool,
};
export default Collapse;
