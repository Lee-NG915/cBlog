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
  reset?: () => void;
  controlOptions?: ControlOptions;
  methodsGetter?: MethodsGetter;
}

const HookFormControl: React.FC<FormControlProps> = ({
  defaultFetcher,
  validators,
  submit = () => {},
  controlOptions = {},
  children,
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
  useEffect(() => {
    if (typeof methodsGetter === 'function' && methods) {
      methodsGetter(methods);
    }
  }, [methodsGetter, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)}>{children}</form>
    </FormProvider>
  );
};

export default HookFormControl;
