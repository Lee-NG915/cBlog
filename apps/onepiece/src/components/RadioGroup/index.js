import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RadioContext from '../Radio/context';
import style from './style.scss';

export const RadioGroup = (props) => {
  const {
    className,
    value,
    onChange,
    // textPosition,
    // direction,
    defaultValue,
    children,
    ...rest
  } = props;

  const [val2State, setVal2State] = useState(value);
  useEffect(() => {
    setVal2State(value);
  }, [value]);

  function validateChildChecked(child) {
    const checkedValue = val2State || defaultValue;
    if (checkedValue === null) return false;
    return checkedValue === child.props.value;
  }
  function cloneChildren() {
    return React.Children.map(children, (child, index) => {
      const childChecked = validateChildChecked(child);
      if (child.type.displayName !== 'Radio') {
        return React.cloneElement(child);
      }
      return React.cloneElement(child, {
        // textPosition,
        checked: childChecked,
        // onChange: handleChildChange,
      });
    });
  }
  return (
    <RadioContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        onChange: (val) => {
          onChange?.(val);
        },
      }}
    >
      <div className={`${style.radiogroup}`} {...rest}>
        {cloneChildren()}
      </div>
    </RadioContext.Provider>
  );
};
RadioGroup.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
