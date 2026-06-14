import React from 'react';

export function withNamedSelectContext(Context, name, select = (value) => value) {
  const currentName = name || 'context';
  return (Component) => {
    const forwardProps = (props) => (
      <Context.Consumer>
        {(values) => {
          const SelectValue = select(values);
          const obj = {};
          if (SelectValue) {
            obj[currentName] = SelectValue;
          }
          return <Component {...{ ...props, ...obj }} />;
        }}
      </Context.Consumer>
    );
    return forwardProps;
  };
}
