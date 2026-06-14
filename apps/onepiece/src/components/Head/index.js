import React from 'react';
import PropTypes from 'prop-types';

const supportTag = ['link'];

const Head = ({ disableSSR, children }) => {
  if (__SERVER__ && !disableSSR) {
    const res = require('cls-hooked').getNamespace('castlery').get('res');
    res.insertedHeads = res.insertedHeads || {};
    React.Children.forEach(children, (ele) => {
      const { type } = ele;
      if (supportTag.includes(type)) {
        res.insertedHeads[type] = res.insertedHeads[type] || [];
        res.insertedHeads[type].push(ele);
      }
    });
  } else if (typeof window !== 'undefined' && disableSSR) {
    const head = document.querySelector('head');
    if (head) {
      React.Children.forEach(children, (ele) => {
        const { type } = ele;
        if (supportTag.includes(type)) {
          const tag = document.createElement(type);
          head.appendChild(tag);
        }
      });
    }
  }
  return null;
};

Head.defaultProps = {
  disableSSR: false,
};
Head.propTypes = {
  disableSSR: PropTypes.bool,
  children: PropTypes.node,
};

export default Head;
