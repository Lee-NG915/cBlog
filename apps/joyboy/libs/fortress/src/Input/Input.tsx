import React, { useState, useCallback, useRef } from 'react';
import MInput, { InputProps as MInputProps } from '@mui/joy/Input';
import { Box } from '@mui/joy';
import { Close } from '../Icons';

export interface FortressInputProps extends MInputProps {
  /**
   * 是否显示清除按钮
   * @default false
   */
  clearable?: boolean;
  /**
   * 清除按钮点击时的回调
   */
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, FortressInputProps>(
  ({ clearable = false, onClear, value, defaultValue, onChange, endDecorator, ...rest }, ref) => {
    const [inputValue, setInputValue] = useState(value || defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    // 标记是否为清除按钮的点击，避免触发不必要的blur
    const isClearing = useRef(false);
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onChange?.(e);
      },
      [onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        // 阻止默认行为和事件冒泡
        e.preventDefault();
        e.stopPropagation();
        isClearing.current = true;
        // 清空输入值
        setInputValue('');

        // 通知外部输入变化
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(event);

        // 执行自定义清除回调
        onClear?.();

        // 让输入框重新获得焦点
        if (ref && 'current' in ref && ref.current) {
          ref.current.focus();
        }

        // 延迟重置标记，确保blur事件已经处理完
        setTimeout(() => {
          isClearing.current = false;
        }, 100);
      },
      [onChange, onClear, ref]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        rest.onFocus?.(e);
      },
      [rest]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // 如果是清除按钮触发的，不改变焦点状态
        if (isClearing.current) {
          e.preventDefault();
          return;
        }
        setIsFocused(false);
        rest.onBlur?.(e);
      },
      [rest]
    );

    // 控制清空按钮显示隐藏：有内容才显示
    const currentValue = value !== undefined ? value : inputValue;
    const showClearButton = clearable && !!currentValue && isFocused;

    // 构建一个复合endDecorator，包含原始endDecorator和clearButton
    const composedEndDecorator = showClearButton ? (
      <React.Fragment>
        <Box
          role="button"
          aria-label="清除输入"
          onClick={handleClear}
          onMouseDown={(e) => {
            // 阻止mouseDown事件，防止它触发输入框的blur
            e.preventDefault();
            e.stopPropagation();
          }}
          sx={{
            cursor: 'pointer',
            color: 'var(--fortress-palette-brand-mono-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            marginRight: endDecorator ? 4 : 0,
          }}
        >
          <Close sx={{ fontSize: '16px' }} />
        </Box>
        {endDecorator}
      </React.Fragment>
    ) : (
      endDecorator
    );

    return (
      <Box position="relative">
        <MInput
          ref={ref}
          endDecorator={composedEndDecorator}
          {...rest}
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          sx={{
            // 通过 sx 或 theme 变量注入 design token
            ...rest.sx,
          }}
        />
      </Box>
    );
  }
);

Input.displayName = 'FortressInput';
