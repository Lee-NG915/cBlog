import { useEffect, useRef, forwardRef } from 'react';
import MSelect, { SelectProps } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
export * from '@mui/joy/Option';
export * from '@mui/joy/Select';

export type DropdownProps<TValue extends {} = string, Multiple extends boolean = false> = Omit<
  SelectProps<TValue, Multiple>,
  'variant'
> & {
  /**
   * 样式变体
   * @default 'form'
   */
  variant?: 'borderplain' | 'form';
};

const Dropdown = forwardRef(function Dropdown<TValue extends {} = string, Multiple extends boolean = false>(
  props: DropdownProps<TValue, Multiple>,
  ref: React.Ref<HTMLButtonElement>
) {
  const { variant = 'form', ...restProps } = props;
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (selectRef.current) {
        if (selectRef.current.children.length > 0) {
          Array.from(selectRef.current.children).forEach((child) => {
            if (child.tagName === 'INPUT') {
              child.setAttribute('aria-label', 'input');
            }
          });
        }
      }
    } catch (error) {
      // Silently handle aria-label setting errors as they don't affect functionality
      // This is defensive programming for edge cases in DOM manipulation
    }
  }, [selectRef]);

  return (
    <MSelect
      ref={(node) => {
        // 设置内部 ref 用于业务逻辑
        (selectRef as any).current = node;
        // 透传外部 ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as any).current = node;
        }
      }}
      variant={variant}
      {...restProps}
    />
  );
});

// 添加静态属性
Dropdown.displayName = 'Dropdown';

// 创建带有静态属性的类型
const DropdownWithStatic = Dropdown as typeof Dropdown & {
  Option: typeof Option;
};
DropdownWithStatic.Option = Option;

export { DropdownWithStatic as Dropdown, Option as DropdownOption };
export default DropdownWithStatic;
