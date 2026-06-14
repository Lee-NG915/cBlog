'use client';
import React, { useEffect } from 'react';
import { useForm, FormProvider, UseFormProps } from 'react-hook-form';
import { TFormValues, ValidatorsData, UseFormReturn, onSubmitFunc, DefaultFetcher } from '../types';
import { useResolver } from '../controls';

export type ControlOptions = UseFormProps<TFormValues, ValidatorsData>;
export type MethodsGetter = (methods: UseFormReturn<TFormValues, any, undefined>) => void;
interface FormControlProps {
  validators: ValidatorsData;
  defaultFetcher: DefaultFetcher;
  submit: onSubmitFunc;
  children: React.ReactNode;
  controlOptions?: ControlOptions;
  methodsGetter?: MethodsGetter;
  onWatch?: (values: TFormValues) => void;
  update?: (values: TFormValues) => { values: TFormValues | null; reset?: boolean };
}

const HookFormControl: React.FC<FormControlProps> = ({
  defaultFetcher,
  validators,
  submit = () => {},
  controlOptions = {},
  children,
  onWatch,
  update,
  methodsGetter,
}) => {
  const methods = useForm<TFormValues>({
    defaultValues: defaultFetcher /** 默认值，传入object或者fetcher，可异步 */,
    resolver: useResolver /** useResolver独立出去，实现校验功能解耦 */,
    mode: 'onChange' /** 表单状态的监听时机，设置为change，用于业务常用场景 */,
    criteriaMode: 'all',
    context: validators /** object类型，为了解耦，仅放入必须的validators */,
    delayError: 200 /** 节流 */,
    ...controlOptions /** 可传入options，重置默认的配置 */,
  });

  const handleValueChange = () => {
    if (onWatch) {
      onWatch(methods.getValues());
    }
  };

  useEffect(() => {
    if (typeof methodsGetter === 'function' && methods) {
      methodsGetter(methods);
    }
  }, [methodsGetter, methods]);

  useEffect(() => {
    if (update && typeof update === 'function') {
      const preValues = methods.getValues();
      const { values, reset = false } = update(preValues);
      if (values) {
        // 将undefined｜null转成空字符串，避免受控组件warning提示
        const result = Object.keys(values).reduce((acc, key) => {
          const value = values[key] ?? ''; //注意0的情况
          return { ...acc, [key]: value };
        }, {});
        reset ? methods.reset(result) : methods.reset({ ...preValues, ...result });
      }
    }
  }, [update, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} onChange={handleValueChange}>
        {children}
      </form>
    </FormProvider>
  );
};

export default HookFormControl;
