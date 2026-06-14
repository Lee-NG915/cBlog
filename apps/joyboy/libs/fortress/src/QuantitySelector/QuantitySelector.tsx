import * as React from 'react';
import { Box, Input, IconButton } from '@mui/joy';
import type { SxProps } from '@mui/joy/styles/types';
import { AddCircle, DoNotDisturbOn } from '../Icons';
import { Loading } from '../Loading/Loading';

export interface QuantitySelectorProps {
  /**
   * 默认值
   * @default 0
   */
  defaultValue?: number;
  /**
   * 当前值
   * @description当传入 value 属性时，组件进入受控模式，组件内部的 currentValue 由外部传入的 value 决定
   */
  value?: number;
  /**
   * 最小值
   * @default 0
   */
  min?: number;
  /**
   * 最大值
   * @default 9999999
   */
  max?: number;
  /**
   * 步长
   * @default 1
   */
  step?: number;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 是否显示加载状态
   * @default false
   * @description 当loading为true时，中间显示加载指示器而不是数字，同时加减按钮禁用
   */
  loading?: boolean;
  /**
   * 值变化时的回调
   */
  loadingTheme?: 'light' | 'dark';
  onChange?: (value: number) => void;
  /**
   * 组件样式
   */
  sx?: SxProps;
  /**
   * Data selenium id for the minus button
   */
  minusDataSeleniumId?: string;
  /**
   * Data selenium id for the plus button
   */
  plusDataSeleniumId?: string;
}

export const QuantitySelector = React.forwardRef<HTMLDivElement, QuantitySelectorProps>(function QuantitySelector(
  props,
  ref
) {
  const {
    defaultValue = 0,
    value: controlledValue,
    min = 0,
    max = 9999999,
    step = 1,
    disabled = false,
    loading = false,
    loadingTheme = 'dark',
    onChange,
    minusDataSeleniumId = 'minus-button',
    plusDataSeleniumId = 'plus-button',
    sx,
    ...other
  } = props;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<number>(defaultValue);

  const currentValue = isControlled ? controlledValue : internalValue;

  const handleIncrement = () => {
    if (disabled || loading || currentValue >= max) return;
    const newValue = Math.min(currentValue + step, max);
    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const handleDecrement = () => {
    if (disabled || loading || currentValue <= min) return;

    const newValue = Math.max(currentValue - step, min);
    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  // 同步受控值到内部状态
  React.useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        ...sx,
      }}
      {...other}
    >
      <IconButton
        variant="plain"
        color="neutral"
        disabled={disabled || loading || currentValue - step < min}
        onClick={handleDecrement}
        aria-label="减少"
        data-selenium={minusDataSeleniumId}
        sx={{
          padding: 0,
          '--Icon-fontSize': '24px',
          '&:not(:disabled)': {
            '--Icon-color': 'var(--fortress-palette-warning-500)',
            '&:hover': {
              '--Icon-color': 'var(--fortress-palette-primary-600)',
              backgroundColor: 'transparent',
            },
          },
          '&:disabled': {
            '--Icon-color': 'var(--fortress-palette-brand-mono-500)',
          },
        }}
      >
        <DoNotDisturbOn />
      </IconButton>

      {loading ? (
        <Loading size="sm" theme={loadingTheme} />
      ) : (
        <Input
          value={currentValue}
          readOnly
          disabled={disabled}
          variant="plain"
          aria-label="Quantity Input"
          sx={(theme) => ({
            minWidth: '24px',
            width: 'fit-content', // 使用 fit-content 适应内容
            maxWidth: 'none', // 移除最大宽度限制
            flex: '0 0 auto', // 不拉伸，不收缩，自动大小
            p: 0,
            border: 'none',
            '--Input-minHeight': '24px',
            ...theme.typography.body1,
            color: 'var(--fortress-palette-brand-mono-900)',
            // 覆盖主题中的响应式 padding (max-width: 599.95px)
            [theme.breakpoints.down('sm')]: {
              padding: 0,
            },
            '& input': {
              textAlign: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              minWidth: '24px', // input 元素最小宽度
              width: '100%', // 填充父容器
              boxSizing: 'content-box', // 使用 content-box 让 size 属性生效
            },
            '&::before, &::after': {
              display: 'none',
            },
            '&:focus-within': {
              outline: 'none',
              boxShadow: 'none',
              border: 'none',
            },
            '&:hover': {
              border: 'none',
              color: 'var(--fortress-palette-brand-mono-900)',
            },
          })}
          slotProps={{
            input: {
              'aria-valuenow': currentValue,
              'aria-valuemin': min,
              'aria-valuemax': max,
              tabIndex: -1,
              onFocus: (e) => e.target.blur(),
              style: { userSelect: 'none' },
              onSelect: (e) => e.preventDefault(),
              // 使用 size 属性根据字符数动态调整宽度
              size: Math.max(String(currentValue).length, 1),
            },
          }}
        />
      )}

      <IconButton
        variant="plain"
        color="neutral"
        disabled={disabled || loading || currentValue + step > max}
        onClick={handleIncrement}
        aria-label="增加"
        data-selenium={plusDataSeleniumId}
        sx={{
          padding: 0,
          '--Icon-fontSize': '24px',

          '&:not(:disabled)': {
            '--Icon-color': 'var(--fortress-palette-warning-500)',
            '&:hover': {
              '--Icon-color': 'var(--fortress-palette-primary-600)',
              backgroundColor: 'transparent',
            },
          },
          '&:disabled': {
            '--Icon-color': 'var(--fortress-palette-brand-mono-500)',
          },
        }}
      >
        <AddCircle />
      </IconButton>
    </Box>
  );
});
QuantitySelector.displayName = 'QuantitySelector';
export default QuantitySelector;
