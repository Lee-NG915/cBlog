import React from 'react';
import usePatchElement from './usePatchElement';
export interface ElementsHolderRef {
  patchElement: ReturnType<typeof usePatchElement>[1];
}

export const ElementsHolder = React.memo(
  React.forwardRef<ElementsHolderRef>((_props, ref) => {
    const [elements, patchElement] = usePatchElement();
    /**
     * https://react.dev/reference/react/useImperativeHandle
     * Usage :
     * - Exposing a custom ref handle to the parent component
     * - Exposing your own imperative methods
     * - 父组件可以通过传入ref来调用子组件的方法 => ChildrenRef.current.patchElement
     */
    //定义要暴露的方法
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useImperativeHandle(ref, () => ({ patchElement }), []);
    return <>{elements}</>;
  })
);

/**
 * useImperativeHandle 是 React 中的一个自定义 Hook，用于自定义 React 组件的暴露（Ref）接口。
 * 它允许您在函数式组件中自定义将组件实例中的某些方法或属性暴露给父组件或其他外部代码。
 * 这对于与命令式的 DOM 操作或外部库集成非常有用。
 */
ElementsHolder.displayName = 'ElementsHolder';
