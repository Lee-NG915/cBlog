'use client';

import * as React from 'react';
import { ClassValue } from 'clsx';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import { appendOwnerState, resolveComponentProps, mergeSlotProps } from '@mui/base/utils';
import { Simplify } from '@Mui/types';
import { ColorPaletteProp } from '@mui/joy/styles';

export type ApplyColorInversion<T extends { color?: ColorPaletteProp | 'inherit' }> = Simplify<T>;

/**
 * mergeSlotProps 公共类型
 */
export type WithCommonProps<T> = T & {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<any>;
};

type ExtractComponentProps<P> = P extends infer T | ((ownerState: any) => infer T) ? T : never;

/**
 *
 * @param name - 插槽名称 ('root' / 'startDecorator' / ...)
 * @param parameters - 一系列参数，用来合并 props、ownerState 处理
 * @returns [SlotComponent, slotProps]
 */
export default function useSlot<
  T extends string,
  ElementType extends React.ElementType,
  SlotProps,
  OwnerState extends {},
  ExternalSlotProps extends { component?: React.ElementType; ref?: React.Ref<any> },
  ExternalForwardedProps extends {
    component?: React.ElementType;
    slots?: { [k in T]?: React.ElementType };
    slotProps?: {
      [k in T]?: ExternalSlotProps | ((ownerState: OwnerState) => ExternalSlotProps);
    };
  },
  AdditionalProps,
  SlotOwnerState extends {}
>(
  name: T,
  parameters: (T extends 'root'
    ? { ref: React.ForwardedRef<any> } // root插槽要求一定要传ref
    : { ref?: React.ForwardedRef<any> }) & {
    /**
     * slot 默认的 className
     */
    className: ClassValue | ClassValue[];
    /**
     * slot 默认使用的组件，比如 styled('div')
     */
    elementType: ElementType;
    /**
     * 整个组件的 ownerState
     */
    ownerState: OwnerState;
    /**
     * 来自外部组件剩余 props (必须包括 component / slots / slotProps)
     */
    externalForwardedProps: ExternalForwardedProps;
    /**
     * 当需要像 useButton 那样注入事件处理器
     */
    getSlotProps?: (handlers: Record<string, any>) => WithCommonProps<SlotProps>;
    /**
     * slot 附加的额外 props
     */
    additionalProps?: WithCommonProps<AdditionalProps>;

    /**
     * 合并完 props 后,可对 slot 做最后状态检查,返回 slotOwnerState 并合并进 ownerState
     */
    getSlotOwnerState?: (
      mergedProps: AdditionalProps &
        SlotProps &
        ExternalSlotProps &
        ExtractComponentProps<Exclude<Exclude<ExternalForwardedProps['slotProps'], undefined>[T], undefined>>
    ) => SlotOwnerState;
    /**
     * 如果用户没覆盖这个 slot，则可以把 internalForwardedProps 传给该 slot
     */
    internalForwardedProps?: any;
  }
) {
  const {
    className,
    elementType: initialElementType,
    ownerState,
    externalForwardedProps,
    getSlotOwnerState,
    internalForwardedProps,
    getSlotProps,
    additionalProps,
    ref,
  } = parameters;

  const {
    component: rootComponent,
    slots = {} as Record<string, React.ElementType>,
    slotProps = {} as Record<string, any>,
    ...other
  } = externalForwardedProps;

  const elementType = slots[name] || initialElementType;

  const resolvedComponentsProps = resolveComponentProps(slotProps[name], ownerState);

  const { props: mergedProps, internalRef } = mergeSlotProps({
    className,
    getSlotProps,
    externalForwardedProps: name === 'root' ? other : undefined,
    externalSlotProps: resolvedComponentsProps,
    additionalProps,
  });

  const mergedRef = useForkRef(internalRef, resolvedComponentsProps?.ref, ref);

  const slotOwnerState = getSlotOwnerState ? getSlotOwnerState(mergedProps as any) : {};
  const finalOwnerState = { ...ownerState, ...slotOwnerState };

  const slotComponent = mergedProps.component;
  const LeafComponent = name === 'root' ? slotComponent || rootComponent : slotComponent;

  const props = appendOwnerState(
    elementType,
    {
      ...(name === 'root' && !rootComponent && !slots[name] && internalForwardedProps),
      ...(name !== 'root' && !slots[name] && internalForwardedProps),
      ...mergedProps,
      ...(LeafComponent && { as: LeafComponent }),
      ref: mergedRef,
    },
    finalOwnerState
  );

  Object.keys(slotOwnerState).forEach((propName) => {
    delete props[propName];
  });

  return [
    elementType as ElementType,
    props as {
      className: string;
      ownerState: ApplyColorInversion<OwnerState & SlotOwnerState>;
    } & AdditionalProps &
      SlotProps &
      ExternalSlotProps &
      ExtractComponentProps<Exclude<Exclude<ExternalForwardedProps['slotProps'], undefined>[T], undefined>>,
  ];
}
