'use client';
import { JSXElementConstructor, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Box, ClickAwayListener, ModalClose, Tooltip, TooltipProps, useBreakpoints, tooltipClasses } from '../..';
import { MultipleDatePicker, MultipleDatePickerProps } from './components/MultipleDatePicker';
import { RangeDatePicker, RangeDatePickerProps } from './components/RangeDatePicker';
import { SingleDatePicker, SingleDatePickerProps } from './components/SingleDatePicker';
import { YMPicker, YMPickerProps } from './components/YMPicker';

export type { DateRange } from 'react-day-picker';

export interface DatePickerBaseProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: TooltipProps['placement'];
  actionComponent: (props: {
    ref: React.RefObject<HTMLButtonElement | HTMLInputElement>;
  }) => ReactElement<any, string | JSXElementConstructor<any>>;
  showCloseButton?: boolean;
}

export type DatePickerRestProps =
  | (SingleDatePickerProps & {
      mode: 'single';
      selected: Date | undefined;
    })
  | (MultipleDatePickerProps & {
      mode: 'multiple';
      selected: Date[] | undefined;
    })
  | (RangeDatePickerProps & {
      mode: 'range';
      selected: DateRange | undefined;
    })
  | (YMPickerProps & {
      mode: 'ym';
      selected: Date | undefined;
    });
/**
 * @interface DatePickerBaseProps
 * @interface DatePickerRestProps : https://daypicker.dev/api/type-aliases/DayPickerProps
 * @param header: React.ReactNode
 * @param footer: React.ReactNode
 * @param actionComponent: (props: any) => ReactElement<any, string | JSXElementConstructor<any>>
 * @param placement: TooltipProps['placement']
 * @param mode: 'single' | 'multiple' | 'range'
 * @param selected: Date | Date[] | DateRange | undefined
 * @returns
 */
export function DatePicker({
  mode,
  header,
  footer,
  actionComponent,
  placement,
  showCloseButton = false,
  ...datePickerProps
}: DatePickerBaseProps & DatePickerRestProps) {
  const { mobile } = useBreakpoints();
  const [open, setOpen] = useState(false);
  const actionRef = useRef<HTMLButtonElement | HTMLInputElement>(null);

  const focusListener = useCallback((e: Event) => {
    const target = e.target as HTMLElement;

    // TODO:  Input 被禁用依然会触发
    // 检查目标元素是否被禁用
    if ((target as any)?.disabled) {
      return;
    }

    // 检查是否有 Joy UI 的 disabled 类名（检查父元素）
    const disabledParent = target.closest('.Mui-disabled');
    if (disabledParent) {
      return;
    }

    setOpen(true);
  }, []);

  useEffect(() => {
    const element = actionRef.current;
    if (element) {
      element.addEventListener('focus', focusListener);
    }
    return () => {
      if (element) {
        element.removeEventListener('focus', focusListener);
      }
    };
  }, [actionRef, focusListener]);

  return (
    // Tooltip 在 MUI Joy/MUI Core 里是基于 Popper 实现的，它的 气泡内容是挂在 body 下的
    // ClickAwayListener（MUI 提供的工具组件）专门用来监听用户是否点击在子组件之外。
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        arrow
        disableHoverListener
        disableFocusListener
        disableTouchListener
        placement={placement}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={{
          [`&.${tooltipClasses.root}`]: {
            background: (theme) => theme.palette.brand.warmLinen[200],
          },
        }}
        title={
          <>
            {showCloseButton && (
              <ModalClose
                sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  zIndex: 9999,
                  cursor: 'pointer',
                }}
                onClick={() => setOpen(false)}
              />
            )}
            <Box
              sx={{
                ...(mobile
                  ? {
                      width: 342,
                      gap: 3,
                    }
                  : {
                      width: 468,
                      p: 2,
                      gap: 4,
                    }),
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',

                background: (theme) => theme.palette.brand.warmLinen[200],
              }}
            >
              {header}
              {mode === 'single' && <SingleDatePicker {...(datePickerProps as SingleDatePickerProps)} />}
              {mode === 'multiple' && <MultipleDatePicker {...(datePickerProps as MultipleDatePickerProps)} />}
              {mode === 'range' && <RangeDatePicker {...(datePickerProps as RangeDatePickerProps)} />}
              {mode === 'ym' && <YMPicker {...(datePickerProps as YMPickerProps)} />}
              {footer}
            </Box>
          </>
        }
      >
        {actionComponent({ ref: actionRef })}
      </Tooltip>
    </ClickAwayListener>
  );
}

export type DatePickerProps = Parameters<typeof DatePicker>[0];
