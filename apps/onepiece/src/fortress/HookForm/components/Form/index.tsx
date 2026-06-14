import React from 'react';
import { Box } from 'fortress';
import {
  HookFormControl,
  HookFormItemControl,
  useSliceMap,
  type ControlOptions,
  type MethodsGetter,
} from '../../controls';
import { FormData, DefaultFetcher, onSubmitFunc, FiledReturns, ValidatorsData } from '../../types';

export interface FormProps {
  form: FormData;
  validators: ValidatorsData /** Validator for form */;
  children?: React.ReactNode;
  formSxProps?: {};
  controlOptions?: ControlOptions;
  submit: onSubmitFunc;
  defaultFetcher?: DefaultFetcher;
  methodsGetter?: MethodsGetter;
  autoFocus?: boolean;
}

/**
 * @param FormProps
 * @returns
 */
const MFrom: React.FC<FormProps> = ({
  form,
  validators,
  formSxProps,
  children,
  controlOptions = {},
  methodsGetter,
  submit,
  defaultFetcher = {},
  autoFocus = false,
}) => {
  React.useEffect(() => {
    if (autoFocus) {
      const canFocusEle = () => {
        const ele = document.querySelector('form');
        if (ele) {
          const firstInput = ele.querySelector('input, select, textarea,button,checkbox') as HTMLInputElement;
          firstInput && firstInput.focus();
        }
      };
      canFocusEle();
    }
  }, [autoFocus]);
  return (
    <HookFormControl
      validators={validators}
      defaultFetcher={defaultFetcher}
      submit={submit}
      methodsGetter={methodsGetter}
      controlOptions={controlOptions}
    >
      <Box sx={formSxProps}>
        {form?.map((item) => {
          const { key, insertReactNode, appendReactNode, joyProps, sliceWrapperJoyProps, show, ...rest } = item;
          const SliceComponent = useSliceMap(item.type);
          const itemControl = { key, label: item.label, required: validators[key]?.required, show: show };
          return (
            <Box key={key} {...(sliceWrapperJoyProps || {})}>
              {insertReactNode && insertReactNode()}
              <HookFormItemControl key={key} data={itemControl}>
                {(field: FiledReturns, isError: boolean) => (
                  <SliceComponent
                    field={field}
                    joyProps={{
                      ...(joyProps || {}),
                      ...(isError
                        ? {
                            sx: {
                              ...(joyProps?.sx || {}),
                              '--Input-focusedHighlight': 'var(--fortress-palette-brand-upsdellRed-200)',
                              borderColor: 'var(--fortress-palette-brand-upsdellRed-200)',
                            },
                          }
                        : {}),
                    }}
                    {...rest}
                  />
                )}
              </HookFormItemControl>
              {typeof appendReactNode === 'function' && appendReactNode()}
            </Box>
          );
        })}
      </Box>
      {children}
    </HookFormControl>
  );
};

export default MFrom;
