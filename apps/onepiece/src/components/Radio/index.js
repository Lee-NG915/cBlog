import React, { useEffect, useState, useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import RadioContext from './context';
import style from './style.scss';

export const Radio = (props) => {
  const {
    className = '',
    disabled = false,
    checked = false,
    shape = 'button',
    value = '',
    onChange = () => {},
    children,
    ...rest
  } = props;

  const [checkedStatement, setCheckedStatement] = useState(checked);
  const [valueStatement, setValueStatement] = useState(value);
  const [disabledStatement, setDisabledStatement] = useState(disabled);
  const context = useContext(RadioContext);
  useEffect(() => {
    setDisabledStatement(disabled);
    setValueStatement(value);
    setCheckedStatement(checked);
  }, [disabled, value, checked]);

  const renderButton = () => {
    const btnClass = classNames({
      [`${style.radio}__button`]: true,
      [`${style.radio}__button--active`]: checkedStatement,
      // [`${style.radio}__button--disabled`]: disabledStatement,
    });

    return <div className={btnClass}>{children}</div>;
  };

  const renderRadioItem = () => {
    if (shape === 'button') {
      return renderButton();
    }
    // if(shape === "xxx"){}
  };

  const handleClick = (e) => {
    if (disabledStatement || checkedStatement) return;
    onChange?.(e);
    context?.onChange(valueStatement);
  };

  return (
    <>
      <div className={`${style.radio} ${className}`} role="button" onClick={handleClick} {...rest}>
        {renderRadioItem()}
      </div>
    </>
  );
};
Radio.displayName = 'Radio';
Radio.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  // shape: PropTypes.oneOf(['button']),
  shape: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
