import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ColorPalette } from 'utils/color';
import style from './style.scss';
import ReactSVG from '../ReactSVG';

export default class Rating extends Component {
  static propTypes = {
    rating: PropTypes.number,
    size: PropTypes.number,
    margin: PropTypes.number,
    className: PropTypes.string, // container class
    outerType: PropTypes.string, // background star type, value: fill | outline
    outerColor: PropTypes.string, // background star color
    innerType: PropTypes.string,
    innerColor: PropTypes.string,
  };

  static defaultProps = {
    rating: 0,
    size: 14,
    margin: 0,
    outerType: 'fill',
    innerType: 'fill',
    outerColor: ColorPalette.primary,
    innerColor: '#ccc',
  };

  render() {
    const { size, margin, rating, className, outerType, outerColor, innerType, innerColor } = this.props;

    let outerStar;
    let innerStar;

    if (outerType === 'fill') {
      outerStar = (
        <ReactSVG
          name="star"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: outerColor,
          }}
        />
      );
    } else {
      outerStar = (
        <ReactSVG
          name="star-outline"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: outerColor,
          }}
        />
      );
    }

    if (innerType === 'fill') {
      innerStar = (
        <ReactSVG
          name="star"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: innerColor,
          }}
        />
      );
    } else {
      innerStar = (
        <ReactSVG
          name="star-outline"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: innerColor,
          }}
        />
      );
    }

    const ratio = (rating * size + (2 * Math.floor(rating) + 1) * margin) / (5 * size + 10 * margin);

    return (
      <div
        className={classNames(style.wrapper, className)}
        style={{ marginLeft: `-${margin}px`, marginRight: `-${margin}px` }}
      >
        {innerStar}
        {innerStar}
        {innerStar}
        {innerStar}
        {innerStar}
        <div style={{ width: `${(ratio > 1 ? 1 : ratio) * 100}%` }}>
          {outerStar}
          {outerStar}
          {outerStar}
          {outerStar}
          {outerStar}
        </div>
      </div>
    );
  }
}
