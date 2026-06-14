import { EcEnv } from '@castlery/config';
import { Box, Slider, SliderProps } from '@castlery/fortress';
import { useEffect, useState } from 'react';
import { useInstantSearch, useRange, UseRangeProps } from 'react-instantsearch';

export interface RangeSliderProps extends UseRangeProps {
  sliderProps?: Omit<SliderProps, 'min' | 'max' | 'value' | 'onChange'>;
  formatMinMaxLabels?: (value: number, isMin: boolean) => string;
}

export function RangeSlider(props: RangeSliderProps) {
  const { sliderProps = {}, formatMinMaxLabels, ...rangeProps } = props;
  // skipSuspense: true on useRange because we're using multiple hooks in this component
  // According to Algolia docs: all hooks except the last one should have skipSuspense: true
  const { setIndexUiState } = useInstantSearch();
  const { start, range, canRefine } = useRange(rangeProps, { $$widgetType: 'custom.rangeSlider' });

  // Use default value 0 to handle undefined cases
  const minValue = range.min !== undefined ? range.min : 0;
  const maxValue = range.max !== undefined ? range.max : 0;

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
    }
  };

  const handleChangeCommitted = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      // 这里不使用 range 的原因是因为 range 传递的数据到最后总是值保留一个,无法保留两个值
      setIndexUiState((prevIndexUiState) => ({
        ...prevIndexUiState,
        // 重置分页到第一页，当用户使用筛选器时应该从第一页开始显示结果
        page: 1,
        range: {
          ...prevIndexUiState.range,
          [rangeProps.attribute]: `${newValue[0]}:${newValue[1]}`,
        },
      }));
    }
  };

  // Format a value based on the formatMinMaxLabels prop or fall back to default
  const format = (value: number, isMin: boolean) => {
    if (formatMinMaxLabels) {
      return formatMinMaxLabels(value, isMin);
    }
    return `${value}`;
  };

  // Generate marks only when min and max values are different
  const sliderMarks =
    minValue !== maxValue
      ? [
          { value: minValue, label: format(minValue, true) },
          { value: maxValue, label: format(maxValue, false) },
        ]
      : [{ value: minValue, label: format(minValue, true) }];

  // No custom slider props overrides for formatters
  const isPOS = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS';
  return (
    <Box
      sx={{
        mx: isPOS ? 3 : 10,
        my: isPOS ? 1.5 : 2,
      }}
    >
      <Slider
        aria-label={rangeProps.attribute}
        marks={sliderMarks}
        value={value as number[]}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        min={minValue}
        max={maxValue}
        valueLabelDisplay="auto"
        disabled={!canRefine}
        {...sliderProps}
      />
    </Box>
  );
}
