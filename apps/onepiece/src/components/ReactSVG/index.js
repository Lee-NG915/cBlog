/**
 *
 * Component to render an svg icon
 *
 * To add an icon:
 *   1. download an svg icon and compress it using 'svgo'
 *   2. put the svg's code into ./icons.svg, modify the format and give it an unique id
 *   3. Now you can use the icon by just put <ReactSVG name="xxx" />
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

// const icons = require('./icons.svg');

// if (__CLIENT__) {
//   const xhr = new XMLHttpRequest();
//   xhr.onreadystatechange = function () {
//     if (+xhr.readyState === 4 && +xhr.status === 200) {
//       // create svg element and insert to start of body
//       const div = document.createElement('div');
//       div.innerHTML = xhr.responseText;
//       const el = div.firstChild;
//       document.body.insertBefore(el, document.body.firstChild);
//     }
//   };
//   xhr.open('GET', icons);
//   xhr.send();
// }

export default class ReactSvg extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    label: PropTypes.string,
  };

  render() {
    const { name, role = 'img', label, ...rest } = this.props;

    return (
      <svg {...rest} role={role} aria-label={label || name}>
        <use xlinkHref={`#${name}`} />
      </svg>
    );
  }
}
