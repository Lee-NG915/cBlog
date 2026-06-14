import { useEffect, useState } from 'react';
import { useRange, UseRangeProps } from 'react-instantsearch';
import { Slider, SliderProps } from '@castlery/fortress';

export interface RatingRangeSliderProps extends UseRangeProps {
  onDataChange?: (hasData: boolean) => void;
  sliderProps?: Omit<
    SliderProps,
    //  'min' | 'max'  |
    'value' | 'onChange' | 'marks'
  >;
  valueMappings: string[];
}

export function RatingRangeSlider(props: RatingRangeSliderProps) {
  const { onDataChange, sliderProps = {}, valueMappings, ...rangeProps } = props;
  const { start, range, canRefine, refine } = useRange(rangeProps);

  // Use default value 0 to handle undefined cases
  const minValue = range.min !== undefined ? range.min : 1;
  const maxValue = range.max !== undefined ? range.max : valueMappings.length;

  // Ensure from and to are numeric types and properly bounded
  let from = Number.isFinite(start[0]) ? Number(start[0]) : minValue;
  let to = Number.isFinite(start[1]) ? Number(start[1]) : maxValue;

  // Ensure values stay within bounds
  from = Math.max(minValue, from);
  to = Math.min(maxValue, to);

  // Ensure left value is never greater than right value
  if (from > to) {
    [from, to] = [to, from];
  }

  const [value, setValue] = useState([from, to]);

  // Notify parent component when canRefine changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(canRefine);
    }
  }, [canRefine, onDataChange]);

  useEffect(() => {
    // Ensure the state always respects the bounds and order
    let newFrom = Math.max(minValue, Number.isFinite(start[0]) ? Number(start[0]) : minValue);
    let newTo = Math.min(maxValue, Number.isFinite(start[1]) ? Number(start[1]) : maxValue);

    // Swap if left is greater than right
    if (newFrom > newTo) {
      [newFrom, newTo] = [newTo, newFrom];
    }

    setValue([newFrom, newTo]);
  }, [start, minValue, maxValue]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setValue(newValue);
      refine([newValue[0], newValue[1]]);
    }
  };

  // Create marks with text labels based on valueMappings
  const marks = valueMappings.map((label, index) => ({
    value: index + 1,
    label,
  }));

  return (
    <>
      <Slider
        // marks={marks}
        value={value as number[]}
        onChange={handleChange}
        // min={minValue}
        // max={maxValue}
        valueLabelDisplay="auto"
        disabled={!canRefine}
        step={1}
        getAriaValueText={(value) => valueMappings[value - 1] || ''}
        valueLabelFormat={(value) => valueMappings[value - 1] || ''}
        {...sliderProps}
      />
    </>
  );
}
