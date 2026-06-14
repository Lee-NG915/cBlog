import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import style from './switch.scss';

const Switch = ({ id = 'Switch', disabled = false, defaultChecked = false, checked: propsChecked, onChange }) => {
  const [checked, setChecked] = useState(defaultChecked);
  const handleChange = useCallback(() => {
    setChecked(!checked);
    if (onChange) {
      onChange(!checked);
    }
  }, [checked, onChange]);

  useEffect(() => {
    if (propsChecked !== undefined) {
      setChecked(propsChecked);
    }
  }, [propsChecked, setChecked]);

  return (
    <div className={style.switch}>
      <input id={id} type="checkbox" disabled={disabled} checked={checked} onChange={handleChange} />
      <label htmlFor={id} />
    </div>
  );
};

Switch.propTypes = {
  id: PropTypes.string,
  disabled: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Switch;
