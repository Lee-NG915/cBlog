import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import style from './style.scss';

const Select = ({
  register,
  label,
  name,
  options = [],
  notSelectable = false,
  setValue,
  getValues,
  isRequired = true,
  errors,
  defaultValue,
}) => {
  const keys = Object.keys(options);
  const values = Object.values(options);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const validation = {};
  if (isRequired) {
    validation.required = {
      value: true,
      message: `This field is mandatory`,
    };
  }

  const initialIndex = () => {
    const value = defaultValue || (getValues && getValues(label));
    if (value) {
      return keys.indexOf(value);
    }
    return -1;
  };

  useEffect(() => {
    const index = initialIndex();
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    function clickedOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
      }
    }
    window.addEventListener('click', clickedOutside);
    return () => {
      window.removeEventListener('click', clickedOutside);
    };
  }, [visible, label]);

  return (
    <div className={style.selectContainer} ref={wrapperRef}>
      <label htmlFor={label} className={`${visible && activeIndex !== -1 ? 'opacity1' : ''}`}>
        {name}
      </label>
      <button
        type="button"
        onClick={() => {
          setVisible(!visible);
        }}
        disabled={notSelectable}
      >
        <input
          {...register(label, validation)}
          className={`${notSelectable ? 'notSelectable' : ''}`}
          readOnly
          placeholder={name}
        />
        {!notSelectable && (
          <SvgIcon name="down-arrow-outline" color="dark-neutral" marginLeft={8} hoverColor="dark-accent" />
        )}
      </button>
      {errors[label] && <span role="alert">{errors[label].message}</span>}
      <div className={`${style.selectContainer}__options ${visible ? 'is-visible' : ''}`}>
        {values.map((value, index) => (
          <a
            role="option"
            aria-selected={activeIndex === index ? 'true' : 'false'}
            key={index}
            onMouseDown={() => {
              setValue(label, keys[index], { shouldValidate: true });
              setVisible(false);
              setActiveIndex(index);
            }}
            className={`${activeIndex === index ? 'is-active' : ''}`}
          >
            {value}
          </a>
        ))}
      </div>
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  register: PropTypes.func,
  options: PropTypes.object,
  type: PropTypes.string,
  isRequired: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.object,
  errors: PropTypes.object,
  autoComplete: PropTypes.string,
  notSelectable: PropTypes.bool,
  setValue: PropTypes.func,
  getValues: PropTypes.func,
  defaultValue: PropTypes.string,
};

export default Select;
