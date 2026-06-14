import React from 'react';
import PropTypes from 'prop-types';
import { RangeSlider } from 'searchkit/lib/components/ui/range/RangeSlider';

export default class IntRangeSlider extends React.Component {
  static propTypes = {
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
    onFinished: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      minValue: Math.floor(props.minValue),
      maxValue: Math.ceil(props.maxValue),
      min: Math.floor(props.min),
      max: Math.ceil(props.max),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { min, max, minValue, maxValue } = prevState;

    const newMin = Math.floor(nextProps.min);
    const newMax = Math.ceil(nextProps.max);
    const newMinValue = Math.floor(nextProps.minValue);
    const newMaxValue = Math.ceil(nextProps.maxValue);

    if (newMinValue !== minValue || newMaxValue !== maxValue || newMin !== min || newMax !== max) {
      return {
        minValue: newMinValue,
        maxValue: newMaxValue,
        min: newMin,
        max: newMax,
      };
    }

    return null;
  }

  getRealMinMax({ minValue, maxValue }) {
    const { min, max } = this.state;
    const { min: realMin, max: realMax } = this.props;
    let realMinValue = minValue;
    let realMaxValue = maxValue;
    if (minValue === min) {
      realMinValue = realMin;
    }
    if (maxValue === max) {
      realMaxValue = realMax;
    }
    return { min: realMinValue, max: realMaxValue };
  }

  onChange = ({ min: minValue, max: maxValue }) => {
    const { onChange } = this.props;
    onChange(this.getRealMinMax({ minValue, maxValue }));
  };

  onFinished = ({ min: minValue, max: maxValue }) => {
    const { onFinished } = this.props;
    onFinished(this.getRealMinMax({ minValue, maxValue }));
  };

  render() {
    const { min, max, minValue, maxValue } = this.state;
    return (
      <RangeSlider
        {...this.props}
        onChange={this.onChange}
        onFinished={this.onFinished}
        minValue={minValue}
        maxValue={maxValue}
        min={min}
        max={max}
      />
    );
  }
}
