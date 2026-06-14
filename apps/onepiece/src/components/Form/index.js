import React, { useCallback } from 'react';
import Formsy, { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { EVENT_FORM_SUBMIT, EVENT_SIGN_IN, EVENT_SIGN_UP } from 'utils/track/constants';
import Switch from './Switch';

export { default as FloatInput } from './FloatInput';
export { default as Input } from './Input';
export { default as FloatSelect } from './FloatSelect';
export { default as BasicSelect } from './BasicSelect';
export { default as Select } from './Select';
export { default as Checkbox } from './Checkbox';
export { default as FloatTextarea } from './FloatTextarea';
export { default as Radio } from './Radio';
export { default as Rating } from './Rating';
export { default as PhoneNumberInput } from './PhoneNumberInput';

export const FormsySwitch = withFormsy(Switch);
FormsySwitch.propTypes = {
  ...Switch.propTypes,
  ...formsyTypes,
};

function Form(props) {
  const { formName, onValidSubmit } = props;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const submitWrap = useCallback(
    (...rest) => {
      if (typeof onValidSubmit !== 'function') {
        return;
      }

      const promise = onValidSubmit(...rest);

      // GTM tracking only when onValidSubmit returns a Promise
      if (promise instanceof Promise) {
        promise
          .then((data) => {
            if (formName === 'User Registration') {
              dispatch({
                type: EVENT_SIGN_UP,
                result: {
                  action: formName,
                  user: data?.user,
                  tokens: data?.access_token,
                },
              });
            } else if (formName === 'User Sign In') {
              dispatch({
                type: EVENT_SIGN_IN,
                result: {
                  action: formName,
                  user: data,
                },
              });
            } else {
              const { type, email } = rest[0];
              dispatch({
                type: EVENT_FORM_SUBMIT,
                result: {
                  action: formName,
                  label: type || '',
                  method: email || '',
                },
              });
            }
          })
          .catch(() => null);
      }
    },
    [formName, onValidSubmit, user]
  );

  return <Formsy {...props} onValidSubmit={submitWrap} />;
}

Form.propTypes = {
  formName: PropTypes.string.isRequired,
  onValidSubmit: PropTypes.func,
};

export default Form;
